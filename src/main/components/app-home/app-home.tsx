import { Component, Fragment, h, Host, Prop, State } from '@stencil/core';
import { AsyncReturnType } from 'type-fest';
import { assertIsDefined, ROOM_NAME_MAX_LENGTH } from '../../../shared';
import { href, PromiseState, setDocumentTitle } from '../../../shared-web';
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

  @State()
  showCreateModal?: boolean;

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
        }
      });
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
              return (
                <a {...href(`/${v.id}`)} class="card">
                  {v.name}
                  {!v.room && <div>missing</div>}
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
        <div class="buttons"></div>
      </div>
    </ap-modal>
  );
};
