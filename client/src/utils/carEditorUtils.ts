
import type { Car, CarChips, CarSpecs, CarUpsertPayload, OverviewBlock } from "../types/admin.car.types";

export const DEFAULT_PAYLOAD: CarUpsertPayload = {
  isActive: true,
  isFeatured: false,
  currency: "EUR",
  chips: {},
  specs: {},
  overviewBlocks: [],
};

export function normalizeCarToPayload(car: Car | null | undefined): CarUpsertPayload {
  if (!car) return { ...DEFAULT_PAYLOAD };

  const { _id, ...rest } = car as any;

  const chips: CarChips = { ...(rest.chips || {}) };
  const specs: CarSpecs = { ...(rest.specs || {}) };
  const overviewBlocks: OverviewBlock[] = Array.isArray(rest.overviewBlocks)
    ? rest.overviewBlocks.map((b: any) => ({ title: String(b?.title || ""), text: String(b?.text || "") }))
    : [];

  const seats =
    typeof rest.seats === "number" ? rest.seats : typeof chips.seats === "number" ? chips.seats : undefined;

  if (typeof seats === "number") {
    rest.seats = seats;
    chips.seats = seats;
  }

  rest.chips = chips;
  rest.specs = specs;
  rest.overviewBlocks = overviewBlocks;

  return { ...DEFAULT_PAYLOAD, ...rest };
}

export function cleanPayloadForSave(payload: CarUpsertPayload, acc0100Text: string): CarUpsertPayload {
  const blocks = Array.isArray(payload.overviewBlocks) ? payload.overviewBlocks : [];

  const cleanedBlocks = blocks
    .map((b) => ({ title: String(b?.title || "").trim(), text: String(b?.text || "").trim() }))
    .filter((b) => b.title || b.text);

  const next: CarUpsertPayload = {
    ...payload,
    overviewBlocks: cleanedBlocks,
    chips: { ...(payload.chips || {}) },
    specs: { ...(payload.specs || {}) },
  };

  // decimal field from text -> number (accept "." and ",")
  (next.specs as any).acceleration0to100Sec = coerceDecimalOrUndef(acc0100Text, "0–100 km/h (sec)");

  // seats sync
  if (typeof next.seats === "number") (next.chips as any).seats = next.seats;
  if (typeof (next.chips as any)?.seats === "number") next.seats = (next.chips as any).seats;

  return next;
}

export function coerceDecimalOrUndef(input: string, label = "Value"): number | undefined {
  const raw = String(input ?? "").trim();
  if (!raw) return undefined;

  const t = raw.replace(",", ".");
  const ok = /^-?\d*(\.\d*)?$/.test(t) && /[0-9]/.test(t);
  if (!ok) throw new Error(`${label} must be a number`);

  const n = Number(t);
  if (!Number.isFinite(n)) throw new Error(`${label} must be a number`);
  return n;
}

export function publicAssetUrl(path: string) {
  const p = String(path || "");
  if (!p) return p;
  if (/^https?:\/\//i.test(p) || p.startsWith("data:") || p.startsWith("blob:")) return p;

  const base = (import.meta as any)?.env?.BASE_URL ?? "/";
  const b = String(base).endsWith("/") ? String(base).slice(0, -1) : String(base);

  if (p.startsWith("/")) return `${b}${p}`;
  return `${b}/${p}`;
}

export function getCarImages(savedCar: Car | null) {
  const out: Array<{ url: string; alt?: string }> = [];
  const thumb = (savedCar as any)?.thumbnailUrl;
  if (thumb) out.push({ url: String(thumb), alt: "Thumbnail" });

  const g = (savedCar as any)?.gallery;
  if (Array.isArray(g)) {
    for (const item of g) {
      const url = item?.url;
      if (!url) continue;
      out.push({ url: String(url), alt: item?.alt ? String(item.alt) : "" });
    }
  }

  const seen = new Set<string>();
  const dedup = out.filter((x) => x.url && !seen.has(x.url) && (seen.add(x.url), true));
  return dedup.map((x) => ({ ...x, url: publicAssetUrl(x.url) }));
}
