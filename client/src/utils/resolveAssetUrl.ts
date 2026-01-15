function normalizeOrigin(o: string) {
  return (o || "").trim().replace(/\/+$/, "");
}

function deriveOriginFromApiUrl(apiUrl: string) {
  const u = normalizeOrigin(apiUrl);
  // режем /api/v1 или /api
  return u.replace(/\/api\/v\d+$/i, "").replace(/\/api$/i, "");
}

const API_URL = normalizeOrigin((import.meta.env.VITE_API_URL as string) || "");
const API_ORIGIN =
  normalizeOrigin((import.meta.env.VITE_API_ORIGIN as string) || "") ||
  deriveOriginFromApiUrl(API_URL);

// картинки у тебя в БД/данных лежат как cars/slug/1.png (ключ)
export function resolveAssetUrl(input?: string | null): string {
  if (!input) return "";
  const raw = String(input).trim();
  if (!raw) return "";

  // absolute or special
  if (/^(https?:)?\/\//i.test(raw)) return raw;
  if (/^(data:|blob:)/i.test(raw)) return raw;

  const cleaned = raw.replace(/\\/g, "/");

  // если это cars/... или /cars/... — ВСЕГДА идём на бек
  if (cleaned.startsWith("cars/")) return `${API_ORIGIN}/api/v1/${cleaned}`; // => /api/v1/cars/...
  if (cleaned.startsWith("/cars/")) return `${API_ORIGIN}/api/v1${cleaned}`; // => /api/v1/cars/...

  // если это /uploads/... или /public/... — тоже на бек
  if (cleaned.startsWith("/")) return `${API_ORIGIN}${cleaned}`;

  // прочее — как относительное
  return `${API_ORIGIN}/${cleaned}`;
}
