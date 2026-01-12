export type Slide = { url: string; alt?: string };

const toPublicSrc = (p: string) => (p.startsWith("/") ? p : `/${p}`);

/**
 * Builds a slide list with:
 * - preserving order
 * - de-duplicating by URL
 * - filling with `fillers` until it reaches `min`
 * - capping the final length to `min` (i.e. "up to 10")
 */
export function buildSlides(
  real: Slide[],
  fillers: Slide[],
  min = 10
): { url: string; alt: string }[] {
  const target = Math.max(0, Math.floor(min));
  const out: { url: string; alt: string }[] = [];
  const used = new Set<string>();

  for (const s of real) {
    if (out.length >= target) break;
    if (!s?.url) continue;

    const url = toPublicSrc(s.url);
    if (used.has(url)) continue;

    used.add(url);
    out.push({ url, alt: s.alt ?? "Car image" });
  }

  let i = 0;
  while (out.length < target && fillers.length > 0) {
    const f = fillers[i % fillers.length];
    i++;

    const url = toPublicSrc(f.url);
    if (used.has(url)) continue;

    used.add(url);
    out.push({ url, alt: f.alt ?? "Placeholder image" });

    // safety
    if (i > 200) break;
  }

  return out;
}

/**
 * Same as buildSlides(), but if `replaceFrom` is provided,
 * it will keep real slides only up to that index (exclusive),
 * and then fill the rest with `fillers`.
 *
 * This is used for: "once a gallery image is missing, replace from it with thumbs".
 */
export function buildSlidesReplacingFrom(
  real: Slide[],
  fillers: Slide[],
  min = 10,
  replaceFrom?: number | null
): { url: string; alt: string }[] {
  const target = Math.max(0, Math.floor(min));

  // de-dupe + cap real first
  const realDedup = buildSlides(real, [], target);

  if (replaceFrom === null || replaceFrom === undefined) {
    return buildSlides(realDedup, fillers, target);
  }

  const cut = Math.max(0, Math.min(Math.floor(replaceFrom), realDedup.length));
  const prefix = realDedup.slice(0, cut);

  return buildSlides(prefix, fillers, target);
}
