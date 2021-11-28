import nacl from 'tweetnacl';
import { AppError, assertIsDefined, bs62 } from '../../shared';
import { AppFirebase } from './firebase';
import { AppMsg } from './msg';

const BUILD_INFO = {
  src: '__BUILD_SRC__',
  repo: '__BUILD_REPO__',
  time: parseInt('__BUILT_TIME__'),
} as const;

interface Room {
  secKey: string;
  adminKey?: string;
}
type Rooms = Record<string, Room>;

class RoomsManager {
  get() {
    return JSON.parse(localStorage.getItem('rooms') || '{}') as Rooms;
  }
  set = (rooms: Rooms) => {
    localStorage.setItem('rooms', JSON.stringify(rooms));
  };
  add(id: string, room: Room) {
    const rooms = this.get();
    if (!(id in rooms)) {
      rooms[id] = room;
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

  getRooms() {
    return roomsMan.get();
  }

  async createRoom() {
    const secKey = bs62.encode(nacl.randomBytes(32));
    const adminKeysB = nacl.box.keyPair();
    const adminKeys = {
      secKey: bs62.encode(adminKeysB.secretKey),
      pubKey: bs62.encode(adminKeysB.publicKey),
    };

    const result = await this.appFirebase.createRoom({
      method: 'CreateRoom',
      adminKey: adminKeys.pubKey,
    });

    const id = result.id;
    assertIsDefined(id);

    roomsMan.add(id, { secKey, adminKey: adminKeys.secKey });
  }
}