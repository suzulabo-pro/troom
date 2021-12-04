import * as functions from 'firebase-functions';
import 'firebase-functions/lib/logger/compat';
import 'source-map-support/register';
import { AppEnv } from '../shared';
import { httpsCallHandler } from './call';
import { getFirestore, initializeApp } from './firebase';
import { roomsUpdateHandler } from './firestore';
import { httpsRequestHandler } from './https';
import { pubsubPingAnnounce } from './pubsub/ping-announcing';

const adminApp = initializeApp();
const appEnv = new AppEnv().env;

const region = functions.region(appEnv.functionsRegion);

getFirestore(adminApp).settings({ ignoreUndefinedProperties: true });

export const httpsCall = region.https.onCall((data, context) => {
  return httpsCallHandler(data, context, adminApp);
});

export const httpsRequest = region.https.onRequest((req, res) => {
  return httpsRequestHandler(req, res, adminApp);
});

export const firestore = {
  roomsUpdate: region.firestore.document('rooms/{roomID}').onUpdate(change => {
    return roomsUpdateHandler(change);
  }),
};

const pubsubBuilder = region.pubsub;

export const pubsub = {
  sendNotification: pubsubBuilder.topic('ping-announcing').onPublish(async (msg, context) => {
    await pubsubPingAnnounce(msg, context, adminApp);
    return 0;
  }),
};
