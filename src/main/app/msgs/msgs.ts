export interface Msgs {
  common: {
    back: string;
    next: string;
    cancel: string;
    close: string;
    ok: string;
    datetime: (d: number) => string;
    pageTitle: string;
    dataError: string;
  };
  error: {
    main: string;
    showErrors: string;
    close: string;
    datetime: (d: number) => string;
  };
  home: {
    pageTitle: string;
    createBtn: string;
    createForm: {
      name: string;
    };
  };
  room: {
    pageTitle: (s: string) => string;
    adminPage: string;
    postBtn: string;
    form: {
      author: string;
      body: string;
      submit: string;
    };
  };
  roomAdmin: {
    pageTitle: (s: string) => string;
    roomForm: {
      name: string;
      updateBtn: string;
    };
    inviteForm: {
      genURLBtn: string;
    };
  };
  roomJoin: {
    pageTitle: string;
    invalidURL: string;
  };
}
