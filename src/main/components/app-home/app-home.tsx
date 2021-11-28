import { Component, h, Host, Prop } from '@stencil/core';
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

  componentWillRender() {
    //
  }

  private handlers = {
    createClick: async () => {
      await this.app.processLoading(async () => {
        await this.app.createRoom();
      });
    },
  };

  private renderContext() {
    return {
      msgs: this.app.msgs,
      handlers: this.handlers,
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
  return <Host>{renderContent(ctx)}</Host>;
};

const renderContent = (ctx: RenderContext) => {
  return (
    <button class="create" onClick={ctx.handlers.createClick}>
      {ctx.msgs.home.createBtn}
    </button>
  );
};
