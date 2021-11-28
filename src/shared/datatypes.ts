const languages = ['en', 'ja'] as const;
export type Lang = typeof languages[number];

type Timestamp = {
  toMillis: () => number;
};

export interface Room {
  name: string;
  adminKey: string;
  uT: Timestamp;
  cT: Timestamp;
}

export interface CreateRoomParams {
  method: 'CreateRoom';
  adminKey: string;
}

export interface CreateRoomResult {
  id: string;
}
