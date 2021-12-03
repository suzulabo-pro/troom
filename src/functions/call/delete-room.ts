import nacl from 'tweetnacl';
import { AnyConverter, AppError, bs62, DeleteRoomParams } from '../../shared';
import { Room } from '../datatypes';
import { CallableContext, FirebaseAdminApp, getFirestore } from '../firebase';
import { logger } from '../utils/logger';

export const deleteRoom = async (
  params: DeleteRoomParams,
  _context: CallableContext,
  adminApp: FirebaseAdminApp,
): Promise<void> => {
  const { method, id, sign: _sign } = params;

  const firestore = getFirestore(adminApp);

  const docRef = firestore.doc(`rooms/${id}`).withConverter<Room>(AnyConverter);

  const room = (await docRef.get()).data();
  if (!room) {
    logger.warn('missing room', { id });
    return;
  }

  {
    const msg = new TextEncoder().encode([method, id].join('\0'));

    const sign = bs62.decode(_sign);
    const signKey = room.adminKey;

    if (!nacl.sign.detached.verify(msg, sign, signKey)) {
      throw new AppError('sign error', { id });
    }
  }

  await docRef.delete();
};
