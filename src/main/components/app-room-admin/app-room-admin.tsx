import { Component, h, Host, Prop, State, Watch } from '@stencil/core';
import { AsyncReturnType } from 'type-fest';
import { assertIsDefined, ROOM_NAME_MAX_LENGTH } from '../../../shared';
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

  @Watch('activePage')
  watchActivePage() {
    this.dataState = undefined;
    this.inviteURL = undefined;
  }

  @State()
  roomName?: string;

  @State()
  inviteURL?: string;

  @State()
  dataState?: PromiseState<AsyncReturnType<AppRoomAdmin['loadData']>>;

  private async loadData() {
    const room = await this.app.getRoom(this.roomID);
    if (!room) {
      return;
    }
    return { room };
  }

  componentWillRender() {
    if (!this.dataState) {
      this.dataState = new PromiseState(this.loadData());
      this.dataState.then(value => {
        if (value) {
          this.roomName = value.room.name;
        }
      });
    }
  }

  private handlers = {
    inputRoomName: (ev: Event) => {
      this.roomName = (ev.target as HTMLInputElement).value;
    },
    roomFormSubmit: async () => {
      await this.app.processLoading(async () => {
        if (this.roomName) {
          await this.app.editRoom(this.roomID, this.roomName);
          this.dataState = undefined;
        }
      });
    },
    genInviteURLClick: async () => {
      await this.app.processLoading(async () => {
        this.inviteURL = await this.app.genInviteURL(this.roomID);
      });
    },
  };

  private renderContext() {
    const dataStatus = this.dataState?.status();
    assertIsDefined(dataStatus);

    const { room } = this.dataState?.result() || {};

    const canRoomFormSubmit = !!this.roomName && this.roomName != room?.name;

    return {
      roomID: this.roomID,
      msgs: this.app.msgs,
      handlers: this.handlers,
      roomName: this.roomName,
      inviteURL: this.inviteURL,
      canRoomFormSubmit,
      isAdmin: this.app.isAdmin(this.roomID),
      dataStatus,
    };
  }

  render() {
    if (this.activePage) {
      const { room } = this.dataState?.result() || {};
      const docTitle = room
        ? this.app.msgs.roomAdmin.pageTitle(room.name)
        : this.app.msgs.common.pageTitle;
      setDocumentTitle(docTitle);
    }

    return render(this.renderContext());
  }
}

type RenderContext = ReturnType<AppRoomAdmin['renderContext']>;

const render = (ctx: RenderContext) => {
  return (
    <Host>
      {renderRoomForm(ctx)}
      {renderInviteForm(ctx)}
    </Host>
  );
};

const renderRoomForm = (ctx: RenderContext) => {
  return (
    <div class="room-form">
      <ap-input
        label={ctx.msgs.roomAdmin.roomForm.name}
        maxLength={ROOM_NAME_MAX_LENGTH}
        value={ctx.roomName}
        onInput={ctx.handlers.inputRoomName}
      />
      <button
        class="submit"
        disabled={!ctx.canRoomFormSubmit}
        onClick={ctx.handlers.roomFormSubmit}
      >
        {ctx.msgs.roomAdmin.roomForm.updateBtn}
      </button>
    </div>
  );
};

const renderInviteForm = (ctx: RenderContext) => {
  return (
    <div class="invite-form">
      <button class="generate" onClick={ctx.handlers.genInviteURLClick}>
        {ctx.msgs.roomAdmin.inviteForm.genURLBtn}
      </button>
      {ctx.inviteURL && (
        <div class="url">
          <span>{ctx.inviteURL}</span>
        </div>
      )}
    </div>
  );
};
