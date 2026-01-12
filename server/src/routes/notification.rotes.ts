import { Router, type Response } from "express";
import { NotificationModel } from "../models/notification.model";
import { addClient } from "../utils/notfyHub";
import { requireAuth, type AuthedRequest } from "../middleware/auth";

const router = Router();

router.get("/", requireAuth, async (req: AuthedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ success: false, message: "Auth required" });
      return;
    }

    const limit = Math.min(Number(req.query.limit ?? 25), 100);

    const items = await NotificationModel.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json({ success: true, data: { items } });
  } catch (e) {
    console.error("GET /notifications error:", e);
    res.status(500).json({ success: false, message: "Failed to load notifications" });
  }
});

router.get("/unread-count", requireAuth, async (req: AuthedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ success: false, message: "Auth required" });
      return;
    }

    const unread = await NotificationModel.countDocuments({ user: req.user.id, readAt: null });
    res.json({ success: true, data: { unread } });
  } catch (e) {
    console.error("GET /notifications/unread-count error:", e);
    res.status(500).json({ success: false, message: "Failed to load unread count" });
  }
});

router.patch("/:id/read", requireAuth, async (req: AuthedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ success: false, message: "Auth required" });
      return;
    }

    await NotificationModel.updateOne(
      { _id: req.params.id, user: req.user.id, readAt: null },
      { $set: { readAt: new Date() } }
    );

    res.json({ success: true });
  } catch (e) {
    console.error("PATCH /notifications/:id/read error:", e);
    res.status(500).json({ success: false, message: "Failed to mark as read" });
  }
});

router.patch("/read-all", requireAuth, async (req: AuthedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ success: false, message: "Auth required" });
      return;
    }

    await NotificationModel.updateMany(
      { user: req.user.id, readAt: null },
      { $set: { readAt: new Date() } }
    );

    res.json({ success: true });
  } catch (e) {
    console.error("PATCH /notifications/read-all error:", e);
    res.status(500).json({ success: false, message: "Failed to mark all as read" });
  }
});

// SSE stream
router.get("/stream", requireAuth, async (req: AuthedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ success: false, message: "Auth required" });
      return;
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    // initial ping
    res.write(`data: ${JSON.stringify({ type: "ping" })}\n\n`);

    addClient(String(req.user.id), res);

    const keepAlive = setInterval(() => {
      try {
        res.write(`data: ${JSON.stringify({ type: "ping" })}\n\n`);
      } catch {}
    }, 25000);

    res.on("close", () => clearInterval(keepAlive));
  } catch (e) {
    console.error("GET /notifications/stream error:", e);
    try {
      res.end();
    } catch {}
  }
});

export default router;
