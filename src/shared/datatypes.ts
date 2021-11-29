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
  adminKey: string;
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
  adminKey: string;
}

export interface CreateRoomResult {
  id: string;
}
