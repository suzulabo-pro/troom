import nacl from 'tweetnacl';
import { bs62, CreateRoomParams, CreateRoomResult, ROOM_ID_LENGTH } from '../../shared';
import { RoomW } from '../datatypes';
import { CallableContext, FirebaseAdminApp, getFirestore, serverTimestamp } from '../firebase';

export const createRoom = async (
  params: CreateRoomParams,
  _context: CallableContext,
  adminApp: FirebaseAdminApp,
): Promise<CreateRoomResult> => {
  const { name, signKey, adminKey } = params;

  const firestore = getFirestore(adminApp);

  const id = genID(ROOM_ID_LENGTH);

  const docRef = firestore.doc(`rooms/${id}`);

  await docRef.create({
    name,
    signKey: Buffer.from(bs62.decode(signKey)),
    adminKey: Buffer.from(bs62.decode(adminKey)),
    msgs: [],
    uT: serverTimestamp(),
    cT: serverTimestamp(),
  } as RoomW);

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
