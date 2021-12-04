import { AnyConverter, AppEnv } from '../../shared';
import { Room } from '../datatypes';
import {
  FirebaseAdminApp,
  functionsConfig,
  getFirestore,
  HttpRequest,
  HttpResponse,
} from '../firebase';

const appEnv = new AppEnv();

export const getAnnouncingJSON = async (
  params: Record<string, string>,
  _req: HttpRequest,
  res: HttpResponse,
  adminApp: FirebaseAdminApp,
) => {
  const { roomID } = params;

  const firestore = getFirestore(adminApp);
  const docRef = firestore.doc(`rooms/${roomID}`).withConverter<Room>(AnyConverter);
  const room = (await docRef.get()).data();
  if (!room) {
    res.sendStatus(404);
    return;
  }

  // TODO i18n
  const json = {
    id: roomID,
    key: functionsConfig.announcing.jsonkey,
    info: { name: `${room.name} - troom`, desc: `「${room.name}」の新しい投稿をお知らせします` },
    posts: room.msgs.slice(-5).map(v => {
      return {
        body: `${v.author} さんが投稿しました`,
        link: `${appEnv.env.sites.main}/${roomID}`,
        pT: v.cT.toDate().toISOString(),
      };
    }),
  };

  res.json(json);
};
