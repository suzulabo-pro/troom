import { Component, h, Host, Prop } from '@stencil/core';
import { setDocumentTitle, setHeaderButtons } from '../../../shared-web';
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

  private renderContext() {
    return {
      msgs: this.app.msgs,
    };
  }

  private headerButtons = [
    {
      label: this.app.msgs.home.config,
      href: '/config',
    },
    {
      label: this.app.msgs.home.about,
      href: '/about',
    },
  ];

  render() {
    if (this.activePage) {
      setDocumentTitle(this.app.msgs.home.pageTitle);
      setHeaderButtons(this.headerButtons);
    }

    return render(this.renderContext());
  }
}

type RenderContext = ReturnType<AppHome['renderContext']>;

const render = (ctx: RenderContext) => {
  return <Host>{renderContent(ctx)}</Host>;
};

const renderContent = (ctx: RenderContext) => {
  //
  console.log(ctx);
  return <div>home</div>;
};
