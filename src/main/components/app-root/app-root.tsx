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
    reload: true,
  },
  {
    pattern: 'config',
    tag: 'app-config',
    back: '/',
  },
  {
    pattern: 'about',
    tag: 'app-about',
    back: '/',
  },
  {
    pattern: /^([0-9A-Z]{12}|[0-9A-Z]{5}-[0-9a-zA-Z]{1,5})$/,
    name: 'announceID',
    tag: 'app-announce',
    back: '/',
    nexts: [
      {
        pattern: 'config',
        tag: 'app-announce-config',
        back: p => `/${p['announceID']}`,
      },
      {
        pattern: /^[0-9a-zA-Z]{8}$/,
        name: 'postID',
        tag: 'app-post',
        back: p => `/${p['announceID']}`,
        nexts: [
          {
            pattern: 'image',
            nexts: [
              {
                pattern: /^[0-9a-zA-Z]{15,25}$/,
                name: 'imageID',
                tag: 'app-image',
                back: p => `/${p['announceID']}/${p['postID']}`,
                fitPage: true,
              },
            ],
          },
          {
            pattern: 'image_uri',
            nexts: [
              {
                pattern: /^[0-9a-zA-Z]{1,1500}$/,
                name: 'image62',
                tag: 'app-image',
                back: p => `/${p['announceID']}/${p['postID']}`,
                fitPage: true,
              },
            ],
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
