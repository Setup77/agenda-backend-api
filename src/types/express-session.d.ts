import 'express-session';

declare module 'express-session' {
  interface SessionData {
    captcha?: {
      value: number;
      expiresAt: number;
    };
    csrfToken?: string;
  }
}
