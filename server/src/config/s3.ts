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

export async function uploadToS3(params: {
  key: string;
  body: Buffer;
  contentType: string;
  cacheControl?: string;
}) {
  if (!S3_BUCKET) throw new Error("AWS_S3_BUCKET is empty");
  await s3.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: params.key,
      Body: params.body,
      ContentType: params.contentType,
      CacheControl: params.cacheControl ?? "public, max-age=31536000, immutable",
      ...(env.AWS_PUBLIC_READ ? { ACL: "public-read" as const } : {}),
    })
  );
}

export function generatePublicUrl(key: string): string {
  const base = (env.ASSETS_ORIGIN || "").replace(/\/$/, "");
  if (base) return `${base}/${key.replace(/^\//, "")}`;
  const ep = env.AWS_ENDPOINT.replace(/\/$/, "");
  return `${ep}/${env.AWS_S3_BUCKET}/${key.replace(/^\//, "")}`;
}
