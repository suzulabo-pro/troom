import { JSONSchemaType } from 'ajv';
import {
  INVITE_STORED_CODE_MAX_LENGTH,
  PutInviteCodeParams,
  ROOM_ID_LENGTH,
  ROOM_SIGN_MAX_LENGTH,
  ROOM_SIGN_MIN_LENGTH,
} from '../../shared';

export const PutInviteCodeParamsSchema: JSONSchemaType<PutInviteCodeParams> = {
  type: 'object',
  additionalProperties: false,
  required: ['id', 'code', 'sign'],
  properties: {
    method: {
      type: 'string',
      const: 'PutInviteCode',
    },
    id: {
      type: 'string',
      minLength: ROOM_ID_LENGTH,
      maxLength: ROOM_ID_LENGTH,
    },
    code: {
      type: 'string',
      maxLength: INVITE_STORED_CODE_MAX_LENGTH,
    },
    sign: {
      type: 'string',
      minLength: ROOM_SIGN_MIN_LENGTH,
      maxLength: ROOM_SIGN_MAX_LENGTH,
    },
  },
};
