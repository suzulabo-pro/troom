import nacl from 'tweetnacl';
import { AppError, CreateRoomParams, CreateRoomResult, Room } from '../../shared';
import { CallableContext, FirebaseAdminApp, getFirestore, serverTimestamp } from '../firebase';

export const createRoom = async (
  params: CreateRoomParams,
  _context: CallableContext,
  adminApp: FirebaseAdminApp,
): Promise<CreateRoomResult> => {
  const { name, adminKey } = params;

  if (!name) {
    throw new AppError('invalid name');
  }
  if (!adminKey) {
    throw new AppError('invalid adminKey');
  }

  const firestore = getFirestore(adminApp);

  const id = genID(5);

  const docRef = firestore.doc(`rooms/${id}`);

  await docRef.create({
    name,
    adminKey,
    uT: serverTimestamp() as any,
    cT: serverTimestamp() as any,
  } as Room);

  return { id };
};

const genID = (len: number) => {
  const chars = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

  const random = nacl.randomBytes(len);
  const l = [] as string[];
  random.forEach(v => {
    l.push(chars.charAt(v % 32));
  });
  return l.join('');
};
