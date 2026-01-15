import { useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { AssetImage } from "../ui/AssetImage";

type Slide = { url: string; alt?: string };
const toPublicSrc = (p: string) => (p.startsWith("/") ? p : `/${p}`);

export default function AutoCarousel({ slides, intervalMs = 3800,}: { slides: Slide[]; intervalMs?: number; }) {

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const next = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi || slides.length <= 1) return;

    const id = window.setInterval(() => {
      if (emblaApi.internalEngine().dragHandler.pointerDown()) return;
      next();
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [emblaApi, next, intervalMs, slides.length]);

  if (!slides.length) return null;

  return (
    <div className="mt-14 h-[260px]">
      <div className="relative overflow-hidden border border-white/10 bg-black/40">
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex will-change-transform h-[260px]">
            {slides.map((s, i) => (
              <div key={s.url + i} className="flex-[0_0_100%] min-w-0">
                <div className="relative w-full">
                  <AssetImage
                    src={toPublicSrc(s.url)}
                    alt={s.alt ?? `slide-${i}`}
                    className="h-[260px] w-full object-fit"
                    draggable={false}
                    loading="lazy"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/35" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
