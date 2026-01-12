import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/api';

export function notFound(req: Request, res: Response) {
  if (res.headersSent) return; // на всякий случай
  res.status(404).json({ success: false, error: 'Not Found', path: req.originalUrl });
}

export function errorHandler(err: any, _req: Request, res: Response, next: NextFunction) {
  if (res.headersSent) return next(err); // ← не пытаемся отправить повторно

  const status = err instanceof ApiError ? err.statusCode : (err?.statusCode || 500);
  const message = err?.message || 'Server Error';

  const payload: any = { success: false, error: message };
  if (err?.details) payload.details = err.details;
  if (process.env.NODE_ENV !== 'production' && err?.stack) payload.stack = err.stack;

  res.status(status).json(payload);
}
