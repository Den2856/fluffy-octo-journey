import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "./env";

export const S3_BUCKET = env.AWS_S3_BUCKET;


export const s3 = new S3Client({
  region: env.AWS_REGION,
  endpoint: env.AWS_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY!,
  },
});

/**
 * Загружает файл в бакет S3.
 * @param key путь/имя файла внутри бакета, например `cars/tesla-model-s/image.jpg`
 * @param body буфер файла
 * @param contentType MIME‑тип
 */
export async function uploadToS3(key: string, body: Buffer, contentType: string): Promise<void> {
  await s3.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
}

/**
 * Формирует публичный URL к файлу. Если переменная ASSETS_ORIGIN задана
 */
export function generatePublicUrl(key: string): string {
  const base = env.ASSETS_ORIGIN
    ? env.ASSETS_ORIGIN.replace(/\/$/, "")
    : `${env.AWS_ENDPOINT.replace(/\/$/, "")}/${env.AWS_S3_BUCKET}`;
  return `${base}/${key}`;
}
