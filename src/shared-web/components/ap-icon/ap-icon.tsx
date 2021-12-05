import { Component, h, Host, Prop } from '@stencil/core';
import reload from 'bootstrap-icons/icons/arrow-clockwise.svg';
import arrowReturnLeft from 'bootstrap-icons/icons/arrow-return-left.svg';
import dizzy from 'bootstrap-icons/icons/emoji-dizzy.svg';
import exclamationDiamondFill from 'bootstrap-icons/icons/exclamation-diamond-fill.svg';
import gear from 'bootstrap-icons/icons/gear.svg';
import pencil from 'bootstrap-icons/icons/pencil.svg';
import trash from 'bootstrap-icons/icons/trash.svg';

const toHTML = (s: string) => {
  return atob(s.split(',')[1] || '');
};

const svgMap = {
  dizzy: toHTML(dizzy),
  exclamationDiamondFill: toHTML(exclamationDiamondFill),
  arrowReturnLeft: toHTML(arrowReturnLeft),
  reload: toHTML(reload),
  pencil: toHTML(pencil),
  trash: toHTML(trash),
  gear: toHTML(gear),
  announcing: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="-10 0 635 1000">
  <path fill="currentColor"
d="M326 128q12 14 58 53.5t84 74.5t70 89t32 105q0 95 -122 174q-14 9 -25 -5q-8 -13 4 -23q53 -39 71.5 -68t18.5 -68q0 -47 -52 -102.5t-142 -95.5q-8 -4 -8 5v453q0 71 -40 110.5t-110 39.5q-48 0 -79 -25.5t-31 -64.5q0 -49 39 -82t101 -33q39 0 74 19h2q1 -1 1 -2v-550
q0 -9 6 -15.5t15 -6.5q19 0 33 18z" />
</svg>
`,
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
