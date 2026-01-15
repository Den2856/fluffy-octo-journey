import { ArrowRight } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AssetImage } from "../ui/AssetImage";

type Props = {
  watchRef: React.RefObject<Element | null>;
  stopRef: React.RefObject<Element | null>
  to: string;
  make: string;
  model: string;
  pricePerDay: number;
  currency?: "EUR" | "USD" | "GBP" | string;
  thumbnailUrl: string;
  watchRootMargin?: string;
  stopRootMargin?: string;
  className?: string;
};

const currencySymbol: Record<string, string> = { EUR: "€", USD: "$", GBP: "£" };

const toPublicSrc = (p: string) => (p?.startsWith("/") ? p : `/${p}`);

export default function FloatingRentBar({ watchRef, stopRef, to, make, model, pricePerDay, currency = "EUR", thumbnailUrl, className, watchRootMargin = "0px 0px -20% 0px", stopRootMargin = "-80px 0px 0px 0px", }: Props) {

  const [pastWatch, setPastWatch] = useState(false)
  const [stopLocked, setStopLocked] = useState(false);

  useEffect(() => {
    const el = watchRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        const left = !entry.isIntersecting;
        setPastWatch(!entry.isIntersecting);
        
        if (!left) setStopLocked(false);
      },
      { root: null, threshold: 0.15, rootMargin: watchRootMargin }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [watchRef, watchRootMargin]);

  useEffect(() => {
    const el = stopRef?.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setStopLocked(true);
      },
      { threshold: 0.25, rootMargin: stopRootMargin }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [stopRef, stopRootMargin]);

  const show = pastWatch && !stopLocked;

  const symbol = currencySymbol[currency] ?? "€";
  const price = useMemo(() => new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format( pricePerDay), [pricePerDay]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 max-sm:left-4 max-sm:right-4 max-sm:bottom-4 transition-all duration-300 ease-out ${ show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"} ${className} `}
    >
      <span className="pointer-events-none absolute left-0 top-0 z-20 h-[5px] w-full bg-primary origin-left"/>

      <Link to={to} className="flex items-center gap-4 border border-white/10 bg-dark-100 p-4">
        <AssetImage
          src={toPublicSrc(thumbnailUrl)}
          alt={`${make} ${model}`}
          className="h-12 w-12 object-cover"
          draggable={false}
        />

        <div className="min-w-0">
          <div className="flex items-center gap-2 text-base font-medium text-white">
            <span className="truncate">Rent {model}</span>
            <span className="text-primary"><ArrowRight size={16}/></span>
          </div>
        </div>

        <div className="ml-auto flex items-baseline justify-end gap-2 w-[220px] text-white/80">
          <div className="text-[31px] font-semibold tracking-tight">
            {symbol}{price}
          </div>
          <div className="text-base text-white/55">/Day</div>
        </div>
      </Link>
    </div>
  );
}
