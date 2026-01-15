require("dotenv").config();

const fs = require("fs/promises");
const path = require("path");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

function contentTypeByExt(filename) {
  const ext = path.extname(filename).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  return "application/octet-stream";
}

const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || "";
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || "";
const AWS_REGION = process.env.AWS_REGION || "ru-central1";
const AWS_ENDPOINT = process.env.AWS_ENDPOINT || "https://storage.yandexcloud.net";
const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET || "";
const AWS_PUBLIC_READ = (process.env.AWS_PUBLIC_READ ?? "true") === "true";

if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_S3_BUCKET) {
  console.error("❌ Не хватает переменных окружения: AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY / AWS_S3_BUCKET");
  process.exit(1);
}

const s3 = new S3Client({
  region: AWS_REGION,
  endpoint: AWS_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

async function main() {
  const carsDir = path.resolve(__dirname, "..", "public", "cars");
  console.log("📁 Беру локальные файлы из:", carsDir);

  const slugs = await fs.readdir(carsDir);
  let uploaded = 0;

  for (const slug of slugs) {
    const slugPath = path.join(carsDir, slug);
    const stat = await fs.stat(slugPath);
    if (!stat.isDirectory()) continue;

    const files = await fs.readdir(slugPath);
    for (const filename of files) {
      const filePath = path.join(slugPath, filename);
      const fileStat = await fs.stat(filePath);
      if (!fileStat.isFile()) continue;

      const key = `cars/${slug}/${filename}`;
      const body = await fs.readFile(filePath);

      await s3.send(
        new PutObjectCommand({
          Bucket: AWS_S3_BUCKET,
          Key: key,
          Body: body,
          ContentType: contentTypeByExt(filename),
          CacheControl: "public, max-age=31536000, immutable",
          ...(AWS_PUBLIC_READ ? { ACL: "public-read" } : {}),
        })
      );

      uploaded += 1;
      console.log(`✅ Uploaded: ${key}`);
    }
  }

  console.log(`\n🎉 Готово. Загружено файлов: ${uploaded}`);
}

main().catch((e) => {
  console.error("❌ Ошибка миграции:", e);
  process.exit(1);
});
