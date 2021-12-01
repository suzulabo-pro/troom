import { Component, h, Host, Prop, State } from '@stencil/core';
import { AsyncReturnType } from 'type-fest';
import { assertIsDefined } from '../../../shared';
import { PromiseState, setDocumentTitle } from '../../../shared-web';
import { App } from '../../app/app';

@Component({
  tag: 'app-room-admin',
  styleUrl: 'app-room-admin.scss',
})
export class AppRoomAdmin {
  @Prop()
  activePage!: boolean;

  @Prop()
  app!: App;

  @Prop()
  roomID!: string;

  @State()
  dataState?: PromiseState<AsyncReturnType<AppRoomAdmin['loadData']>>;

  private async loadData() {
    if (!this.app.isAdmin(this.roomID)) {
      return;
    }

    const room = await this.app.getRoom(this.roomID);
    if (!room) {
      return;
    }
    return { room };
  }

  componentWillRender() {
    if (!this.dataState) {
      this.dataState = new PromiseState(this.loadData());
    }
  }

  private handlers = {};

  private renderContext() {
    const dataStatus = this.dataState?.status();
    assertIsDefined(dataStatus);

    return {
      roomID: this.roomID,
      msgs: this.app.msgs,
      handlers: this.handlers,
      isAdmin: this.app.isAdmin(this.roomID),
      dataStatus,
    };
  }

  render() {
    if (this.activePage) {
      const { room } = this.dataState?.result() || {};
      const docTitle = room
        ? this.app.msgs.room.pageTitle(room.name)
        : this.app.msgs.common.pageTitle;
      setDocumentTitle(docTitle);
    }

    return render(this.renderContext());
  }
}

type RenderContext = ReturnType<AppRoomAdmin['renderContext']>;

const render = (ctx: RenderContext) => {
  return <Host>AppRoomAdmin{ctx}</Host>;
};
