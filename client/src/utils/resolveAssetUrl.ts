const API_ORIGIN = (import.meta.env.VITE_API_URL as string) || '';

export function resolveAssetUrl(input?: string | null): string {
  if (!input) return '';
  const url = String(input).trim();
  if (!url) return '';
  if (/^(https?:)?\/\//i.test(url) || /^(data:|blob:)/i.test(url)) return url;
  const cleaned = url.replace(/\\/g, '/');
  return `${API_ORIGIN}${cleaned.startsWith('/') ? '' : '/'}${cleaned}`;
}
