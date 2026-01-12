import "dotenv/config";

export const NODE_ENV = process.env.NODE_ENV ?? "development";
export const PORT = Number(process.env.PORT ?? 4013);
export const CLIENT_URL = process.env.CLIENT_URL ?? "http://localhost:5173";
export const MONGO_URI = process.env.MONGO_URI ?? "mongodb://localhost:27017/optrent";

export const JWT_SECRET: string = process.env.JWT_SECRET || "dev";
export const JWT_EXPIRES_IN: string | number = process.env.JWT_EXPIRES_IN || "7d";
export const JWT_COOKIE_SECURE: boolean =
  (process.env.JWT_COOKIE_SECURE ?? "false") === "true";

// ✅ SMTP (Yandex)
export const SMTP_HOST = process.env.SMTP_HOST ?? "smtp.yandex.ru";
export const SMTP_PORT = Number(process.env.SMTP_PORT ?? 465);
export const SMTP_USER = process.env.SMTP_USER ?? "";
export const SMTP_PASS = process.env.SMTP_PASS ?? "";
export const TO_EMAIL = process.env.TO_EMAIL ?? "";

export const UPLOAD_DIR: string = process.env.UPLOAD_DIR || 'uploads';
export const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60000);
export const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX ?? 100);

export const ASSETS_ORIGIN = process.env.ASSETS_ORIGIN 




export const env = {
  NODE_ENV,
  PORT,
  CLIENT_URL,
  MONGO_URI,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  JWT_COOKIE_SECURE,
  UPLOAD_DIR,
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  TO_EMAIL,
  ASSETS_ORIGIN
};
