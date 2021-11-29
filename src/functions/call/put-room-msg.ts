import nacl from 'tweetnacl';
import { AnyConverter, AppError, bs62, PutRoomMsgParams } from '../../shared';
import { Room, RoomMsgW, RoomW } from '../datatypes';
import {
  arrayUnion,
  CallableContext,
  FirebaseAdminApp,
  getFirestore,
  serverTimestamp,
} from '../firebase';
import { logger } from '../utils/logger';

export const putRoomMsg = async (
  params: PutRoomMsgParams,
  _context: CallableContext,
  adminApp: FirebaseAdminApp,
): Promise<void> => {
  const { id, fp: _fp, k: _k, author, body: _body, sign: _sign } = params;

  const firestore = getFirestore(adminApp);

  const docRef = firestore.doc(`rooms/${id}`).withConverter<Room>(AnyConverter);

  const room = (await docRef.get()).data();
  if (!room) {
    logger.warn('missing room', { id });
    return;
  }

  const k = bs62.decode(_k);
  const body = bs62.decode(_body);

  {
    const msg = Buffer.concat([k, body]);
    const sign = bs62.decode(_sign);
    const signKey = room.signKey;

    if (!nacl.sign.detached.verify(msg, sign, signKey)) {
      throw new AppError('sign error', { id });
    }
  }

  const fp = bs62.decode(_fp);

  const newMsg: RoomMsgW = {
    fp,
    k,
    author,
    body,
    cT: serverTimestamp(),
  };
  const updateData: Partial<RoomW> = {
    msgs: arrayUnion(newMsg),
    uT: serverTimestamp(),
  };
  await docRef.update(updateData);
};
