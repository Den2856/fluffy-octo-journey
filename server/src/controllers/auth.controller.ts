import bcrypt from "bcryptjs";
import crypto from "crypto";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError, ok } from "../utils/api";
import { UserModel } from "../models/user.model";
import { signToken } from "../lib/jwt";
import { authCookieOptions } from "../lib/cookies";
import { mailer } from "../lib/mailer";
import { env } from "../config/env";

const toPublic = (u: any) => ({ id: String(u._id), name: u.name, email: u.email, role: u.role });

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body ?? {};
  if (!name || !email || !password) throw new ApiError(400, "name, email, password are required");
  if (String(password).length < 6) throw new ApiError(400, "Password must be at least 6 chars");

  const exists = await UserModel.findOne({ email: String(email).toLowerCase() });
  if (exists) throw new ApiError(409, "Email already in use");

  const passwordHash = await bcrypt.hash(String(password), 10);
  const user = await UserModel.create({
    name,
    email: String(email).toLowerCase(),
    passwordHash,
    role: "user",
  });

  const token = signToken({ sub: String(user._id), role: user.role });
  res.cookie("token", token, authCookieOptions(true)); // после регистрации пусть “запомнит”
  res.json(ok({ user: toPublic(user) }));
});

export const login = asyncHandler(async (req, res) => {
  const { email, password, remember } = req.body ?? {};
  if (!email || !password) throw new ApiError(400, "email and password are required");

  const user = await UserModel.findOne({ email: String(email).toLowerCase() });
  if (!user) throw new ApiError(401, "Invalid credentials");

  const okPass = await bcrypt.compare(String(password), user.passwordHash);
  if (!okPass) throw new ApiError(401, "Invalid credentials");

  const token = signToken({ sub: String(user._id), role: user.role });
  res.cookie("token", token, authCookieOptions(Boolean(remember)));
  res.json(ok({ user: toPublic(user) }));
});

export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie("token", { path: "/" });
  res.json(ok({ message: "Logged out" }));
});

export const me = asyncHandler(async (req: any, res) => {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  res.json(ok({ user: req.user }));
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body ?? {};
  if (!email) throw new ApiError(400, "email is required");

  const user = await UserModel.findOne({ email: String(email).toLowerCase() });
  if (!user) {
    res.json(ok({ message: "If account exists, reset link was sent" }));
    return;
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  user.resetPasswordTokenHash = tokenHash;
  user.resetPasswordExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
  await user.save();

  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${rawToken}`;
  await mailer.sendMail({
    from: env.SMTP_USER,
    to: user.email,
    subject: "Reset your password",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5">
        <h2>Reset password</h2>
        <p>Click the button below to reset your password (valid 30 minutes).</p>
        <p><a href="${resetUrl}" style="display:inline-block;padding:12px 16px;border-radius:12px;background:#111;color:#fff;text-decoration:none">
          Reset Password
        </a></p>
        <p style="color:#666">If you didn't request this, ignore this email.</p>
      </div>
    `,
  });

  res.json(ok({ message: "If account exists, reset link was sent" }));
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body ?? {};
  if (!token || !newPassword) throw new ApiError(400, "token and newPassword are required");
  if (String(newPassword).length < 6) throw new ApiError(400, "Password must be at least 6 chars");

  const tokenHash = crypto.createHash("sha256").update(String(token)).digest("hex");

  const user = await UserModel.findOne({
    resetPasswordTokenHash: tokenHash,
    resetPasswordExpiresAt: { $gt: new Date() },
  });

  if (!user) throw new ApiError(400, "Invalid or expired token");

  user.passwordHash = await bcrypt.hash(String(newPassword), 10);
  user.resetPasswordTokenHash = undefined;
  user.resetPasswordExpiresAt = undefined;
  await user.save();

  // можно сразу логинить после reset
  const jwt = signToken({ sub: String(user._id), role: user.role });
  res.cookie("token", jwt, authCookieOptions(true));

  res.json(ok({ user: toPublic(user) }));
});
