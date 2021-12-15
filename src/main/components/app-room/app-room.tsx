import { Component, Fragment, h, Host, Listen, Prop, State, Watch } from '@stencil/core';
import { AsyncReturnType } from 'type-fest';
import { assertIsDefined, AUTHOR_MAX_LENGTH, BODY_TEXT_MAX_LENGTH } from '../../../shared';
import {
  FirestoreUpdatedEvent,
  href,
  PromiseState,
  redirectRoute,
  setDocumentTitle,
  setHeaderButtons,
} from '../../../shared-web';
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

  @Watch('activePage')
  watchActivePage() {
    if (this.activePage) {
      this.dataState = undefined;
      this.loadedDataState = undefined;
      this.showPostModal = false;
      this.deleteMsgModal = { show: false };
    }
  }

  @Listen('FirestoreUpdated', { target: 'window' })
  handleFirestoreUpdated(event: FirestoreUpdatedEvent) {
    if (this.activePage) {
      const { collection, id } = event.detail;
      if (collection == 'rooms' && id == this.roomID) {
        this.dataState = undefined;
      }
    }
  }

  @State()
  deleteMsgModal: { show: boolean; idx?: number } = { show: false };

  @State()
  showPostModal = false;

  @State()
  postValues = this.defaultPostValues();

  @State()
  dataState?: PromiseState<AsyncReturnType<AppRoom['loadData']>>;

  private loadedDataState?: AppRoom['dataState'];

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
      this.dataState.then(v => {
        this.loadedDataState = this.dataState;
        this.readTime = this.app.getReadTime(this.roomID);
        if (v) {
          const msgs = v.room.msgs;
          const t = msgs[msgs.length - 1]?.cT.toMillis();
          if (t) {
            this.app.updateReadTime(this.roomID, t);
          }
        }
      });
    }
  }

  private handlers = {
    showPostModalClick: () => {
      this.showPostModal = true;
      this.formFocus = this.postValues.author ? 'body' : 'author';
    },
    postModalClose: () => {
      this.showPostModal = false;
    },
    inputPostAuthor: (ev: Event) => {
      this.postValues = { ...this.postValues, author: (ev.target as HTMLInputElement).value };
    },
    inputPostMsg: (ev: Event) => {
      this.postValues = { ...this.postValues, msg: (ev.target as HTMLTextAreaElement).value };
    },
    postSubmit: async () => {
      await this.app.processLoading(async () => {
        await this.app.putRoomMsg(this.roomID, this.postValues.author, this.postValues.msg);
        this.showPostModal = false;
        this.postValues = this.defaultPostValues();
      });
    },
    realod: () => {
      location.reload();
    },
    showDeleteMsgModalClick: (ev: Event) => {
      const el = ev.currentTarget as HTMLElement;
      const idx = el.getAttribute('data-msg-idx');
      if (idx) {
        this.deleteMsgModal = { show: true, idx: parseInt(idx) };
      }
    },
    deleteMsgModalClose: () => {
      this.deleteMsgModal = { show: false };
    },
    deleteMsgSubmit: async () => {
      const idx = this.deleteMsgModal.idx;
      if (idx === undefined) {
        return;
      }
      await this.app.processLoading(async () => {
        await this.app.deleteRoomMsg(this.roomID, idx);
        this.deleteMsgModal = { show: false };
      });
    },
  };

  private renderContext() {
    const dataState = this.loadedDataState || this.dataState;
    const dataStatus = dataState?.status();
    assertIsDefined(dataStatus);

    const canPostSubmit = !!this.postValues.author && !!this.postValues.msg;

    return {
      roomID: this.roomID,
      msgs: this.app.msgs,
      handlers: this.handlers,
      postValues: this.postValues,
      showPostModal: this.showPostModal,
      deleteMsgModal: this.deleteMsgModal,
      isAdmin: this.app.isAdmin(this.roomID),
      canPostSubmit,
      dataStatus,
      decryptMsg: (msg: Parameters<App['decryptMsg']>[1]) => {
        return this.app.decryptMsg(this.roomID, msg);
      },
      myFP: this.app.getFP(this.roomID),
      readTime: this.readTime,
      announcingURL: this.app.announcingURL(this.roomID),
    };
  }

  render() {
    if (this.activePage) {
      const { room } = this.dataState?.result() || {};
      const docTitle = room
        ? this.app.msgs.room.pageTitle(room.name)
        : this.app.msgs.common.pageTitle;
      setDocumentTitle(docTitle);

      const headerButtons = [
        {
          label: this.app.msgs.room.postBtn,
          handler: this.handlers.showPostModalClick,
        },
      ];

      setHeaderButtons(headerButtons);
    }

    return render(this.renderContext());
  }

  private formFocus?: string;
  private readTime?: number;

  componentDidRender() {
    if (this.formFocus) {
      document
        .querySelector(`app-room ap-input.${this.formFocus}`)
        ?.querySelector<HTMLInputElement>('input,textarea')
        ?.focus();
      this.formFocus = undefined;
    }

    if (this.readTime) {
      // TODO: should wait children are rendered
      setTimeout(() => {
        const el = document.querySelector(`app-room div.msg .unread`);
        if (el) {
          el.scrollIntoView(true);
        }
        this.readTime = undefined;
      }, 300);
    }
  }

  private defaultPostValues() {
    const author = this.app.getAuthor(this.roomID) || '';
    return {
      author,
      msg: '',
    };
  }
}

type RenderContext = ReturnType<AppRoom['renderContext']>;

const render = (ctx: RenderContext) => {
  return (
    <Host>
      {renderMessages(ctx)}
      {renderPostModal(ctx)}
      {renderDeleteMsgModal(ctx)}
      <div class="buttons">
        <button class="icon" onClick={ctx.handlers.realod}>
          <ap-icon icon="reload" />
        </button>
        <a class="button icon announcing" href={ctx.announcingURL} target="announcing-troom">
          <ap-icon icon="announcing" />
        </a>
      </div>
      {ctx.isAdmin && (
        <div class="admin">
          <a {...href(`/${ctx.roomID}/admin`)}>{ctx.msgs.room.adminPage}</a>
        </div>
      )}
    </Host>
  );
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
          <div class="msgs">
            {msgs.map((v, i, arr) => {
              const msg = ctx.decryptMsg(v);
              if (!msg) {
                // TODO
                return;
              }

              const unread = msg.cT.toMillis() > (ctx.readTime || 0) || i + 1 == arr.length;

              return (
                <div class="msg">
                  <div class="head">
                    <span class="author">{msg.author}</span>
                    <span class="date">{ctx.msgs.common.datetime(msg.cT.toMillis())}</span>
                  </div>
                  <div class="body">
                    {msg.body ? <ap-textview text={msg.body.trim()} /> : <span>(deleted)</span>}
                  </div>
                  <div class="fp">
                    <span>{msg.fp}</span>
                    {msg.body && ctx.myFP == msg.fp && (
                      <button
                        class="icon"
                        data-msg-idx={i}
                        onClick={ctx.handlers.showDeleteMsgModalClick}
                      >
                        <ap-icon icon="trash" />
                      </button>
                    )}
                  </div>
                  {unread && <span class="unread"></span>}
                </div>
              );
            })}
          </div>
        </Fragment>
      );
    }
    default:
      return <ap-spinner />;
  }
};

const renderPostModal = (ctx: RenderContext) => {
  if (ctx.showPostModal) {
    return (
      <ap-modal class="msg-form" onClose={ctx.handlers.postModalClose}>
        <div class="form-modal">
          <ap-input
            class="author"
            label={ctx.msgs.room.form.author}
            maxLength={AUTHOR_MAX_LENGTH}
            onInput={ctx.handlers.inputPostAuthor}
            value={ctx.postValues.author}
            autoFocus={true}
          />
          <ap-input
            class="body"
            textarea={true}
            label={ctx.msgs.room.form.body}
            maxLength={BODY_TEXT_MAX_LENGTH}
            onInput={ctx.handlers.inputPostMsg}
            value={ctx.postValues.msg}
          />
          <div class="buttons">
            <button onClick={ctx.handlers.postModalClose} class="clear cancel">
              {ctx.msgs.common.cancel}
            </button>
            <button onClick={ctx.handlers.postSubmit} class="submit" disabled={!ctx.canPostSubmit}>
              {ctx.msgs.room.form.submit}
            </button>
          </div>
        </div>
      </ap-modal>
    );
  }
};

const renderDeleteMsgModal = (ctx: RenderContext) => {
  if (!ctx.deleteMsgModal.show) {
    return;
  }

  return (
    <ap-modal class="delete-msg" onClose={ctx.handlers.deleteMsgModalClose}>
      <div class="desc">{ctx.msgs.room.deleteMsg}</div>
      <div class="buttons">
        <button onClick={ctx.handlers.deleteMsgModalClose} class="clear cancel">
          {ctx.msgs.common.cancel}
        </button>
        <button onClick={ctx.handlers.deleteMsgSubmit} class="submit">
          {ctx.msgs.common.ok}
        </button>
      </div>
    </ap-modal>
  );
};
