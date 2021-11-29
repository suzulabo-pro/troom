const languages = ['en', 'ja'] as const;
export type Lang = typeof languages[number];

export interface _Room<Timestamp, Blob> {
  name: string;
  signKey: Blob;
  adminKey: Blob;
  msgs: {
    fp: Blob;
    k: Blob;
    author: string;
    body: Blob;
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
