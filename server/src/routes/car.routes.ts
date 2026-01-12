import { Router, type Request } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
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

// public
router.get("/", getCars);
router.get("/featured", getFeaturedCars);
router.get("/options", getCarFilterOptions);
router.get("/by-id/:id", requireAdmin, adminGetCarById);
router.get("/:slug/recommendations", getCarRecommendations);
router.get("/:slug", getCarBySlug);


// ---------------- ADMIN ----------------

const UPLOAD_ROOT = path.join(process.cwd(), "public", "cars");

const safeBase = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const storage = multer.diskStorage({
  destination: (req: Request, _file, cb) => {
    const id = (req as any).params?.id;

    CarModel.findById(id)
      .select("slug")
      .lean()
      .then((car) => {
        if (!car?.slug) return cb(new Error("Car not found"), "");

        const dir = path.join(UPLOAD_ROOT, car.slug);
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
      })
      .catch((e) => cb(e, ""));
  },

  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase() || ".png";
    const base = safeBase(path.basename(file.originalname || "image", ext)) || "image";
    cb(null, `${base}${ext}`);
  },
});

const upload = multer({ storage });

// CRUD + flags
router.post("/", requireAuth, requireAdmin, adminCreateCar);
router.patch("/:id", requireAuth, requireAdmin, adminUpdateCar);

router.patch("/:id/active", requireAuth, requireAdmin, adminSetCarActive);
router.patch("/:id/featured", requireAuth, requireAdmin, adminSetCarFeatured);

router.post("/:id/upload", requireAuth, requireAdmin, upload.array("files", 12), adminAttachUploadedImages);

router.get("/count", requireAuth, async (req, res) => {
  const activeCount = await CarModel.countDocuments({ isActive: true });
  res.json({ success: true, data: { activeCount } });
});


export default router;
