import * as functions from 'firebase-functions';
import 'firebase-functions/lib/logger/compat';
import 'source-map-support/register';
import { AppEnv } from '../shared';
import { httpsCallHandler } from './call';
import { getFirestore, initializeApp } from './firebase';

const adminApp = initializeApp();
const appEnv = new AppEnv().env;

const region = functions.region(appEnv.functionsRegion);

getFirestore(adminApp).settings({ ignoreUndefinedProperties: true });

export const httpsCall = region.https.onCall((data, context) => {
  return httpsCallHandler(data, context, adminApp);
});
