import { Component, h, Host } from '@stencil/core';
import { AppEnv, AppError } from '../../../shared';
import { RouteMatch } from '../../../shared-web';
import { App } from '../../app/app';
import { AppFirebase } from '../../app/firebase';
import { AppMsg } from '../../app/msg';

const matches: RouteMatch[] = [
  {
    pattern: '',
    tag: 'app-home',
  },
];

@Component({
  tag: 'app-root',
  styleUrl: 'app-root.scss',
})
export class AppRoot {
  private app!: App;

  constructor() {
    const appMsg = new AppMsg();
    const appEnv = new AppEnv();
    const appFirebase = new AppFirebase(appEnv);
    this.app = new App(appMsg, appFirebase);
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
