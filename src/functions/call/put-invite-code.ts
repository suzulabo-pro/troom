import nacl from 'tweetnacl';
import { AnyConverter, AppError, bs62, PutInviteCodeParams } from '../../shared';
import { Room, RoomW } from '../datatypes';
import { CallableContext, FirebaseAdminApp, getFirestore, Timestamp } from '../firebase';
import { logger } from '../utils/logger';

export const putInviteCode = async (
  params: PutInviteCodeParams,
  _context: CallableContext,
  adminApp: FirebaseAdminApp,
): Promise<void> => {
  const { id, code: _code, sign: _sign } = params;

  const firestore = getFirestore(adminApp);

  const docRef = firestore.doc(`rooms/${id}`).withConverter<Room>(AnyConverter);

  const room = (await docRef.get()).data();
  if (!room) {
    logger.warn('missing room', { id });
    return;
  }

  const code = bs62.decode(_code);

  {
    const sign = bs62.decode(_sign);
    const signKey = room.adminKey;

    if (!nacl.sign.detached.verify(code, sign, signKey)) {
      throw new AppError('sign error', { id });
    }
  }

  const now = Timestamp.now();
  const updateData: Partial<RoomW> = {
    invite: { code, uT: now },
    uT: now,
  };
  await docRef.update(updateData);
};
