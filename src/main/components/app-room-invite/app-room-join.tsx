import { Component, h, Host, Prop, State, Watch } from '@stencil/core';
import { AsyncReturnType } from 'type-fest';
import { assertIsDefined } from '../../../shared';
import { PromiseState, redirectRoute, setDocumentTitle } from '../../../shared-web';
import { App } from '../../app/app';

@Component({
  tag: 'app-room-join',
  styleUrl: 'app-room-join.scss',
})
export class AppRoomJoin {
  @Prop()
  activePage!: boolean;

  @Prop()
  app!: App;

  @Prop()
  roomID!: string;

  @Prop()
  inviteCode!: string;

  @Watch('activePage')
  watchActivePage() {
    this.dataState = undefined;
  }

  @State()
  dataState?: PromiseState<AsyncReturnType<AppRoomJoin['loadData']>>;

  private async loadData() {
    const joined = await this.app.joinRoom(this.roomID, this.inviteCode);
    if (joined) {
      redirectRoute(`/${this.roomID}`);
      return true;
    }
    return false;
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
      dataStatus,
    };
  }

  render() {
    if (this.activePage) {
      setDocumentTitle(this.app.msgs.roomJoin.pageTitle);
    }

    return render(this.renderContext());
  }
}

type RenderContext = ReturnType<AppRoomJoin['renderContext']>;

const render = (ctx: RenderContext) => {
  return <Host>{renderContent(ctx)}</Host>;
};

const renderContent = (ctx: RenderContext) => {
  switch (ctx.dataStatus.state) {
    case 'fulfilled': {
      if (!ctx.dataStatus.value) {
        return <div>{ctx.msgs.roomJoin.invalidURL}</div>;
      }
      break;
    }
    default:
      return <ap-spinner />;
  }
};
