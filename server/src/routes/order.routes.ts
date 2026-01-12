import { Router } from "express";
import { listOrders, patchOrder } from "../controllers/order.contorller";
import { requireAuth } from "../middleware/auth";
import { requireAdmin } from "../middleware/requireAdmin";
import { getOrdersCalendar, patchOrderSchedule, getMyCalendarEvents } from "../controllers/order.calendar.controller";

const router = Router();

router.get("/", requireAuth, listOrders);

router.get("/calendar", requireAuth, requireAdmin, getOrdersCalendar);
router.patch("/:id/schedule", requireAuth, requireAdmin, patchOrderSchedule);

router.get("/my", requireAuth, getMyCalendarEvents);

router.patch("/:id", requireAuth, patchOrder);

export default router;
