import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { register, login, logout, me, forgotPassword, resetPassword } from "../controllers/auth.controller";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", requireAuth, me);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;