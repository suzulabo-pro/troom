import { JSONSchemaType } from 'ajv';
import {
  EditRoomParams,
  ROOM_ID_LENGTH,
  ROOM_NAME_MAX_LENGTH,
  ROOM_SIGN_MAX_LENGTH,
  ROOM_SIGN_MIN_LENGTH,
} from '../../shared';

export const EditRoomParamsSchema: JSONSchemaType<EditRoomParams> = {
  type: 'object',
  additionalProperties: false,
  required: ['id', 'name', 'sign'],
  properties: {
    method: {
      type: 'string',
      const: 'EditRoom',
    },
    id: {
      type: 'string',
      minLength: ROOM_ID_LENGTH,
      maxLength: ROOM_ID_LENGTH,
    },
    name: {
      type: 'string',
      maxLength: ROOM_NAME_MAX_LENGTH,
    },
    sign: {
      type: 'string',
      minLength: ROOM_SIGN_MIN_LENGTH,
      maxLength: ROOM_SIGN_MAX_LENGTH,
    },
  },
};
