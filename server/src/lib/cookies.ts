import { env } from "../config/env";

export function authCookieOptions(remember: boolean) {
  const isProd = env.NODE_ENV === "production";
  const sameSite = isProd ? "none" : "lax";

  const base = {
    httpOnly: true,
    secure: isProd ? true : env.JWT_COOKIE_SECURE,
    sameSite: sameSite as "lax" | "none",
    path: "/",
  };

  if (!remember) return base;

  return { ...base, maxAge: 30 * 24 * 60 * 60 * 1000 };
}
