const languages = ['en', 'ja'] as const;
export type Lang = typeof languages[number];

export interface _Room<Timestamp, Blob> {
  name: string;
  signKey: Blob;
  adminKey: Blob;
  invite?: { code: Blob; uT: Timestamp };
  msgs: {
    fp: Blob;
    k: Blob;
    author: string;
    body?: Blob;
    cT: Timestamp;
  }[];
  uT: Timestamp;
  cT: Timestamp;
}

export interface CreateRoomParams {
  method: 'CreateRoom';
  name: string;
  signKey: string;
  adminKey: string;
}

export interface EditRoomParams {
  method: 'EditRoom';
  id: string;
  name: string;
  sign: string;
}

export interface DeleteRoomParams {
  method: 'DeleteRoom';
  id: string;
  sign: string;
}

export interface CreateRoomResult {
  id: string;
}

export interface PutRoomMsgParams {
  method: 'PutRoomMsg';
  id: string;
  fp: string;
  k: string;
  author: string;
  body: string;
  sign: string;
}

export interface DeleteRoomMsgParams {
  method: 'DeleteRoomMsg';
  id: string;
  idx: number;
  sign: string;
}

export interface PutInviteCodeParams {
  method: 'PutInviteCode';
  id: string;
  code: string;
  sign: string;
}
