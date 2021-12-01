import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { CreateRoomParams, PutRoomMsgParams, PutInviteCodeParams } from '../../shared';
import { logger } from '../utils/logger';
import { CreateRoomParamsSchema } from './create-room-params';
import { PutRoomMsgParamsSchema } from './put-room-msg-params';
import { PutInviteCodeParamsSchema } from './put-invite-code-params';

const ajv = new Ajv();
addFormats(ajv);

ajv.addSchema(CreateRoomParamsSchema, 'CreateRoomParams');
ajv.addSchema(PutRoomMsgParamsSchema, 'PutRoomMsgParams');
ajv.addSchema(PutInviteCodeParamsSchema, 'PutInviteCodeParams');

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
  PutRoomMsgParams: genValidator<PutRoomMsgParams>('PutRoomMsgParams'),
  PutInviteCodeParams: genValidator<PutInviteCodeParams>('PutInviteCodeParams'),
};

export const __schemas = ajv.schemas;
