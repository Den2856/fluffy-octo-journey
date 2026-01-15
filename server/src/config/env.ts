import "dotenv/config";
import { URL } from "node:url";

export const NODE_ENV = process.env.NODE_ENV ?? "development";
export const PORT = Number(process.env.PORT ?? 4013);
export const CLIENT_URL = process.env.CLIENT_URL ?? "http://localhost:5173";
export const MONGO_URI = process.env.MONGO_URI ?? "mongodb://localhost:27017/optrent";

export const JWT_SECRET: string = process.env.JWT_SECRET || "dev";
export const JWT_EXPIRES_IN: string | number = process.env.JWT_EXPIRES_IN || "7d";
export const JWT_COOKIE_SECURE: boolean = (process.env.JWT_COOKIE_SECURE ?? "false") === "true";

export const SMTP_HOST = process.env.SMTP_HOST ?? "smtp.yandex.ru";
export const SMTP_PORT = Number(process.env.SMTP_PORT ?? 465);
export const SMTP_USER = process.env.SMTP_USER ?? "";
export const SMTP_PASS = process.env.SMTP_PASS ?? "";
export const TO_EMAIL = process.env.TO_EMAIL ?? "";

export const UPLOAD_DIR: string = process.env.UPLOAD_DIR || "uploads";
export const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60000);
export const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX ?? 100);

export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID ?? "";
export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY ?? "";
export const AWS_REGION = process.env.AWS_REGION ?? "ru-central1";
export const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET ?? "";

// raw endpoint может содержать имя бакета (например https://storage.yandexcloud.net/fluffy-octo-journey)
const RAW_ENDPOINT = process.env.AWS_ENDPOINT ?? "https://storage.yandexcloud.net";

/** 
 * Нормализуем endpoint: выкидываем путь (/bucket), чтобы SDK не дублировал имя бакета 
 */
export const AWS_ENDPOINT = (() => {
  try {
    const u = new URL(RAW_ENDPOINT);
    return `${u.protocol}//${u.host}`;
  } catch {
    return RAW_ENDPOINT;
  }
})();

/** 
 * Заливаем объекты публично? true → добавляется ACL: public-read 
 */
export const AWS_PUBLIC_READ = (process.env.AWS_PUBLIC_READ ?? "true") === "true";

/** 
 * База для генерации публичных ссылок. Если не указана,
 * берётся `${AWS_ENDPOINT}/${AWS_S3_BUCKET}` 
 */
export const ASSETS_ORIGIN =
  (process.env.ASSETS_ORIGIN ?? "").trim() ||
  (AWS_S3_BUCKET ? `${AWS_ENDPOINT.replace(/\/$/, "")}/${AWS_S3_BUCKET}` : "");

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
  ASSETS_ORIGIN,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_REGION,
  AWS_S3_BUCKET,
  AWS_ENDPOINT,
  AWS_PUBLIC_READ,
};
