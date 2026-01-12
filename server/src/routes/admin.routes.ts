import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/role";
import { listUsers, setUserRole } from "../controllers/admin.controller";

const router = Router();

router.get("/users", requireAuth, requireRole("admin"), listUsers);
router.patch("/users/:id/role", requireAuth, requireRole("admin"), setUserRole);

export default router;