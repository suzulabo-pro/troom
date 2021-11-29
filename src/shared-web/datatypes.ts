import { Bytes, Timestamp } from 'firebase/firestore';
import { _Room } from '../shared';
import { Match } from '../shared/path-matcher';

export type RouteMatch = Match & {
  tag?: string;
  back?: string | ((p: Record<string, string>) => string);
  reload?: boolean;
  fitPage?: boolean;
};

export type Room = _Room<Timestamp, Bytes>;
