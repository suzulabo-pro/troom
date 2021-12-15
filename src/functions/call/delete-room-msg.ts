import nacl from 'tweetnacl';
import { AnyConverter, AppError, bs62, DeleteRoomMsgParams } from '../../shared';
import { Room, RoomW } from '../datatypes';
import { CallableContext, FirebaseAdminApp, getFirestore, serverTimestamp } from '../firebase';
import { logger } from '../utils/logger';

export const deleteRoomMsg = async (
  params: DeleteRoomMsgParams,
  _context: CallableContext,
  adminApp: FirebaseAdminApp,
): Promise<void> => {
  const { id, idx, sign: _sign } = params;

  const firestore = getFirestore(adminApp);

  let abortError: Error | undefined;

  await firestore.runTransaction(async t => {
    const docRef = firestore.doc(`rooms/${id}`).withConverter<Room>(AnyConverter);
    const room = (await t.get(docRef)).data();
    if (!room) {
      logger.warn('missing room', { id });
      return;
    }

    const roomMsg = room.msgs[idx];
    if (!roomMsg) {
      logger.warn('missing room msg', { id, idx });
      return;
    }
    if (!roomMsg.body) {
      logger.warn('missing room msg body', { id, idx });
      return;
    }

    {
      const msg = Buffer.concat([roomMsg.k, roomMsg.body]);
      const sign = bs62.decode(_sign);
      const signKey = roomMsg.fp;

      if (!nacl.sign.detached.verify(msg, sign, signKey)) {
        abortError = new AppError('sign error', { id });
        return;
      }
    }

    roomMsg.body = undefined;

    const updateData: Partial<RoomW> = {
      msgs: room.msgs,
      uT: serverTimestamp(),
    };
    t.update(docRef, updateData);
  });

  if (abortError) {
    throw abortError;
  }
};
