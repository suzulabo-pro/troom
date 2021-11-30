import { Component, Fragment, h, Host, Prop, State } from '@stencil/core';
import { AsyncReturnType } from 'type-fest';
import { assertIsDefined, AUTHOR_MAX_LENGTH, BODY_TEXT_MAX_LENGTH } from '../../../shared';
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
  showForm = false;

  @State()
  values = this.defaultValues();

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
    showFormClick: () => {
      console.log('showFormClick');
      this.showForm = true;
      this.formFocus = this.values.author ? 'body' : 'author';
    },
    formClose: () => {
      console.log('formClose');
      this.showForm = false;
    },
    inputAuthor: (ev: Event) => {
      this.values = { ...this.values, author: (ev.target as HTMLTextAreaElement).value };
    },
    inputMsg: (ev: Event) => {
      this.values = { ...this.values, msg: (ev.target as HTMLTextAreaElement).value };
    },
    submit: async () => {
      await this.app.processLoading(async () => {
        await this.app.putRoomMsg(this.roomID, this.values.author, this.values.msg);
        this.showForm = false;
        this.values = this.defaultValues();
      });
    },
  };

  private renderContext() {
    const dataStatus = this.dataState?.status();
    assertIsDefined(dataStatus);

    const canSubmit = !!this.values.author && !!this.values.msg;

    return {
      msgs: this.app.msgs,
      handlers: this.handlers,
      values: this.values,
      showForm: this.showForm,
      canSubmit,
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

  private defaultValues() {
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
      {renderForm(ctx)}
      <button class="show-form icon" onClick={ctx.handlers.showFormClick}>
        <ap-icon icon="pencil" />
      </button>
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

const renderForm = (ctx: RenderContext) => {
  if (ctx.showForm) {
    return (
      <ap-modal onClose={ctx.handlers.formClose}>
        <div class="form-modal">
          <ap-input
            class="author"
            label={ctx.msgs.room.form.author}
            maxLength={AUTHOR_MAX_LENGTH}
            onInput={ctx.handlers.inputAuthor}
            value={ctx.values.author}
            autoFocus={true}
          />
          <ap-input
            class="body"
            textarea={true}
            label={ctx.msgs.room.form.body}
            maxLength={BODY_TEXT_MAX_LENGTH}
            onInput={ctx.handlers.inputMsg}
            value={ctx.values.msg}
          />
          <div class="buttons">
            <button onClick={ctx.handlers.formClose} class="clear cancel">
              {ctx.msgs.common.cancel}
            </button>
            <button onClick={ctx.handlers.submit} class="submit" disabled={!ctx.canSubmit}>
              {ctx.msgs.room.form.submit}
            </button>
          </div>
        </div>
      </ap-modal>
    );
  }
};
