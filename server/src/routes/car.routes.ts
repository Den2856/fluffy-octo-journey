import { Router } from "express";
import multer from "multer";
import { CarModel } from "../models/car.model";
import { requireAuth } from "../middleware/auth";
import { requireAdmin } from "../middleware/requireAdmin";
import {
  getCars,
  getCarBySlug,
  getFeaturedCars,
  getCarFilterOptions,
  getCarRecommendations,
  adminCreateCar,
  adminUpdateCar,
  adminSetCarActive,
  adminSetCarFeatured,
  adminAttachUploadedImages,
  adminGetCarById,
} from "../controllers/car.controller";

const router = Router();

router.get("/", getCars);
router.get("/featured", getFeaturedCars);
router.get("/options", getCarFilterOptions);
router.get("/by-id/:id", requireAdmin, adminGetCarById);
router.get("/:slug/recommendations", getCarRecommendations);
router.get("/:slug", getCarBySlug);

const upload = multer({ storage: multer.memoryStorage() });

router.post("/", requireAuth, requireAdmin, adminCreateCar);
router.patch("/:id", requireAuth, requireAdmin, adminUpdateCar);
router.patch("/:id/active", requireAuth, requireAdmin, adminSetCarActive);
router.patch("/:id/featured", requireAuth, requireAdmin, adminSetCarFeatured);
router.post("/:id/upload", requireAuth, requireAdmin, upload.fields([{ name: "files", maxCount: 12 }, { name: "files[]", maxCount: 12 },]), adminAttachUploadedImages );

router.get("/count", requireAuth, async (_req, res) => {
  const activeCount = await CarModel.countDocuments({ isActive: true });
  res.json({ success: true, data: { activeCount } });
});

export default router;
