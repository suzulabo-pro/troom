import { BaseError, CreateRoomParams } from '../../shared';
import { CallableContext, FirebaseAdminApp } from '../firebase';
import { logger } from '../utils/logger';
import { createRoom } from './create-room';

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
        return createRoom(data as CreateRoomParams, context, adminApp);
    }
  } catch (err) {
    console.log(err);
    throw new HttpsCallError(method, err, data);
  }

  throw new InvalidParamsError(method, data);
};
