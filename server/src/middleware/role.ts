import type { Response, NextFunction } from "express";
import type { AuthedRequest } from "./auth";
import { ApiError } from "../utils/api";
import type { Role } from "../models/user.model";

export function requireRole(...allowed: Role[]) {
  return (req: AuthedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new ApiError(401, "Not authenticated"));
    if (!allowed.includes(req.user.role as Role)) return next(new ApiError(403, "Forbidden"));
    next();
  };
}
