import { format } from 'date-fns';
import { Msgs } from './msgs';

const titleSuffix = 'troom';

export const msgs: Msgs = {
  common: {
    back: '戻る',
    next: '次へ',
    cancel: 'キャンセル',
    close: '閉じる',
    ok: 'OK',
    datetime: (d: number) => {
      if (d > 0) {
        return format(d, 'yyyy/MM/dd H:mm');
      }
      return '';
    },
    pageTitle: titleSuffix,
  },
  error: {
    main: 'ご迷惑をおかけします。\nしばらくしてから再度お試しください。',
    showErrors: 'エラー内容を表示',
    close: '閉じる',
    datetime: (d: number) => {
      if (d > 0) {
        return format(d, 'yyyy/MM/dd H:mm:ss');
      }
      return '';
    },
  },
  home: {
    pageTitle: titleSuffix,
    createBtn: 'ルームを作る',
    createForm: { name: 'ルーム名' },
  },
};
