import { CarModel } from "../models/car.model";

type Candidate = any;

function clamp(min: number, v: number, max: number) {
  return Math.max(min, Math.min(v, max));
}

function scoreCandidate(base: any, c: Candidate) {
  let score = 0;

  if (base.type && c.type && base.type === c.type) score += 40;

  const basePrice = Number(base.pricePerDay ?? 0);
  const candPrice = Number(c.pricePerDay ?? 0);
  const priceDiff = Math.abs(candPrice - basePrice);
  score += clamp(0, 35 - priceDiff / 10, 35);


  const sA = Number(base.chips?.seats ?? 0);
  const sB = Number(c.chips?.seats ?? 0);
  if (sA && sB) score += clamp(0, 12 - Math.abs(sA - sB) * 4, 12);


  const hpA = Number(base.chips?.horsepower ?? 0);
  const hpB = Number(c.chips?.horsepower ?? 0);
  if (hpA && hpB) score += clamp(0, 10 - Math.abs(hpA - hpB) / 60, 10);

  if (base.chips?.transmission && c.chips?.transmission && base.chips.transmission === c.chips.transmission) score += 8;
  if (base.chips?.fuel && c.chips?.fuel && base.chips.fuel === c.chips.fuel) score += 6;
  if (base.specs?.drivetrain && c.specs?.drivetrain && base.specs.drivetrain === c.specs.drivetrain) score += 5;


  if (base.make && c.make && base.make === c.make) score -= 3;

  return score;
}

function pickWithDiversity(scored: { c: any; score: number }[], limit: number) {
  const out: any[] = [];
  const makeCount = new Map<string, number>();

  for (const item of scored) {
    if (out.length >= limit) break;

    const make = String(item.c.make ?? "");
    const used = makeCount.get(make) ?? 0;

    if (make && used >= 2) continue;

    out.push(item.c);
    if (make) makeCount.set(make, used + 1);
  }

  return out;
}

export async function getRecommendationsBySlug(slug: string, limit = 3) {
  const base = await CarModel.findOne({ slug, isActive: true }).lean();
  if (!base) return { base: null, items: [] };

  const safeLimit = clamp(1, limit, 12);

  let candidates = await CarModel.find({
    isActive: true,
    _id: { $ne: base._id },
    ...(base.type ? { type: base.type } : {}),
  })
    .limit(120)
    .lean();

  if (candidates.length < 20) {
    candidates = await CarModel.find({
      isActive: true,
      _id: { $ne: base._id },
    })
      .limit(200)
      .lean();
  }

  const scored = candidates
    .map((c) => ({ c, score: scoreCandidate(base, c) }))
    .sort((a, b) => b.score - a.score);

  let picked = pickWithDiversity(scored, safeLimit);

  if (picked.length < safeLimit) {
    const need = safeLimit - picked.length;
    const pickedIds = new Set(picked.map((x) => String(x._id)));

    const extra = await CarModel.find({
      isActive: true,
      isFeatured: true,
      _id: { $ne: base._id },
    })
      .limit(need * 2)
      .lean();

    for (const e of extra) {
      if (picked.length >= safeLimit) break;
      if (pickedIds.has(String(e._id))) continue;
      picked.push(e);
      pickedIds.add(String(e._id));
    }
  }

  return { base, items: picked.slice(0, safeLimit) };
}
