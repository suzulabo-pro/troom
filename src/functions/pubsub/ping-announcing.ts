import { PubSub } from '@google-cloud/pubsub';
import axios from 'axios';
import { AnyConverter, AppEnv } from '../../shared';
import { Room } from '../datatypes';
import {
  EventContext,
  FirebaseAdminApp,
  functionsConfig,
  getFirestore,
  PubSubMessage,
} from '../firebase';
import { logger } from '../utils/logger';

const PING_TIMEOUT = 30 * 1000;
const appEnv = new AppEnv();

export const addPingAnnouncingTask = async (id: string, uT: number) => {
  const pubsub = new PubSub();
  const topic = pubsub.topic('ping-announcing');
  await topic.publishMessage({ json: { id, uT } });
};

export const pubsubPingAnnouncing = async (
  msg: PubSubMessage,
  _context: EventContext,
  adminApp: FirebaseAdminApp,
) => {
  const params = msg.json;

  const { id, uT } = params as { id: string; uT: number };

  const firestore = getFirestore(adminApp);
  const docRef = firestore.doc(`rooms/${id}`).withConverter<Room>(AnyConverter);
  const room = (await docRef.get()).data();
  if (!room) {
    logger.warn('no data', { id });
    return;
  }
  if (room.uT.toMillis() != uT) {
    logger.warn('uT is not same', { id });
    return;
  }

  await ping(id);
};

const ping = async (id: string): Promise<boolean> => {
  const source = axios.CancelToken.source();

  const timer = setTimeout(() => {
    source.cancel();
  }, PING_TIMEOUT);

  try {
    const url = `${functionsConfig.announcing.pingurl}/${functionsConfig.announcing.announceid}/${id}`;
    const reqID = new Date().toISOString();

    logger.debug('ping', { url });

    const res = await axios.get(url, {
      timeout: PING_TIMEOUT,
      maxRedirects: 0,
      headers: {
        'APP-REQUEST-ID': reqID,
        'APP-SEC-KEY': functionsConfig.announcing.seckey,
        'APP-ANNOUNCE-URL': `${appEnv.env.sites.main}/announcing/${id}`,
      },
      cancelToken: source.token,
    });

    const result = res.data as { status: string; reqID: string };
    if (result.status != 'ok') {
      logger.error('ping error', result);
      return false;
    }
    if (result.reqID != reqID) {
      logger.warn('reqID is not same', result);
      return false;
    }
  } finally {
    clearTimeout(timer);
  }

  return true;
};
