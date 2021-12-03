import { Build } from '@stencil/core';
import { FirebaseApp, initializeApp } from 'firebase/app';
import {
  connectFirestoreEmulator,
  enableMultiTabIndexedDbPersistence,
  Firestore,
  getFirestore,
} from 'firebase/firestore';
import {
  connectFunctionsEmulator,
  Functions,
  getFunctions,
  httpsCallable,
} from 'firebase/functions';
import {
  AppEnv,
  CreateRoomParams,
  CreateRoomResult,
  EditRoomParams,
  PutInviteCodeParams,
  PutRoomMsgParams,
} from '../../shared';
import { FirestoreHelper, Room } from '../../shared-web';

const devonly_setEmulator = (functions: Functions, firestore: Firestore) => {
  if (!Build.isDev) {
    return;
  }
  console.log('useEmulator');

  connectFunctionsEmulator(functions, location.hostname, parseInt(location.port));
  connectFirestoreEmulator(firestore, location.hostname, parseInt(location.port));
};

export class AppFirebase {
  private functions: Functions;
  private firestore: Firestore;
  private firestoreHelper: FirestoreHelper;

  constructor(private appEnv: AppEnv, private firebaseApp?: FirebaseApp) {
    if (!this.firebaseApp) {
      this.firebaseApp = initializeApp(this.appEnv.env.firebaseConfig);
    }

    this.functions = getFunctions(this.firebaseApp, this.appEnv.env.functionsRegion);
    this.firestore = getFirestore(this.firebaseApp);
    this.firestoreHelper = new FirestoreHelper(this.firestore);
    devonly_setEmulator(this.functions, this.firestore);
  }

  async init() {
    try {
      await enableMultiTabIndexedDbPersistence(this.firestore);
    } catch (err) {
      console.warn('enablePersistence', err);
    }
  }

  private async callFunc<
    RequestData = { method: string; [k: string]: any },
    ResponseData = unknown,
  >(params: RequestData): Promise<ResponseData> {
    const f = httpsCallable<RequestData, ResponseData>(this.functions, 'httpsCall');
    const res = await f(params);
    return res.data;
  }

  async createRoom(params: CreateRoomParams) {
    return this.callFunc<CreateRoomParams, CreateRoomResult>(params);
  }

  async editRoom(params: EditRoomParams) {
    return this.callFunc<EditRoomParams, void>(params);
  }

  async putRoomMsg(params: PutRoomMsgParams) {
    return this.callFunc<PutRoomMsgParams, void>(params);
  }

  async putInviteCode(params: PutInviteCodeParams) {
    return this.callFunc<PutInviteCodeParams, void>(params);
  }

  async getRoom(id: string, temporary?: boolean) {
    return this.firestoreHelper.listenAndGet<Room>(
      `rooms/${id}`,
      (oldData, newData) => {
        if (oldData && newData) {
          return oldData.uT.toMillis() != newData.uT.toMillis();
        }
        return true;
      },
      temporary,
    );
  }
}
