import { DocumentChange } from '../firebase';
import { roomsUpdate } from './rooms-update';

export const roomsUpdateHandler = async (
  change: DocumentChange,
  // context: EventContext,
  // adminApp: FirebaseAdminApp,
) => {
  await roomsUpdate(change);
};
