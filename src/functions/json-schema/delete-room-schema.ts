import { JSONSchemaType } from 'ajv';
import {
  DeleteRoomParams,
  ROOM_ID_LENGTH,
  ROOM_SIGN_MAX_LENGTH,
  ROOM_SIGN_MIN_LENGTH,
} from '../../shared';

export const DeleteRoomParamsSchema: JSONSchemaType<DeleteRoomParams> = {
  type: 'object',
  additionalProperties: false,
  required: ['id', 'sign'],
  properties: {
    method: {
      type: 'string',
      const: 'DeleteRoom',
    },
    id: {
      type: 'string',
      minLength: ROOM_ID_LENGTH,
      maxLength: ROOM_ID_LENGTH,
    },
    sign: {
      type: 'string',
      minLength: ROOM_SIGN_MIN_LENGTH,
      maxLength: ROOM_SIGN_MAX_LENGTH,
    },
  },
};
