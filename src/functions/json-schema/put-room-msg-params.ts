import { JSONSchemaType } from 'ajv';
import {
  AUTHOR_MAX_LENGTH,
  BODY_MAX_LENGTH,
  PutRoomMsgParams,
  ROOM_FP_MAX_LENGTH,
  ROOM_FP_MIN_LENGTH,
  ROOM_ID_LENGTH,
  ROOM_KEY_MAX_LENGTH,
  ROOM_KEY_MIN_LENGTH,
  ROOM_SIGN_MAX_LENGTH,
  ROOM_SIGN_MIN_LENGTH,
} from '../../shared';

export const PutRoomMsgParamsSchema: JSONSchemaType<PutRoomMsgParams> = {
  type: 'object',
  additionalProperties: false,
  required: ['id', 'fp', 'k', 'author', 'body', 'sign'],
  properties: {
    method: {
      type: 'string',
      const: 'PutRoomMsg',
    },
    id: {
      type: 'string',
      minLength: ROOM_ID_LENGTH,
      maxLength: ROOM_ID_LENGTH,
    },
    fp: {
      type: 'string',
      minLength: ROOM_FP_MIN_LENGTH,
      maxLength: ROOM_FP_MAX_LENGTH,
    },
    k: {
      type: 'string',
      minLength: ROOM_KEY_MIN_LENGTH,
      maxLength: ROOM_KEY_MAX_LENGTH,
    },
    author: {
      type: 'string',
      maxLength: AUTHOR_MAX_LENGTH,
    },
    body: {
      type: 'string',
      maxLength: BODY_MAX_LENGTH,
    },
    sign: {
      type: 'string',
      minLength: ROOM_SIGN_MIN_LENGTH,
      maxLength: ROOM_SIGN_MAX_LENGTH,
    },
  },
};
