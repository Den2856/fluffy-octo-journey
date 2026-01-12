import type { Request, Response, NextFunction } from "express";
import { CarModel } from "../models/car.model";
import { getRecommendationsBySlug } from "../service/recommendation.service";
import { ApiError } from "../utils/api";

type UploadedFile = {
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  path?: string;
};

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// GET /api/cars?featured=true&active=true&q=lambo&type=SUV&seats=4&page=1&limit=12&sort=pricePerDay:asc
export const getCars = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { featured, active, q, type, seats, page = "1", limit = "12", sort = "createdAt:desc" } =
      req.query as Record<string, string>;

    const p = Math.max(parseInt(page, 10) || 1, 1);
    const lim = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 48);

    const filter: any = {};

    // active
    if (active === "all") {
      // admin wants all
    } else if (active === "true") filter.isActive = true;
    else if (active === "false") filter.isActive = false;
    else filter.isActive = true;

    // featured
    if (featured === "true") filter.isFeatured = true;

    if (type?.trim()) {
      const t = type.trim();
      filter.type = new RegExp(`^${escapeRegExp(t)}$`, "i");
    }

    if (seats) {
      const s = parseInt(seats, 10);
      if (!Number.isNaN(s)) filter["chips.seats"] = s;
    }

    if (q?.trim()) {
      const regex = new RegExp(escapeRegExp(q.trim()), "i");
      filter.$or = [{ make: regex }, { model: regex }, { trim: regex }, { badge: regex }, { type: regex }];
    }

    const [field, dirRaw] = String(sort || "createdAt:desc").split(":");
    const dir = dirRaw === "asc" ? 1 : -1;
    const sortObj: any = { [field]: dir };

    const [items, total] = await Promise.all([
      CarModel.find(filter)
        .select("make model trim slug badge isFeatured isActive pricePerDay currency thumbnailUrl gallery chips type")
        .sort(sortObj)
        .skip((p - 1) * lim)
        .limit(lim)
        .lean(),
      CarModel.countDocuments(filter),
    ]);

    const pages = Math.max(1, Math.ceil(total / lim));

    res.json({
      success: true,
      data: {
        items,
        total,
        page: p,
        pages,
      },

      items,
      total,
      page: p,
      pages,
      limit: lim,
    });

  } catch (err) {
    next(err);
  }
};

// GET /api/cars/featured?limit=6
export const getFeaturedCars = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const limit = Math.min(Math.max(parseInt((req.query.limit as string) || "6", 10), 1), 24);

    const items = await CarModel.find({ isActive: true, isFeatured: true })
      .select("make model trim slug badge isFeatured pricePerDay currency thumbnailUrl gallery chips type")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json({ items });
  } catch (err) {
    next(err);
  }
};

// GET /api/cars/:slug
export const getCarBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { slug } = req.params;

    const car = await CarModel.findOne({ slug, isActive: true }).lean();
    if (!car) {
      res.status(404).json({ message: "Car not found" });
      return;
    }

    res.json(car);
  } catch (err) {
    next(err);
  }
};

export const getCarFilterOptions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const match: any = { isActive: true };

    const [typesRaw, seatsRaw] = await Promise.all([
      CarModel.distinct("type", match),
      CarModel.distinct("chips.seats", match),
    ]);

    const types = (typesRaw || [])
      .filter((x) => typeof x === "string" && x.trim().length)
      .map((x) => x.trim())
      .sort((a, b) => a.localeCompare(b));

    const seats = (seatsRaw || [])
      .map((x) => (typeof x === "number" ? x : Number(x)))
      .filter((x) => Number.isFinite(x))
      .sort((a, b) => a - b);

    res.json({ types, seats });
  } catch (err) {
    next(err);
  }
};

export const getCarRecommendations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { slug } = req.params;
    const limit = Number(req.query.limit ?? 3);

    const { base, items } = await getRecommendationsBySlug(slug, limit);
    if (!base) {
      res.status(404).json({ message: "Car not found" });
      return;
    }

    const normalized = items.map((c) => ({
      _id: c._id,
      make: c.make,
      model: c.model,
      slug: c.slug,
      pricePerDay: c.pricePerDay,
      currency: c.currency,
      thumbnailUrl: c.thumbnailUrl,
      gallery: c.gallery?.slice(0, 1) ?? [],
      chips: c.chips ?? {},
      type: c.type ?? "",
    }));

    res.json({ items: normalized });
  } catch (err) {
    next(err);
  }
};

// ---------------- ADMIN ----------------

// GET /api/cars/by-id/:id  (admin)
// Нельзя делать GET /api/cars/:id, потому что этот путь уже занят публичным роутом GET /api/cars/:slug.
export const adminGetCarById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const car = await CarModel.findById(id).lean();
    if (!car) return next(new ApiError(404, "Car not found"));
    res.json(car);
    return;
  } catch (err: any) {
    if (err?.name === "CastError") return next(new ApiError(400, "Invalid car id"));
    next(err);
  }
};

const toNum = (v: any): number | undefined => {
  if (v === null || v === undefined || v === "") return undefined;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : undefined;
};

const toBool = (v: any): boolean | undefined => {
  if (v === null || v === undefined || v === "") return undefined;
  if (typeof v === "boolean") return v;
  if (v === "true" || v === "1" || v === 1) return true;
  if (v === "false" || v === "0" || v === 0) return false;
  return Boolean(v);
};

const normalizeAdminCarPayload = (raw: any) => {
  const src: any = raw ?? {};
  const chips: any = { ...(src.chips ?? {}) };

  // backward-compat: allow legacy flat fields and map them into chips.*
  if (src.seats !== undefined && chips.seats === undefined) chips.seats = toNum(src.seats);
  if (src.horsepower !== undefined && chips.horsepower === undefined) chips.horsepower = toNum(src.horsepower);
  if (src.transmission !== undefined && chips.transmission === undefined && src.transmission !== "")
    chips.transmission = String(src.transmission).trim();
  if (src.fuel !== undefined && chips.fuel === undefined && src.fuel !== "") chips.fuel = String(src.fuel).trim();

  const payload: any = {};

  // Only allow known fields (prevents StrictModeError when schema has strict:"throw")
  const allowed = [
    "make",
    "model",
    "trim",
    "slug",
    "badge",
    "type",
    "pricePerDay",
    "currency",
    "isActive",
    "isFeatured",
    "thumbnailUrl",
    "gallery",
    "specs",
    "overviewBlocks",
  ];

  for (const k of allowed) {
    if (src[k] !== undefined) payload[k] = src[k];
  }

  // Normalize primitives
  if (payload.make !== undefined) payload.make = String(payload.make).trim();
  if (payload.model !== undefined) payload.model = String(payload.model).trim();
  if (payload.trim !== undefined) payload.trim = String(payload.trim).trim();
  if (payload.slug !== undefined) payload.slug = String(payload.slug).trim();
  if (payload.badge !== undefined) payload.badge = String(payload.badge).trim();
  if (payload.type !== undefined) payload.type = String(payload.type).trim();
  if (payload.currency !== undefined) payload.currency = String(payload.currency).trim();

  if (payload.pricePerDay !== undefined) payload.pricePerDay = toNum(payload.pricePerDay);
  if (payload.isActive !== undefined) payload.isActive = toBool(payload.isActive);
  if (payload.isFeatured !== undefined) payload.isFeatured = toBool(payload.isFeatured);

  // Clean gallery items shape if provided
  if (Array.isArray(payload.gallery)) {
    payload.gallery = payload.gallery
      .map((g: any) => {
        if (!g) return null;
        const url = g.url ? String(g.url) : "";
        if (!url) return null;
        const item: any = { url };
        if (g.alt) item.alt = String(g.alt);
        return item;
      })
      .filter(Boolean);
  }

  // Attach chips if any (or if seats was provided)
  const hasAnyChip =
    chips &&
    Object.values(chips).some((v) => v !== undefined && v !== null && v !== "");

  if (hasAnyChip) payload.chips = chips;

  return payload;
};

const mapCarWriteError = (err: any): ApiError | null => {
  // Mongo duplicate key (e.g., slug unique)
  if (err?.code === 11000) {
    if (err?.keyPattern?.slug || err?.keyValue?.slug) return new ApiError(409, "Car with this slug already exists");
    return new ApiError(409, "Duplicate key");
  }

  // Mongoose validation
  if (err?.name === "ValidationError") return new ApiError(400, err.message);

  // Mongoose strict mode error
  if (err?.name === "StrictModeError") return new ApiError(400, err.message);

  // Cast errors
  if (err?.name === "CastError") return new ApiError(400, err.message);

  return null;
};

export const adminCreateCar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const payload = normalizeAdminCarPayload(req.body);
    const created = await CarModel.create(payload);
    res.status(201).json(created);
    return;
  } catch (err) {
    const apiErr = mapCarWriteError(err);
    if (apiErr) return next(apiErr);
    next(err);
  }
};


export const adminUpdateCar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const payload = normalizeAdminCarPayload(req.body);

    const updated = await CarModel.findByIdAndUpdate(id, payload, { new: true, runValidators: true }).lean();
    if (!updated) return next(new ApiError(404, "Car not found"));

    res.json(updated);
    return;
  } catch (err) {
    const apiErr = mapCarWriteError(err);
    if (apiErr) return next(apiErr);
    next(err);
  }
};


export const adminSetCarActive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { isActive } = req.body as { isActive: boolean };

    const updated = await CarModel.findByIdAndUpdate(
      id,
      { isActive: Boolean(isActive) },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) return next(new ApiError(404, "Car not found"));

    res.json(updated);
    return;
  } catch (err) {
    next(err);
  }
};

export const adminSetCarFeatured = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { isFeatured } = req.body as { isFeatured: boolean };

    const updated = await CarModel.findByIdAndUpdate(
      id,
      { isFeatured: Boolean(isFeatured) },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) return next(new ApiError(404, "Car not found"));

    res.json(updated);
    return;
  } catch (err) {
    next(err);
  }
};

export const adminAttachUploadedImages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const car = await CarModel.findById(id);
    if (!car) return next(new ApiError(404, "Car not found"));

    const slug = car.slug;
    const files = (((req as any).files ?? []) as UploadedFile[]);

    const altsRaw = (req.body as any)?.alts;
    let alts: string[] = [];
    if (typeof altsRaw === "string") {
      try {
        alts = JSON.parse(altsRaw);
      } catch {
        alts = [];
      }
    }

    const newItems = files.map((f, idx) => ({
      url: `/cars/${slug}/${f.filename}`,
      alt: alts[idx] || "",
    }));

    let galleryItems = newItems;

    if (!car.thumbnailUrl && newItems.length) {
      car.thumbnailUrl = newItems[0].url;
      galleryItems = newItems.slice(1);
    }

    
    const existing = new Set<string>([
      car.thumbnailUrl || "",
      ...(car.gallery || []).map((g: any) => g?.url).filter(Boolean),
    ]);

    const toPush = galleryItems.filter((x) => x?.url && !existing.has(x.url));

    car.gallery.push(...toPush);

    await car.save();
    res.json(car.toObject());
    return;
  } catch (err) {
    next(err);
  }
};