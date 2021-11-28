import { Component, h, Host, Prop, State } from '@stencil/core';
import { ROOM_NAME_MAX_LENGTH } from '../../../shared';
import { setDocumentTitle } from '../../../shared-web';
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

  componentWillRender() {
    //
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
    const canSubmit = !!this.values?.name;

    return {
      msgs: this.app.msgs,
      handlers: this.handlers,
      showCreateModal: this.showCreateModal,
      values: this.values,
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
      {renderContent(ctx)}
      {renderCreateModal(ctx)}
    </Host>
  );
};

const renderContent = (ctx: RenderContext) => {
  return (
    <button class="create" onClick={ctx.handlers.createClick}>
      {ctx.msgs.home.createBtn}
    </button>
  );
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
