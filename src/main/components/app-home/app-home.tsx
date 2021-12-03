import { Component, Fragment, h, Host, Listen, Prop, State, Watch } from '@stencil/core';
import { AsyncReturnType } from 'type-fest';
import { assertIsDefined, ROOM_NAME_MAX_LENGTH } from '../../../shared';
import {
  FirestoreUpdatedEvent,
  href,
  PromiseState,
  pushRoute,
  setDocumentTitle,
} from '../../../shared-web';
import { App } from '../../app/app';

@Component({
  tag: 'app-home',
  styleUrl: 'app-home.scss',
})
export class AppHome {
  @Prop()
  activePage!: boolean;

  @Prop()
  app!: App;

  @Watch('activePage')
  watchActivePage() {
    this.dataState = undefined;
  }

  @Listen('FirestoreUpdated', { target: 'window' })
  handleFirestoreUpdated(event: FirestoreUpdatedEvent) {
    if (this.activePage) {
      const { collection } = event.detail;
      if (collection == 'rooms') {
        this.dataState = undefined;
      }
    }
  }

  @State()
  showCreateModal?: boolean;

  @State()
  deletingRoom?: { id: string; name: string };

  @State()
  values?: { name?: string };

  @State()
  dataState?: PromiseState<AsyncReturnType<AppHome['loadData']>>;

  private async loadData() {
    const rooms = await this.app.loadRooms();
    return { rooms };
  }

  componentWillRender() {
    if (!this.dataState) {
      this.dataState = new PromiseState(this.loadData());
    }
  }

  private handlers = {
    createClick: () => {
      this.showCreateModal = true;
      this.values = {};
    },
    createModalClose: () => {
      this.showCreateModal = false;
    },
    inputName: (ev: Event) => {
      this.values = { ...this.values, name: (ev.target as HTMLInputElement).value };
    },
    createSubmit: async () => {
      await this.app.processLoading(async () => {
        const name = this.values?.name;
        if (name) {
          await this.app.createRoom(name);
          this.showCreateModal = false;
          this.dataState = undefined;
        }
      });
    },

    deleteClick: (ev: Event) => {
      ev.preventDefault();
      ev.stopPropagation();
      const el = ev.currentTarget as HTMLElement;
      const roomID = el.getAttribute('data-room-id') || undefined;
      if (roomID) {
        this.deletingRoom = { id: roomID, name: this.app.getRoomName(roomID) || '' };
      }
    },
    deleteModalClose: () => {
      this.deletingRoom = undefined;
    },
    deleteSubmit: () => {
      if (this.deletingRoom) {
        this.app.deleteMyRoom(this.deletingRoom.id);
        this.deletingRoom = undefined;
        this.dataState = undefined;
      }
    },

    configClick: (ev: Event) => {
      ev.preventDefault();
      ev.stopPropagation();
      const el = ev.currentTarget as HTMLElement;
      const roomID = el.getAttribute('data-room-id') || undefined;
      if (roomID) {
        pushRoute(`/${roomID}/admin`);
      }
    },
  };

  private renderContext() {
    const dataStatus = this.dataState?.status();
    assertIsDefined(dataStatus);
    const canSubmit = !!this.values?.name;

    return {
      msgs: this.app.msgs,
      handlers: this.handlers,
      showCreateModal: this.showCreateModal,
      deletingRoom: this.deletingRoom,
      values: this.values,
      dataStatus,
      canSubmit,
    };
  }

  render() {
    if (this.activePage) {
      setDocumentTitle(this.app.msgs.home.pageTitle);
    }

    return render(this.renderContext());
  }
}

type RenderContext = ReturnType<AppHome['renderContext']>;

const render = (ctx: RenderContext) => {
  return (
    <Host>
      {renderRooms(ctx)}
      {renderCreateModal(ctx)}
      {renderDeletingModal(ctx)}
    </Host>
  );
};

const renderRooms = (ctx: RenderContext) => {
  switch (ctx.dataStatus.state) {
    case 'rejected':
      return <span class="data-error">{ctx.msgs.common.dataError}</span>;
    case 'fulfilled-empty':
      return;
    case 'fulfilled': {
      const value = ctx.dataStatus.value;
      return (
        <Fragment>
          <div class="rooms-grid">
            {value.rooms.map(v => {
              const room = v.room;
              const lastPost = room?.msgs[room.msgs.length - 1];

              return (
                <a {...href(`/${v.id}`)} class="card">
                  <div class="info">
                    {!room ? (
                      <Fragment>
                        <div class="name">{v.name}</div>
                        <div>Missing ROOM</div>
                      </Fragment>
                    ) : (
                      <Fragment>
                        <div class="name">{room.name}</div>
                        <div class="info-grid">
                          <span class="label">{ctx.msgs.home.lastPost}</span>
                          <span class="value">
                            {lastPost ? ctx.msgs.common.datetime(lastPost.cT.toMillis()) : '-'}
                          </span>
                          <span class="label">{ctx.msgs.home.created}</span>
                          <span class="value">{ctx.msgs.common.datetime(room.cT.toMillis())}</span>
                        </div>
                      </Fragment>
                    )}
                  </div>
                  {v.isAdmin ? (
                    <button
                      class="icon config"
                      data-room-id={v.id}
                      onClick={ctx.handlers.configClick}
                    >
                      <ap-icon icon="gear" />
                    </button>
                  ) : (
                    <button
                      class="icon delete"
                      data-room-id={v.id}
                      onClick={ctx.handlers.deleteClick}
                    >
                      <ap-icon icon="trash" />
                    </button>
                  )}
                </a>
              );
            })}
          </div>
          <button class="create" onClick={ctx.handlers.createClick}>
            {ctx.msgs.home.createBtn}
          </button>
        </Fragment>
      );
    }
    default:
      return <ap-spinner />;
  }
};

const renderCreateModal = (ctx: RenderContext) => {
  if (!ctx.showCreateModal) {
    return;
  }

  return (
    <ap-modal onClose={ctx.handlers.createModalClose}>
      <div class="create-modal">
        <ap-input
          label={ctx.msgs.home.createForm.name}
          maxLength={ROOM_NAME_MAX_LENGTH}
          onInput={ctx.handlers.inputName}
          value={ctx.values?.name}
        />
        <button onClick={ctx.handlers.createSubmit} class="submit" disabled={!ctx.canSubmit}>
          {ctx.msgs.home.createBtn}
        </button>
        <button onClick={ctx.handlers.createModalClose} class="clear cancel">
          {ctx.msgs.common.cancel}
        </button>
      </div>
    </ap-modal>
  );
};

const renderDeletingModal = (ctx: RenderContext) => {
  if (!ctx.deletingRoom) {
    return;
  }

  return (
    <ap-modal onClose={ctx.handlers.deleteModalClose}>
      <div class="delete-modal">
        <div class="desc">{ctx.msgs.home.deleteConfirm(ctx.deletingRoom.name)}</div>
        <div class="buttons">
          <button onClick={ctx.handlers.deleteModalClose} class="clear cancel">
            {ctx.msgs.common.cancel}
          </button>
          <button onClick={ctx.handlers.deleteSubmit} class="submit">
            {ctx.msgs.home.deleteBtn}
          </button>
        </div>
      </div>
    </ap-modal>
  );
};
