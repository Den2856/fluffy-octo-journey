import { b, statusLabelByKey, statusPillListByKey, type FleetViewProps } from "./fleetView.shared";

export default function FleetListView({
  items,
  ghostBtn,
  openEdit,
  handleDelete,
  toggleActive,
  toggleFeatured,
  isBusy,
}: FleetViewProps) {
  return (
    <div className="p-3 space-y-3">
      {items.map((car: any) => {
        const id = String(car._id);

        const title =
          ((car.make || "").toString().trim() + " " + (car.model || "").toString().trim()).trim() || "—";
        const transmission = (car.transmission || car.gearbox || "Automatic").toString();
        const seats = Number(car?.chips?.seats ?? car?.seats ?? 0) || 0;
        const units = Number(car.units ?? car.unitCount ?? car.stock ?? 0) || 1;

        const statusKey = b(car.isActive);
        const statusLabel = statusLabelByKey[statusKey];
        const statusPill = statusPillListByKey[statusKey];

        const seatsKey = b(seats);
        const seatsText =
          {
            true: `${seats} seats`,
            false: "—",
          }[seatsKey];

        const priceKey = b(typeof car.pricePerDay === "number");
        const priceMain =
          {
            true: `€${car.pricePerDay}`,
            false: "—",
          }[priceKey];

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

        const busyActive = isBusy(id, "active");
        const busyFeatured = isBusy(id, "featured");

        const busyClassActive = { true: "opacity-60 pointer-events-none", false: "" }[b(busyActive)];
        const busyClassFeatured = { true: "opacity-60 pointer-events-none", false: "" }[b(busyFeatured)];

        const activeBtnText = { true: "Deactivate", false: "Activate" }[statusKey];
        const activeBtnClass =
          {
            true: "rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs text-red-200 hover:bg-red-500/15",
            false: "rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-3 py-2 text-xs text-emerald-200 hover:bg-emerald-400/15",
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
          <div key={car._id} className="flex overflow-hidden rounded-2xl ring-1 ring-white/10 bg-white/[0.04]">
            <div className="flex-1 px-4 py-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-28 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/20">
                  {thumbNode}
                </div>

                <div className="min-w-0 flex-1">

                  <div className="text-[20px] leading-6 font-semibold text-white truncate">{title}</div>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className={statusPill}>{statusLabel}</span>
                    <span className="rounded-[8px] rounded-l-none border border-white/10 bg-black/20 px-2.5 py-1 relative -left-2 text-[14px] text-white/75">
                      {units} Unit
                    </span>
                  </div>
                </div>

                <div className="hidden md:flex items-center gap-10">
                  <div className="text-left">
                    <div className="text-[11px] text-white/50">Transmission</div>
                    <div className="text-[14px] font-semibold text-white">{transmission}</div>
                  </div>

                  <div className="text-left">
                    <div className="text-[11px] text-white/50">Capacity</div>
                    <div className="text-[14px] font-semibold text-white">{seatsText}</div>
                  </div>

                  <div className="text-left">
                    <div className="text-[11px] text-white/50">Price</div>
                    <div className="text-[18px] font-semibold text-white">
                      {priceMain}
                      <span className="ml-1 text-[11px] font-medium text-white/55">/days</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-[220px] shrink-0 bg-white/[0.06] border-l border-white/10 p-3 flex flex-col items-center justify-center gap-2">
              <div className="flex flex-wrap justify-center gap-2">
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
              </div>

              <div className="flex items-center justify-center gap-2">
                <button onClick={() => openEdit(car)} className={ghostBtn} type="button">
                  Edit
                </button>
                <button onClick={() => handleDelete(car)} className={ghostBtn} type="button">
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
