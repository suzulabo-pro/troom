import { Component, h, Host, Prop } from '@stencil/core';
import reload from 'bootstrap-icons/icons/arrow-clockwise.svg';
import arrowReturnLeft from 'bootstrap-icons/icons/arrow-return-left.svg';
import dizzy from 'bootstrap-icons/icons/emoji-dizzy.svg';
import exclamationDiamondFill from 'bootstrap-icons/icons/exclamation-diamond-fill.svg';
import pencil from 'bootstrap-icons/icons/pencil.svg';

const toHTML = (s: string) => {
  return atob(s.split(',')[1] || '');
};

const svgMap = {
  dizzy: toHTML(dizzy),
  exclamationDiamondFill: toHTML(exclamationDiamondFill),
  arrowReturnLeft: toHTML(arrowReturnLeft),
  reload: toHTML(reload),
  pencil: toHTML(pencil),
};
export type Icons = keyof typeof svgMap;

@Component({
  tag: 'ap-icon',
  styleUrl: 'ap-icon.scss',
})
export class ApIcon {
  @Prop()
  icon?: Icons;

  render() {
    return <Host innerHTML={this.icon && svgMap[this.icon]}></Host>;
  }
}
