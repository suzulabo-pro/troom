import { Match, pathMatcher } from '../../shared';
import { FirebaseAdminApp, HttpRequest, HttpResponse } from '../firebase';
import { logger } from '../utils/logger';
import { getAnnouncingJSON } from './announcing-json';

type FunctionMatch = Match & {
  func?: (
    params: Record<string, string>,
    req: HttpRequest,
    res: HttpResponse,
    adminApp: FirebaseAdminApp,
  ) => Promise<void>;
};

const matches: FunctionMatch[] = [
  {
    pattern: 'announcing',
    nexts: [
      {
        pattern: new RegExp(`^[0-9A-Z]{5}$`),
        name: 'roomID',
        func: getAnnouncingJSON,
      },
    ],
  },
];

export const httpsRequestHandler = (
  req: HttpRequest,
  res: HttpResponse,
  adminApp: FirebaseAdminApp,
): Promise<void> => {
  const m = pathMatcher(matches, req.path);
  if (m && m.match.func) {
    logger.debug('invoke', { name: m.match.func.name, path: req.path });
    return m.match.func(m.params, req, res, adminApp);
  }

  logger.warn('invalid path', { path: req.path });
  res.sendStatus(404);
  return Promise.resolve();
};
