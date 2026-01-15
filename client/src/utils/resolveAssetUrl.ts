const API_ORIGIN = normalizeOrigin((import.meta.env.VITE_API_URL as string) || "");
const ASSETS_ORIGIN = normalizeOrigin((import.meta.env.VITE_ASSETS_ORIGIN as string) || "");

const ASSET_PREFIXES = ["cars/", "uploads/", "images/", "static/", "thumbs/"];

export function resolveAssetUrl(input?: string | null): string {
  if (!input) return "";

  const url = String(input).trim();
  if (!url) return "";

  if (/^(https?:)?\/\//i.test(url)) return url;
  if (/^(data:|blob:)/i.test(url)) return url;

  const cleaned = url.replace(/\\/g, "/");

  if (ASSETS_ORIGIN && looksLikeBucketKey(cleaned)) {
    return joinUrl(ASSETS_ORIGIN, stripLeadingSlash(cleaned));
  }

  if (API_ORIGIN) {
    return joinUrl(API_ORIGIN, cleaned.startsWith("/") ? cleaned.slice(1) : cleaned);
  }

  return cleaned;
}

function looksLikeBucketKey(p: string): boolean {
  const s = stripLeadingSlash(p).toLowerCase();
  return ASSET_PREFIXES.some((pref) => s.startsWith(pref));
}

function stripLeadingSlash(p: string) {
  return p.replace(/^\/+/, "");
}

function normalizeOrigin(origin: string) {
  const o = origin.trim();
  if (!o) return "";
  return o.replace(/\/+$/, "");
}

function joinUrl(origin: string, path: string) {
  const o = normalizeOrigin(origin);
  const p = stripLeadingSlash(path);
  if (!o) return `/${p}`;
  return `${o}/${p}`;
}
