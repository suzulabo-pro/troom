import { Component, h, Host } from '@stencil/core';
import {
  AppEnv,
  AppError,
  INVITE_CODE_MAX_LENGTH,
  INVITE_CODE_MIN_LENGTH,
  ROOM_ID_LENGTH,
} from '../../../shared';
import { RouteMatch } from '../../../shared-web';
import { App } from '../../app/app';
import { AppFirebase } from '../../app/firebase';
import { AppMsg } from '../../app/msg';

const matches: RouteMatch[] = [
  {
    pattern: '',
    tag: 'app-home',
  },
  {
    pattern: new RegExp(`^[0-9A-Z]{${ROOM_ID_LENGTH}}$`),
    name: 'roomID',
    tag: 'app-room',
    back: '/',
    nexts: [
      {
        pattern: 'admin',
        tag: 'app-room-admin',
        back: p => `/${p['roomID']}`,
      },
      {
        pattern: 'join',
        nexts: [
          {
            pattern: new RegExp(
              `^[0-9A-Za-z]{${INVITE_CODE_MIN_LENGTH},${INVITE_CODE_MAX_LENGTH}}$`,
            ),
            name: 'inviteCode',
            tag: 'app-room-join',
            back: '/',
          },
        ],
      },
    ],
  },
];

@Component({
  tag: 'app-root',
  styleUrl: 'app-root.scss',
})
export class AppRoot {
  private app!: App;

  constructor() {
    const appEnv = new AppEnv();
    const appMsg = new AppMsg();
    const appFirebase = new AppFirebase(appEnv);
    this.app = new App(appEnv, appMsg, appFirebase);
  }

  async componentWillLoad() {
    try {
      await this.app.init();
    } catch (err) {
      if (err instanceof Error) {
        await this.app.showError(err);
      } else {
        await this.app.showError(new AppError(undefined, { err }));
      }
      throw err;
    }
  }

  render() {
    return (
      <Host>
        <ap-root routeMatches={matches} componentProps={{ app: this.app }} />
      </Host>
    );
  }
}
