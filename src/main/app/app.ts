import nacl from 'tweetnacl';
import {
  AppError,
  assertIsDefined,
  bs62,
  INVITE_CODE_BYTES,
  ROOM_MSG_FP_DISP_LENGTH,
  ROOM_MSG_KEY_BYTES,
} from '../../shared';
import { Room } from '../../shared-web';
import { AppFirebase } from './firebase';
import { AppMsg } from './msg';

const BUILD_INFO = {
  src: '__BUILD_SRC__',
  repo: '__BUILD_REPO__',
  time: parseInt('__BUILT_TIME__'),
} as const;

interface RoomInfo {
  name: string;
  signKey: string;
  fp: string;
  adminKey?: string;
  author?: string;
}
type MyRooms = Record<string, RoomInfo>;

class RoomsManager {
  get() {
    return JSON.parse(localStorage.getItem('rooms') || '{}') as MyRooms;
  }
  set = (rooms: MyRooms) => {
    localStorage.setItem('rooms', JSON.stringify(rooms));
  };
  add(id: string, room: RoomInfo) {
    const rooms = this.get();
    if (!(id in rooms)) {
      rooms[id] = room;
      this.set(rooms);
    }
  }
  updateName(id: string, name: string) {
    const rooms = this.get();
    const info = rooms[id];
    if (info && info.name != name) {
      info.name = name;
      this.set(rooms);
    }
  }
  updateAuthor(id: string, author: string) {
    const rooms = this.get();
    const info = rooms[id];
    if (info && info.author != author) {
      info.author = author;
      this.set(rooms);
    }
  }
}

const roomsMan = new RoomsManager();

export class App {
  readonly buildInfo = BUILD_INFO;

  constructor(private appMsg: AppMsg, private appFirebase: AppFirebase) {}

  async init() {
    console.log('start app init');

    const apError = document.querySelector('ap-error');
    if (apError) {
      apError.msgs = this.appMsg.msgs.error;
    }
    await Promise.all([this.appFirebase.init()]);
  }

  async processLoading(f: () => Promise<void>) {
    const loading = document.querySelector('ap-loading');
    if (!loading) {
      alert('missing ap-loading');
      return;
    }
    loading.classList.add('show');
    try {
      await f();
    } catch (err) {
      if (err instanceof Error) {
        await this.showError(err);
      } else {
        await this.showError(new AppError(undefined, { err }));
      }
      throw err;
    } finally {
      loading.classList.remove('show');
    }
  }

  showError(error: Error) {
    const apError = document.querySelector('ap-error');
    if (!apError) {
      alert('missing ap-error');
      return;
    }

    apError.repo = this.buildInfo.repo;
    apError.msgs = this.appMsg.msgs.error;
    return apError.showError(error);
  }

  get msgs() {
    return this.appMsg.msgs;
  }

  isMyRoom(id: string) {
    return id in roomsMan.get();
  }

  isAdmin(id: string) {
    return !!roomsMan.get()[id]?.adminKey;
  }

  getAuthor(id: string) {
    return roomsMan.get()[id]?.author;
  }

  async createRoom(name: string) {
    const signKeys = genSignKey();
    const adminKeys = genSignKey();

    const result = await this.appFirebase.createRoom({
      method: 'CreateRoom',
      name,
      signKey: signKeys.pubKey,
      adminKey: adminKeys.pubKey,
    });

    const id = result.id;
    assertIsDefined(id);

    const fp = bs62.encode(nacl.randomBytes(nacl.sign.secretKeyLength));

    roomsMan.add(id, {
      name,
      fp,
      signKey: signKeys.secKey,
      adminKey: adminKeys.secKey,
    });
  }

  async loadRooms() {
    const rooms = [] as { id: string; name: string; room?: Room }[];

    for (const [id, info] of Object.entries(roomsMan.get())) {
      const room = await this.appFirebase.getRoom(id);

      if (room && info.name != room.name) {
        roomsMan.updateName(id, room.name);
        info.name = room.name;
      }

      rooms.push({ id, name: info.name, room });
    }

    return rooms;
  }

  async getRoom(id: string) {
    return this.appFirebase.getRoom(id);
  }

  async editRoom(id: string, name: string) {
    const roomInfo = roomsMan.get()[id];
    if (!roomInfo) {
      console.warn('not my room', id);
      return;
    }
    if (!roomInfo.adminKey) {
      console.warn('not admin', id);
      return;
    }

    const adminKey = bs62.decode(roomInfo.adminKey);

    const sign = nacl.sign.detached(new TextEncoder().encode(name), adminKey);

    const sign_bs62 = bs62.encode(sign);

    await this.appFirebase.editRoom({
      method: 'EditRoom',
      id,
      name,
      sign: sign_bs62,
    });
  }

  async putRoomMsg(id: string, author: string, bodyS: string) {
    const roomInfo = roomsMan.get()[id];
    if (!roomInfo) {
      console.warn('not my room', id);
      return;
    }

    const signKey = bs62.decode(roomInfo.signKey);
    const fp = nacl.sign.keyPair.fromSecretKey(bs62.decode(roomInfo.fp)).publicKey;
    const k = nacl.randomBytes(ROOM_MSG_KEY_BYTES);
    const key = deriveMsgKey(signKey, fp, k);
    const body = nacl.secretbox(new TextEncoder().encode(bodyS), key.nonce, key.key);
    const sign = nacl.sign.detached(concatArray(k, body), signKey);

    await this.appFirebase.putRoomMsg({
      method: 'PutRoomMsg',
      id,
      fp: bs62.encode(fp),
      k: bs62.encode(k),
      author,
      body: bs62.encode(body),
      sign: bs62.encode(sign),
    });

    roomsMan.updateAuthor(id, author);
  }

  decryptMsg(id: string, msg: Room['msgs'][number]) {
    const roomInfo = roomsMan.get()[id];
    if (!roomInfo) {
      console.warn('not my room', id);
      return;
    }

    const key = deriveMsgKey(
      bs62.decode(roomInfo.signKey),
      msg.fp.toUint8Array(),
      msg.k.toUint8Array(),
    );

    const b = nacl.secretbox.open(msg.body.toUint8Array(), key.nonce, key.key);
    return {
      ...msg,
      body: !b ? '(decrypt error)' : new TextDecoder().decode(b?.buffer),
      fp: bs62.encode(msg.fp.toUint8Array()).slice(0, ROOM_MSG_FP_DISP_LENGTH),
    };
  }

  async genInviteURL(id: string) {
    const roomInfo = roomsMan.get()[id];
    if (!roomInfo) {
      console.warn('not my room', id);
      return;
    }
    if (!roomInfo.adminKey) {
      console.warn('not admin', id);
      return;
    }

    const signKey = bs62.decode(roomInfo.signKey);
    const adminKey = bs62.decode(roomInfo.adminKey);

    const keyCode = nacl.randomBytes(INVITE_CODE_BYTES);
    const h = nacl.hash(keyCode);
    const key = {
      key: h.slice(0, nacl.secretbox.keyLength),
      nonce: h.slice(nacl.secretbox.nonceLength * -1),
    };

    const code = nacl.secretbox(signKey, key.nonce, key.key);
    const sign = nacl.sign.detached(code, adminKey);

    const code_bs62 = bs62.encode(code);
    const sign_bs62 = bs62.encode(sign);

    await this.appFirebase.putInviteCode({
      method: 'PutInviteCode',
      id,
      code: code_bs62,
      sign: sign_bs62,
    });

    return `${location.origin}/${id}/join/${bs62.encode(keyCode)}`;
  }

  async joinRoom(id: string, codeS: string) {
    if (this.isMyRoom(id)) {
      return true;
    }

    const room = await this.appFirebase.getRoom(id, true);
    if (!room) {
      console.warn('no room', id);
      return;
    }

    const storedCode = room.invite?.code.toUint8Array();
    if (!storedCode) {
      console.warn('no storedCode', id);
      return;
    }

    const code = bs62.decode(codeS);
    const h = nacl.hash(code);
    const key = {
      key: h.slice(0, nacl.secretbox.keyLength),
      nonce: h.slice(nacl.secretbox.nonceLength * -1),
    };

    const signKey = nacl.secretbox.open(storedCode, key.nonce, key.key);
    if (!signKey) {
      console.warn('decrypt error', id, codeS);
      return;
    }

    const pubKey = nacl.sign.keyPair.fromSecretKey(signKey).publicKey;

    if (!nacl.verify(pubKey, room.signKey.toUint8Array())) {
      console.warn('pubkey is not same', id, codeS);
      return;
    }

    const fp = bs62.encode(nacl.randomBytes(nacl.sign.secretKeyLength));

    roomsMan.add(id, { name: room.name, signKey: bs62.encode(signKey), fp });

    return true;
  }
}

const concatArray = (...arrays: Uint8Array[]) => {
  const len = arrays.reduce((acc, array) => {
    return acc + array.byteLength;
  }, 0);
  const result = new Uint8Array(len);
  let offset = 0;
  for (const array of arrays) {
    result.set(array, offset);
    offset += array.byteLength;
  }
  return result;
};

const genSignKey = () => {
  const kp = nacl.sign.keyPair();
  return {
    secKey: bs62.encode(kp.secretKey),
    pubKey: bs62.encode(kp.publicKey),
  };
};

const deriveMsgKey = (signKey: Uint8Array, fp: Uint8Array, k: Uint8Array) => {
  const x = concatArray(signKey, fp, k);
  const h = nacl.hash(x);
  return {
    key: h.slice(0, nacl.secretbox.keyLength),
    nonce: h.slice(nacl.secretbox.nonceLength * -1),
  };
};
