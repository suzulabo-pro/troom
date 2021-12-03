import nacl from 'tweetnacl';
import { AnyConverter, AppError, bs62, EditRoomParams } from '../../shared';
import { Room, RoomW } from '../datatypes';
import { CallableContext, FirebaseAdminApp, getFirestore, Timestamp } from '../firebase';
import { logger } from '../utils/logger';

export const editRoom = async (
  params: EditRoomParams,
  _context: CallableContext,
  adminApp: FirebaseAdminApp,
): Promise<void> => {
  const { id, name, sign: _sign } = params;

  const firestore = getFirestore(adminApp);

  const docRef = firestore.doc(`rooms/${id}`).withConverter<Room>(AnyConverter);

  const room = (await docRef.get()).data();
  if (!room) {
    logger.warn('missing room', { id });
    return;
  }

  {
    const msg = new TextEncoder().encode(name);

    const sign = bs62.decode(_sign);
    const signKey = room.adminKey;

    if (!nacl.sign.detached.verify(msg, sign, signKey)) {
      throw new AppError('sign error', { id });
    }
  }

  const now = Timestamp.now();
  const updateData: Partial<RoomW> = {
    name,
    uT: now,
  };
  await docRef.update(updateData);
};
