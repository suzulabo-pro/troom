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
    dataError: 'データの読み込み中にエラーが発生しました。\nしばらくしてから再度お試しください。',
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
    created: '作成日 : ',
    lastPost: '最新投稿 : ',
    createForm: { name: 'ルーム名' },
    deleteConfirm: (s: string) => `「${s}」から退室します。\nよろしいですか？`,
    deleteBtn: '削除する',
  },
  room: {
    pageTitle: (s: string) => `${s} - ${titleSuffix}`,
    adminPage: '管理者ページ',
    postBtn: '投稿',
    form: {
      author: '名前',
      body: 'メッセージ',
      submit: '送信',
    },
  },
  roomAdmin: {
    pageTitle: (s: string) => `${s} - 設定 - ${titleSuffix}`,
    roomForm: {
      name: 'ルーム名',
      updateBtn: '更新する',
    },
    inviteForm: {
      genURLBtn: '招待URLを発行する',
    },
  },
  roomJoin: {
    pageTitle: 'ROOM参加',
    invalidURL: 'このURLは無効です',
  },
};
