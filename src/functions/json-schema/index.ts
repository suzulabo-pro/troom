import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import {
  CreateRoomParams,
  DeleteRoomParams,
  EditRoomParams,
  PutInviteCodeParams,
  PutRoomMsgParams,
} from '../../shared';
import { logger } from '../utils/logger';
import { CreateRoomParamsSchema } from './create-room-params';
import { DeleteRoomParamsSchema } from './delete-room-schema';
import { EditRoomParamsSchema } from './edit-room-params';
import { PutInviteCodeParamsSchema } from './put-invite-code-params';
import { PutRoomMsgParamsSchema } from './put-room-msg-params';

const ajv = new Ajv();
addFormats(ajv);

ajv.addSchema(CreateRoomParamsSchema, 'CreateRoomParams');
ajv.addSchema(EditRoomParamsSchema, 'EditRoomParams');
ajv.addSchema(PutRoomMsgParamsSchema, 'PutRoomMsgParams');
ajv.addSchema(PutInviteCodeParamsSchema, 'PutInviteCodeParams');
ajv.addSchema(DeleteRoomParamsSchema, 'DeleteRoomParams');

const genValidator = <T>(k: string) => {
  const validator = (data: any): data is T => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const v = ajv.getSchema<T>(k)!;
    if (v(data)) {
      return true;
    }
    logger.error('validate error', { k, data, errors: v.errors });
    return false;
  };
  return validator;
};

export const validators = {
  CreateRoomParams: genValidator<CreateRoomParams>('CreateRoomParams'),
  EditRoomParams: genValidator<EditRoomParams>('EditRoomParams'),
  PutRoomMsgParams: genValidator<PutRoomMsgParams>('PutRoomMsgParams'),
  PutInviteCodeParams: genValidator<PutInviteCodeParams>('PutInviteCodeParams'),
  DeleteRoomParams: genValidator<DeleteRoomParams>('DeleteRoomParams'),
};

export const __schemas = ajv.schemas;
