import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { sanitizeRequest } from './middleware/sanitize';
import morgan from 'morgan';
import path from 'node:path';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { apiRouter } from './routes/index';
import { errorHandler, notFound } from './middleware/errorHandler';
import { s3 } from "./config/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import type { Readable } from "node:stream";

export function createServer() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
  app.use(compression());
  app.use(cookieParser());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(sanitizeRequest);

  const publicDir = path.join(process.cwd(), "public");
  app.use(express.static(publicDir));

  if (env.NODE_ENV !== 'production') app.use(morgan('dev'));

  app.use(
    '/api',
    rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: env.RATE_LIMIT_MAX,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  // Проксируем запросы /cars/:slug/:filename к S3
  app.get('/cars/:slug/:filename', async (req, res, next) => {
    const { slug, filename } = req.params;
    const key = `cars/${slug}/${filename}`;
    try {
      const result = await s3.send(
        new GetObjectCommand({
          Bucket: env.AWS_S3_BUCKET!,
          Key: key,
        }),
      );
      if (result.ContentType) res.setHeader('Content-Type', result.ContentType);
      (result.Body as Readable).pipe(res);
    } catch (err) {
      // если объекта нет, отдаём 404
      next();
    }
  });

  // Дополнительные статики (опционально)
  app.use('/public', express.static(publicDir));
  app.use('/uploads', express.static(path.resolve(env.UPLOAD_DIR)));

  // API
  app.use('/api/v1', apiRouter);
  app.use('/api', apiRouter);

  // 404 и обработчик ошибок
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
