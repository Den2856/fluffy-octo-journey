import jwt from "jsonwebtoken";
import type { Role } from "../models/user.model";
import { env } from "../config/env";

export type JwtPayload = {
  sub: string;   // userId
  role: Role;    // роль
};

export function signToken(payload: JwtPayload) {
  //@ts-ignore
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

export function verifyToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}
