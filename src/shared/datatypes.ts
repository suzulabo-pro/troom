const languages = ['en', 'ja'] as const;
export type Lang = typeof languages[number];
