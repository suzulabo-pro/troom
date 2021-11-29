import nacl from 'tweetnacl';
import { AppError, assertIsDefined, bs62, MASTER_KEY_BYTES, Room } from '../../shared';
import { AppFirebase } from './firebase';
import { AppMsg } from './msg';

const BUILD_INFO = {
  src: '__BUILD_SRC__',
  repo: '__BUILD_REPO__',
  time: parseInt('__BUILT_TIME__'),
} as const;

interface RoomInfo {
  name: string;
  masterKey: string;
  adminKey?: string;
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
    if (info) {
      info.name = name;
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

  async createRoom(name: string) {
    const masterKey = bs62.encode(nacl.randomBytes(MASTER_KEY_BYTES));
    const adminKeysB = nacl.box.keyPair();
    const adminKeys = {
      secKey: bs62.encode(adminKeysB.secretKey),
      pubKey: bs62.encode(adminKeysB.publicKey),
    };

    const result = await this.appFirebase.createRoom({
      method: 'CreateRoom',
      name,
      adminKey: adminKeys.pubKey,
    });

    const id = result.id;
    assertIsDefined(id);

    roomsMan.add(id, { name, masterKey, adminKey: adminKeys.secKey });
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
}
