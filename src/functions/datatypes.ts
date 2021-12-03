import { Merge } from 'type-fest';
import { _Room } from '../shared';
import { FieldValue, Timestamp } from './firebase';

export type Room = _Room<Timestamp, Buffer>;
export type RoomW = Merge<
  _Room<Timestamp | FieldValue, Buffer>,
  {
    msgs: Room['msgs'] | FieldValue;
  }
>;
export type RoomMsgW = _Room<Timestamp | FieldValue, Buffer>['msgs'][number];
