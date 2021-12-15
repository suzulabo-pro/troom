import { JSONSchemaType } from 'ajv';
import {
  DeleteRoomMsgParams,
  ROOM_ID_LENGTH,
  ROOM_SIGN_MAX_LENGTH,
  ROOM_SIGN_MIN_LENGTH,
} from '../../shared';

export const DeleteRoomMsgParamsSchema: JSONSchemaType<DeleteRoomMsgParams> = {
  type: 'object',
  additionalProperties: false,
  required: ['id', 'idx', 'sign'],
  properties: {
    method: {
      type: 'string',
      const: 'DeleteRoomMsg',
    },
    id: {
      type: 'string',
      minLength: ROOM_ID_LENGTH,
      maxLength: ROOM_ID_LENGTH,
    },
    idx: {
      type: 'number',
    },
    sign: {
      type: 'string',
      minLength: ROOM_SIGN_MIN_LENGTH,
      maxLength: ROOM_SIGN_MAX_LENGTH,
    },
  },
};
