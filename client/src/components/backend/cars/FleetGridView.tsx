import { type ElementType, type ReactNode } from "react";
import { Users, Settings2, Gauge, Fuel, type LucideProps } from "lucide-react";
import { b, statusLabelByKey, statusPillGridByKey, type FleetViewProps } from "./fleetView.shared";

type SpecChipProps = {
  Icon: ElementType<LucideProps>;
  value: ReactNode;
};

function SpecChip({ Icon, value }: SpecChipProps) {
  return (
    <div className="inline-flex items-center gap-2 border border-white/10 bg-dark-100 px-3 py-1 text-[13px] text-white">
      <Icon size={16} className="text-primary" />
      <span>{value}</span>
    </div>
  );
}

export default function FleetGridView({items, ghostBtn, openEdit, handleDelete, toggleActive, toggleFeatured, isBusy, }: FleetViewProps) {
  return (
    <div className="grid grid-cols-1 gap-3 p-3 md:grid-cols-2 xl:grid-cols-3">
      {items.map((car: any) => {
        const id = String(car._id);

        const units = Number(car.units ?? car.unitCount ?? car.stock ?? 0) || 1;
        const transmission = (car.transmission || car.gearbox || "Automatic").toString();
        const seats = Number(car?.chips?.seats ?? car?.seats ?? 0) || 0;
        const horsepower = Number(car?.chips?.horsepower ?? 0) || 0;
        const fuel = (car?.chips?.fuel ?? "—").toString();

        const thumbUrl = car.thumbnailUrl as string;
        const thumbKey = b(thumbUrl);
        const thumbNode =
          {
            true: (
              <img
                src={thumbUrl}
                alt={car.slug || "car"}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ),
            false: (
              <div className="flex h-full w-full items-center justify-center text-[11px] text-white/40">
                no image
              </div>
            ),
          }[thumbKey];

        const statusKey = b(car.isActive);
        const statusClass = statusPillGridByKey[statusKey];
        const statusLabel = statusLabelByKey[statusKey];

        const typeKey = b(car.type);
        const typeNode =
          {
            true: (
              <span className="rounded-full border border-white/10 bg-white/0 px-2 py-[2px] text-[14px] text-white/70">
                {car.type}
              </span>
            ),
            false: null,
          }[typeKey];

        const priceKey = b(typeof car.pricePerDay === "number");
        const priceText =
          {
            true: `€ ${car.pricePerDay}/day`,
            false: "",
          }[priceKey];

        const specChips = [
          { key: "transmission", Icon: Settings2, value: transmission },
          { key: "seats", Icon: Users, value: `${seats}` },
          { key: "horsepower", Icon: Gauge, value: `${horsepower}` },
          { key: "fuel", Icon: Fuel, value: fuel },
        ];

        const busyActive = isBusy(id, "active");
        const busyFeatured = isBusy(id, "featured");

        const busyClassActive = { true: "opacity-60 pointer-events-none", false: "" }[b(busyActive)];
        const busyClassFeatured = { true: "opacity-60 pointer-events-none", false: "" }[b(busyFeatured)];

        const activeBtnText = { true: "Deactivate", false: "Activate" }[statusKey];
        const activeBtnClass =
          {
            true:
              "rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs text-red-200 hover:bg-red-500/15",
            false:
              "rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-3 py-2 text-xs text-emerald-200 hover:bg-emerald-400/15",
          }[statusKey];

        const featuredKey = b(car.isFeatured);
        const featuredBtnText = { true: "Unfeature", false: "Feature" }[featuredKey];
        const featuredBtnClass =
          {
            true:
              "rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs text-red-200 hover:bg-red-500/15",
            false:
              "rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-200 px-3 py-2 text-xs hover:bg-emerald-400/15",
          }[featuredKey];

        return (
          <div key={car._id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="flex gap-3">
              <div className="min-w-0 flex-1 gap-2 flex flex-col">
                <div className="truncate text-md font-semibold flex flex-row text-white">
                  <div className="fiex-1 flex flex-col gap-2">
                    <span>
                      {(car.make || "").trim()} {(car.model || "").trim()}
                    </span>
                    <span>{typeNode}</span>
                  </div>
                  <a className="ml-auto text-[14px] text-white">{priceText}</a>
                </div>

                <div className="h-fit w-full overflow-hidden rounded-xl border border-white/10 bg-black/20">
                  {thumbNode}
                </div>

                <div className="mt-2 flex flex-wrap gap-1">
                  <span className={statusClass}>{statusLabel}</span>
                  <span className="rounded-[8px] rounded-l-none border border-white/10 bg-black/20 px-2.5 py-1 relative -left-1 text-[14px] text-white/75">
                    {units} Unit
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap gap-2">
                  {specChips.map((c) => (
                    <SpecChip key={c.key} Icon={c.Icon} value={c.value} />
                  ))}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleActive(car)}
                    className={activeBtnClass + " " + busyClassActive}
                    disabled={busyActive}
                  >
                    {activeBtnText}
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleFeatured(car)}
                    className={featuredBtnClass + " " + busyClassFeatured}
                    disabled={busyFeatured}
                  >
                    <span>
                      {featuredBtnText}
                    </span>
                  </button>

                  <button type="button" onClick={() => openEdit(car)} className={ghostBtn}>
                    Edit
                  </button>
                  <button type="button" onClick={() => handleDelete(car)} className={ghostBtn}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
