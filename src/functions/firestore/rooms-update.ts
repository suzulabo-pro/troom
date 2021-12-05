import { Room } from '../datatypes';
import { DocumentChange } from '../firebase';
import { addPingAnnouncingTask } from '../pubsub/ping-announcing';
import { logger } from '../utils/logger';

export const roomsUpdate = async (
  change: DocumentChange,
  // _context: EventContext,
  // adminApp: FirebaseAdminApp,
): Promise<void> => {
  const beforeData = change.before.data() as Room;
  const afterData = change.after.data() as Room;
  if (!afterData) {
    logger.warn('afterData is null');
    return;
  }

  const beforeMsgs = beforeData.msgs;
  const afterMsgs = afterData.msgs;

  {
    const beforeLatest = beforeMsgs[beforeMsgs.length - 1]?.cT.toMillis() || 0;
    const afterLatest = afterMsgs[afterMsgs.length - 1]?.cT.toMillis() || 0;
    if (beforeLatest >= afterLatest) {
      logger.debug('no new post');
      return;
    }
  }

  const roomID = change.after.id;

  try {
    await addPingAnnouncingTask(roomID, afterData.uT.toMillis());
  } catch (err) {
    logger.critical('addPingAnnouncingTask error', { err });
    throw err;
  }
};
