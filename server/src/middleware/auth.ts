import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/jwt";
import { UserModel } from "../models/user.model";
import { ApiError } from "../utils/api";

export type AuthedRequest = Request & {
  user?: { id: string; role: string; email: string; name: string };
};

export async function requireAuth(req: AuthedRequest, _res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.cookies?.token;
    if (!token) return next(new ApiError(401, "Not authenticated"));

    const payload = verifyToken(token);
    const user = await UserModel.findById(payload.sub).select("name email role");
    if (!user) return next(new ApiError(401, "User not found"));

    req.user = { id: String(user._id), name: user.name, email: user.email, role: user.role };
    next();
  } catch {
    next(new ApiError(401, "Invalid or expired token"));
  }
}
