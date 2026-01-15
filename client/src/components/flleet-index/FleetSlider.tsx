import { useEffect, useMemo, useCallback, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FILLER_IMAGES } from "../../data/fillers";
import { buildSlides, buildSlidesReplacingFrom, type Slide } from "../../lib/buildSlides";
import { AssetImage } from "../ui/AssetImage";

type GalleryItem = { url: string; alt?: string };

type Props = {
  title?: string;
  thumbnailUrl?: string;
  gallery?: GalleryItem[];
  minSlides?: number;
  slides?: Slide[]; // optional extra
};

const normalizeUrl = (p: string) => {
  if (!p) return p;
  if (/^(https?:)?\/\//.test(p) || p.startsWith("data:") || p.startsWith("blob:")) return p;
  return p.startsWith("/") ? p : `/${p}`;
};

export default function FleetSlider({
  title = "Car",
  thumbnailUrl,
  gallery = [],
  minSlides = 10,
  slides: slidesProp,
}: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selected, setSelected] = useState(0);
  const [brokenFrom, setBrokenFrom] = useState<number | null>(null);

  // thumbnail first, then ALL gallery
  const dbSlides = useMemo<Slide[]>(() => {
    const out: Slide[] = [];
    if (thumbnailUrl) out.push({ url: thumbnailUrl, alt: title });
    for (const g of gallery) if (g?.url) out.push({ url: g.url, alt: g.alt ?? title });
    return out;
  }, [thumbnailUrl, gallery, title]);

  // ALWAYS use DB images; slidesProp only as extra appended
  const realSlides = useMemo<Slide[]>(() => {
    const extra = slidesProp?.length ? slidesProp : [];
    return [...dbSlides, ...extra];
  }, [dbSlides, slidesProp]);

  // IMPORTANT: stable key by CONTENT (not by array reference)
  const dataKey =
    String(minSlides) +
    "|" +
    realSlides
      .map((s) => normalizeUrl(s.url || ""))
      .filter(Boolean)
      .join("|");

  useEffect(() => {
    setBrokenFrom(null);
  }, [dataKey]);

  // count of "real" slides for onError guard
  const realCount = useMemo(() => {
    const base = buildSlides(realSlides, [], minSlides).length;
    if (brokenFrom === null) return base;
    return Math.max(0, Math.min(Math.floor(brokenFrom), base));
  }, [realSlides, minSlides, brokenFrom]);

  const computedSlides = useMemo(() => {
    return buildSlidesReplacingFrom(realSlides, FILLER_IMAGES, minSlides, brokenFrom);
  }, [realSlides, minSlides, brokenFrom]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  const prev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const next = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const goTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);

  if (!computedSlides.length) return null;

  return (
    <section className="w-full border border-white/10">
      <div className="relative overflow-hidden bg-black/70">
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex">
            {computedSlides.map((s, i) => (
              <div key={`${s.url}-${i}`} className="min-w-0 flex-[0_0_100%]">
                <div className="relative size-full">
                  <AssetImage
                    src={s.url} // НЕ трогаем второй раз, buildSlides уже нормализует
                    alt={s.alt ?? title}
                    className="h-full w-full object-contain"
                    draggable={false}
                    loading={i === 0 ? "eager" : "lazy"}
                    onError={(e) => {
                      // если это уже филлер-зона — игнор
                      if (i >= realCount) return;

                      // мгновенно подставим филлер в этот <img>, чтобы браузер перестал долбить 404
                      const fb = FILLER_IMAGES[i % FILLER_IMAGES.length]?.url;
                      if (fb) e.currentTarget.src = normalizeUrl(fb);

                      // и навсегда заменим с этого индекса и дальше
                      setBrokenFrom((prev) => (prev === null ? i : Math.min(prev, i)));
                    }}
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/40" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={prev}
          aria-label="Prev"
          className="absolute left-4 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full text-white"
        >
          <ChevronLeft size={24} />
        </button>

        <button
          onClick={next}
          aria-label="Next"
          className="absolute right-4 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full text-white"
        >
          <ChevronRight size={24} />
        </button>

        <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-20">
          {computedSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go ${i + 1}`}
              className={`h-1 w-1 rounded-full transition ${
                i === selected ? "bg-white" : "bg-white/35 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
