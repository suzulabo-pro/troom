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
    this.dataState = undefined;
    this.loadedDataState = undefined;
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
      this.dataState.then(() => {
        this.loadedDataState = this.dataState;
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
      isAdmin: this.app.isAdmin(this.roomID),
      canPostSubmit,
      dataStatus,
      decryptMsg: (msg: Parameters<App['decryptMsg']>[1]) => {
        return this.app.decryptMsg(this.roomID, msg);
      },
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

  componentDidRender() {
    if (this.formFocus) {
      document
        .querySelector(`app-room ap-input.${this.formFocus}`)
        ?.querySelector<HTMLInputElement>('input,textarea')
        ?.focus();
      this.formFocus = undefined;
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
            {msgs.map(v => {
              const msg = ctx.decryptMsg(v);
              if (!msg) {
                // TODO
                return;
              }

              return (
                <div class="msg">
                  <div class="head">
                    <span class="author">{msg.author}</span>
                    <span class="date">{ctx.msgs.common.datetime(msg.cT.toMillis())}</span>
                  </div>
                  <div class="body">
                    <ap-textview text={msg.body} />
                  </div>
                  <div class="fp">{msg.fp}</div>
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
      <ap-modal onClose={ctx.handlers.postModalClose}>
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
