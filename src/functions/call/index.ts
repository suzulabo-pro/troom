import { BaseError } from '../../shared';
import { CallableContext, FirebaseAdminApp } from '../firebase';
import { validators } from '../json-schema';
import { logger } from '../utils/logger';
import { createRoom } from './create-room';
import { putRoomMsg } from './put-room-msg';

class InvalidParamsError extends BaseError {
  constructor(public method: string, public data: any) {
    super();
  }
}

class HttpsCallError extends BaseError {
  constructor(public method: string, public error: any, public data: any) {
    super();
  }
}

export const httpsCallHandler = async (
  data: any,
  context: CallableContext,
  adminApp: FirebaseAdminApp,
): Promise<void | Record<string, any>> => {
  const method = data.method;

  try {
    logger.debug('invoke', { method });
    switch (method) {
      case 'CreateRoom':
        if (validators.CreateRoomParams(data)) {
          return createRoom(data, context, adminApp);
        }
        break;
      case 'PutRoomMsg':
        if (validators.PutRoomMsgParams(data)) {
          return putRoomMsg(data, context, adminApp);
        }
        break;
    }
  } catch (err) {
    throw new HttpsCallError(method, err, data);
  }

  throw new InvalidParamsError(method, data);
};
