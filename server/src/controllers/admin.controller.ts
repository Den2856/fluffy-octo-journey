import { asyncHandler } from "../utils/asyncHandler";
import { ApiError, ok } from "../utils/api";
import { UserModel, ROLES } from "../models/user.model";

export const listUsers = asyncHandler(async (_req, res) => {
  const users = await UserModel.find().select("name email role createdAt").sort({ createdAt: -1 });
  res.json(ok({ users }));
});

export const setUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body ?? {};

  if (!ROLES.includes(role)) throw new ApiError(400, "Invalid role", { allowed: ROLES });

  const user = await UserModel.findByIdAndUpdate(id, { role }, { new: true }).select("name email role");
  if (!user) throw new ApiError(404, "User not found");

  res.json(ok({ user }));
});
