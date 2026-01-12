import type { Request, Response, NextFunction } from 'express';

function sanitizeObject(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) obj[i] = sanitizeObject(obj[i]);
    return obj;
  }

  for (const key of Object.keys(obj)) {
    const val = obj[key];
    const isBad = key.startsWith('$') || key.includes('.');
    const safeKey = key.replace(/^\$+/g, '_').replace(/\./g, '_');

    const cleanVal = sanitizeObject(val);

    if (isBad) {
      if (!(safeKey in obj)) obj[safeKey] = cleanVal;
      delete obj[key];
    } else {
      obj[key] = cleanVal;
    }
  }
  return obj;
}

export function sanitizeRequest(req: Request, _res: Response, next: NextFunction) {
  if (req.body && typeof req.body === 'object') sanitizeObject(req.body);
  if (req.params && typeof req.params === 'object') sanitizeObject(req.params as any);
  if (req.query && typeof req.query === 'object') sanitizeObject(req.query as any);
  next();
}
