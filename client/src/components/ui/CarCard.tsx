import { Link } from "react-router";
import type { CarCardDTO } from "../../types/car.types";
import { Users, Gauge, Settings2, ArrowRight } from "lucide-react";

function formatPrice(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

function Chip({ icon, value }: { icon: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/85">
      <span>{icon}</span>
      <span className="text-[13px]">{value}</span>
    </div>
  );
}

export default function CarCard({ car }: { car: CarCardDTO } ) {
  const title = `${car.model}${car.trim ? ` ${car.trim}` : ""}`;

  return (
    <article className="group relative overflow-hidden rounded-none border border-white/10 bg-dark-200">
      <div className="relative aspect-[16/10] overflow-hidden">

        <Link to={`/fleet/${car.slug}`}>
          <img
            src={car.thumbnailUrl}
            alt={`${car.make} ${title}`}
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-0"
            loading="lazy"
          />
          <img
            src={`${car.gallery?.[0].url}`}
            alt={`${car.make} ${title}`}
            className="h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            loading="lazy"
          />

          <span className="pointer-events-none absolute inset-0 flex items-start justify-center p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className="px-3 py-1 flex flex-row gap-1 text-[13px] text-white">
              View Details <ArrowRight size={12} className="relative top-[4px] text-primary" />
            </span>
          </span>

        </Link>
      </div>

      <Link to={`/fleet/${car.slug}`}>
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[16px] text-white/60">{car.make}</div>
              <div className="mt-1 text-[20px] text-white leading-tight">{title}</div>

              <div className="mt-3 flex items-end gap-2">
                <div className="text-[31px] text-white">
                  {formatPrice(car.pricePerDay, car.currency)}
                </div>
                <div className="pb-[3px] text-[13px] text-white/60">/ Day</div>
              </div>
            </div>

            {!!car.badge && (
              <span className="mt-1 inline-flex items-center rounded-sm border border-white/15 bg-white/5 px-2 py-1 text-[10px] text-white/75">
                {car.badge}
              </span>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {car.chips?.seats != null && (
              <Chip icon={<Users className="size-[20px] text-primary" />} value={`${car.chips.seats}`} />
            )}
            {car.chips?.horsepower != null && (
              <Chip icon={<Gauge className="size-[20px] text-primary" />} value={`${car.chips.horsepower}`} />
            )}
            {car.chips?.transmission && (
              <Chip icon={<Settings2 className="size-[20px] text-primary" />} value={car.chips.transmission} />
            )}

          </div>
        </div>
      </Link>
    </article>
  );
}
