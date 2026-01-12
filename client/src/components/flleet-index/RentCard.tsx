import React from "react";
import { Link } from "react-router-dom";
import { Users, Gauge, Settings2, Fuel, ArrowRight } from "lucide-react";

type Props = {
  make: string;
  model: string;
  pricePerDay: number;
  currency?: "EUR" | "USD" | "GBP";
  seats?: number;
  hp?: number;
  transmission?: string;
  fuel?: string;
  to?: string;
};

const currencySymbol: Record<string, string> = { EUR: "€", USD: "$", GBP: "£", };

function formatPrice(value: number) { return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);}

export default function RentHeroCard({ make, model, pricePerDay, currency = "EUR", seats = 0, hp = 0, transmission = "", fuel = "", to = "/contact", }: Props) {
  
  const symbol = currencySymbol[currency] ?? "€";

  return (
    <section className="group relative w-full border border-white/10 bg-dark-200 p-6 text-white shadow-[0_30px_80px_rgba(0,0,0,.55)]">
      <span
        className="
          pointer-events-none absolute left-0 top-0 z-20 h-[10px] w-full bg-primary
          origin-left scale-x-0 opacity-0

          [transition-property:transform,opacity]
          [transition-duration:700ms,200ms]
          [transition-timing-function:ease-out,ease-out]
          [transition-delay:0ms,500ms]

          group-hover:scale-x-100 group-hover:opacity-100
          group-hover:[transition-delay:0ms,0ms]
        "
      />

      <Link to={to}>
        <div className="flex items-start justify-between gap-6 max-sm:flex-col max-sm:items-start">
          <div className="flex flex-col gap-2">
            <div className="text-base text-white/70">{make}</div>
            <h1 className="mt-1 text-4xl tracking-tight max-sm:text-3xl">
              {model}
            </h1>
          </div>

          <div className="flex items-baseline gap-2 max-sm:self-start">
            <div className="text-[49px] text-white/80 tracking-tight max-sm:text-3xl">
              {symbol}{formatPrice(pricePerDay)}
            </div>
            <div className="text-base text-white/60">/ Day</div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-6 max-sm:flex-col max-sm:items-start">
          <div className="flex flex-wrap items-center gap-2">
            <Chip Icon={Users} label={`${seats} Seats`} />
            <Chip Icon={Gauge} label={`${hp} HP`} />
            <Chip Icon={Settings2} label={transmission} />
            <Chip Icon={Fuel} label={fuel} />
          </div>

          <span className="inline-flex items-center gap-2 text-base font-medium text-white hover:text-white/90">
            Rent {model}
            <span className="translate-y-[1px]">
              <ArrowRight size={16} className="text-primary" />
            </span>
          </span>
        </div>
      </Link>
    </section>
  );
}

function Chip({ Icon, label, }: { Icon: React.ComponentType<{ className?: string }>; label: string; }) {

  if (!label) return null;

  return (
    <span className="inline-flex items-center gap-2 border border-white/10 bg-white/5 px-3 py-1 text-[13px] text-white">
      <Icon className="h-4 w-4 text-primary" />
      {label}
    </span>
  );
}
