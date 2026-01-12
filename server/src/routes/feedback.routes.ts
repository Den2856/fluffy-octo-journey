import { Router } from "express";
import { postFeedback } from "../controllers/feedback.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();
//@ts-ignore
router.post("/feedback", requireAuth, postFeedback);

export default router;
