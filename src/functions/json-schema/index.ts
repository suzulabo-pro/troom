import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { CreateRoomParams } from '../../shared';
import { logger } from '../utils/logger';
import { CreateRoomParamsSchema } from './create-room-params';

const ajv = new Ajv();
addFormats(ajv);

ajv.addSchema(CreateRoomParamsSchema, 'CreateRoomParams');

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
};

export const __schemas = ajv.schemas;
