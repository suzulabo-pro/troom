import { _appEnv } from '../../secrets/appenv.env';

interface AppEnvironment {
  firebaseConfig: {
    readonly apiKey: string;
    readonly authDomain: string;
    readonly projectId: string;
    readonly storageBucket: string;
    readonly messagingSenderId: string;
    readonly appId: string;
  };
  readonly functionsRegion: string;
  readonly sites: {
    main: string;
    announcing: string;
  };
}

export class AppEnv {
  constructor(readonly env: AppEnvironment = _appEnv) {}
}
