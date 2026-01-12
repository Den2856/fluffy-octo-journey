import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { ApiError } from "../utils/api";

function readCookie(raw: string | undefined, key: string) {
  if (!raw) return undefined;
  const parts = raw.split(";").map((s) => s.trim());
  const hit = parts.find((p) => p.startsWith(key + "="));
  if (!hit) return undefined;
  return decodeURIComponent(hit.slice(key.length + 1));
}

export const requireAdmin: RequestHandler = (req, _res, next) => {
  const auth = req.header("authorization");
  const bearer = auth?.startsWith("Bearer ") ? auth.slice(7) : undefined;

  // работает и с cookie-parser, и без него (через req.headers.cookie)
  const token =
    bearer ||
    (req as any).cookies?.token ||
    readCookie(req.headers.cookie, "token");

  if (!token) return next(new ApiError(401, "Not authenticated"));

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as any;

    // кладём user в req чтобы остальные хендлеры могли пользоваться
    (req as any).user = {
      id: String(payload.sub ?? ""),
      role: payload.role,
    };

    if ((req as any).user.role !== "admin") {
      return next(new ApiError(403, "Admin only"));
    }

    next();
  } catch {
    return next(new ApiError(401, "Not authenticated"));
  }
};
