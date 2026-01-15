import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import { sanitizeRequest } from "./middleware/sanitize";
import morgan from "morgan";
import path from "node:path";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { apiRouter } from "./routes/index";
import { errorHandler, notFound } from "./middleware/errorHandler";

import { s3 } from "./config/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import type { Readable } from "node:stream";

export function createServer() {
  const app = express();

  // ✅ Render / reverse proxy
  app.set("trust proxy", 1);

  // ✅ ВАЖНО: иначе браузер будет блокать картинки cross-origin (Vercel -> Render)
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" }, // <--- КЛЮЧЕВО
    })
  );

  app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
  app.use(compression());
  app.use(cookieParser());
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(sanitizeRequest);

  const publicDir = path.join(process.cwd(), "public");
  app.use(express.static(publicDir));
  app.use("/public", express.static(publicDir));
  app.use("/uploads", express.static(path.resolve(env.UPLOAD_DIR)));

  if (env.NODE_ENV !== "production") app.use(morgan("dev"));

  app.use(
    "/api",
    rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: env.RATE_LIMIT_MAX,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  // ====== PROXY S3 -> BACKEND PATH ======
  async function serveCarImage(req: express.Request, res: express.Response, next: express.NextFunction) {
    const { slug, filename } = req.params;
    const key = `cars/${slug}/${filename}`;

    try {
      const result = await s3.send(
        new GetObjectCommand({
          Bucket: env.AWS_S3_BUCKET!,
          Key: key,
        })
      );

      if (result.ContentType) res.setHeader("Content-Type", result.ContentType);
      // чтобы браузер кэшировал
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

      (result.Body as Readable).pipe(res);
    } catch {
      // если ключа нет — пусть будет нормальный 404 (а не блок NotSameOrigin)
      res.status(404).json({ success: false, error: "Not Found", key });
    }
  }

  // ✅ поддерживаем ВСЕ варианты URL, которые у тебя сейчас встречаются
  app.get("/cars/:slug/:filename", serveCarImage);
  app.get("/api/v1/cars/:slug/:filename", serveCarImage);
  app.get("/api/cars/:slug/:filename", serveCarImage);

  // API
  app.use("/api/v1", apiRouter);
  app.use("/api", apiRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
