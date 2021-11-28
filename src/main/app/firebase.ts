import { Build } from '@stencil/core';
import { FirebaseApp, initializeApp } from 'firebase/app';
import {
  connectFirestoreEmulator,
  doc,
  enableMultiTabIndexedDbPersistence,
  Firestore,
  getDocFromServer,
  getFirestore,
} from 'firebase/firestore';
import {
  connectFunctionsEmulator,
  Functions,
  getFunctions,
  httpsCallable,
} from 'firebase/functions';
import { AppEnv, CreateRoomParams, CreateRoomResult, Room } from '../../shared';

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

  constructor(private appEnv: AppEnv, private firebaseApp?: FirebaseApp) {
    if (!this.firebaseApp) {
      this.firebaseApp = initializeApp(this.appEnv.env.firebaseConfig);
    }

    this.functions = getFunctions(this.firebaseApp, this.appEnv.env.functionsRegion);
    this.firestore = getFirestore(this.firebaseApp);
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

  async getRoom(id: string) {
    const docRef = doc(this.firestore, `rooms/${id}`);
    const data = await getDocFromServer(docRef);
    return data.data() as Room | undefined;
  }
}
