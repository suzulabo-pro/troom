import {
  CreateRoomParams,
  ROOM_ADMIN_KEY_MAX_LENGTH,
  ROOM_ADMIN_KEY_MIN_LENGTH,
  ROOM_NAME_MAX_LENGTH,
  ROOM_SIGN_KEY_MAX_LENGTH,
  ROOM_SIGN_KEY_MIN_LENGTH,
} from '../../shared';
import { JSONSchemaType } from 'ajv';

export const CreateRoomParamsSchema: JSONSchemaType<CreateRoomParams> = {
  type: 'object',
  additionalProperties: false,
  required: ['name'],
  properties: {
    method: {
      type: 'string',
      const: 'CreateRoom',
    },
    name: {
      type: 'string',
      maxLength: ROOM_NAME_MAX_LENGTH,
    },
    signKey: {
      type: 'string',
      minLength: ROOM_SIGN_KEY_MIN_LENGTH,
      maxLength: ROOM_SIGN_KEY_MAX_LENGTH,
    },
    adminKey: {
      type: 'string',
      minLength: ROOM_ADMIN_KEY_MIN_LENGTH,
      maxLength: ROOM_ADMIN_KEY_MAX_LENGTH,
    },
  },
};
