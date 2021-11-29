import { Component, Fragment, h, Host, Prop, State } from '@stencil/core';
import { AsyncReturnType } from 'type-fest';
import { assertIsDefined } from '../../../shared';
import { PromiseState, redirectRoute, setDocumentTitle } from '../../../shared-web';
import { App } from '../../app/app';

@Component({
  tag: 'app-room',
  styleUrl: 'app-room.scss',
})
export class AppRoom {
  @Prop()
  activePage!: boolean;

  @Prop()
  app!: App;

  @Prop()
  roomID!: string;

  @State()
  values?: { msg: string };

  @State()
  dataState?: PromiseState<AsyncReturnType<AppRoom['loadData']>>;

  private async loadData() {
    if (!this.app.isMyRoom(this.roomID)) {
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

  private handlers = {
    inputMsg: (ev: Event) => {
      this.values = { ...this.values, msg: (ev.target as HTMLTextAreaElement).value };
    },
  };

  private renderContext() {
    const dataStatus = this.dataState?.status();
    assertIsDefined(dataStatus);

    return {
      msgs: this.app.msgs,
      handlers: this.handlers,
      values: this.values,
      dataStatus,
      id: this.roomID,
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

type RenderContext = ReturnType<AppRoom['renderContext']>;

const render = (ctx: RenderContext) => {
  return <Host>{renderMessages(ctx)}</Host>;
};

const renderMessages = (ctx: RenderContext) => {
  switch (ctx.dataStatus.state) {
    case 'rejected':
      return <span class="data-error">{ctx.msgs.common.dataError}</span>;
    case 'fulfilled-empty':
      redirectRoute('/');
      return;
    case 'fulfilled': {
      const value = ctx.dataStatus.value;
      const msgs = value.room.msgs || [];
      return (
        <Fragment>
          <div class="name">{value.room.name}</div>
          <div class="rooms">
            {msgs.map(v => {
              return <div>{v.author}</div>;
            })}
          </div>
          <div class="form">
            <textarea class="msg" onInput={ctx.handlers.inputMsg}>
              {ctx.values?.msg}
            </textarea>
            <button class="icon submit">
              <ap-icon icon="plus" />
            </button>
          </div>
        </Fragment>
      );
    }
    default:
      return <ap-spinner />;
  }
};
