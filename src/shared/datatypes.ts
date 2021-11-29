const languages = ['en', 'ja'] as const;
export type Lang = typeof languages[number];

type Timestamp = {
  toMillis: () => number;
};
type Blob = {
  toBase64: () => string;
};

export interface Room {
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
  fp: Uint8Array;
  k: Uint8Array;
  author: string;
  body: Uint8Array;
}
