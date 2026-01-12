import { useEffect, useRef } from "react";
import { Draggable } from "@fullcalendar/interaction";
import { Search, X } from "lucide-react";

import type { OrderLite } from "../types";

type Props = {
  open: boolean;
  onClose: () => void;

  q: string;
  onQChange: (v: string) => void;

  items: OrderLite[];
};

function SheetOpen({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed left-0 right-0 bottom-0 z-[80] transition-all duration-200 translate-y-0 opacity-100 pointer-events-auto">
      {children}
    </div>
  );
}

function SheetClosed({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed left-0 right-0 bottom-0 z-[80] transition-all duration-200 translate-y-full opacity-0 pointer-events-none">
      {children}
    </div>
  );
}

function PillSet({ label }: { label: string }) {
  return <div className="rounded-xl border px-2.5 py-2 text-[11px] text-emerald-200 bg-emerald-400/10 border-emerald-400/20">{label}</div>;
}

function PillUnset({ label }: { label: string }) {
  return <div className="rounded-xl border px-2.5 py-2 text-[11px] text-white/70 bg-white/5 border-white/10">{label}</div>;
}

export default function UnscheduledSheet({ open, onClose, q, onQChange, items }: Props) {
  const draggableRef = useRef<Draggable | null>(null);
  const zoneRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const el = zoneRef.current;
    if (!el) return;

    if (draggableRef.current) {
      draggableRef.current.destroy();
      draggableRef.current = null;
    }

    draggableRef.current = new Draggable(el, {
      itemSelector: "[data-order-drag]",
      eventData: (dragEl) => {
        const orderId = String(dragEl.getAttribute("data-order-id") || "");
        const kind = String(dragEl.getAttribute("data-kind") || "pickup") as "pickup" | "return";
        const label = String(dragEl.getAttribute("data-title") || "Order");

        return {
          title: label,
          duration: "01:00",
          extendedProps: { orderId, type: kind },
        };
      },
    });

    return () => {
      if (draggableRef.current) {
        draggableRef.current.destroy();
        draggableRef.current = null;
      }
    };
  }, [open, items]);

  const Wrap = open ? SheetOpen : SheetClosed;

  return (
    <Wrap>
      <div className="mx-auto w-full max-w-[1100px] px-4">
        <div className="rounded-t-2xl border border-white/10 bg-[#0b0b0b] shadow-2xl">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
            <div className="text-[14px] font-semibold text-white">Unscheduled (planning)</div>

            <button
              type="button"
              onClick={onClose}
              className="ml-auto h-9 w-9 rounded-xl grid place-items-center bg-white/5 hover:bg-white/10 border border-white/10"
            >
              <X className="size-4 text-white/80" />
            </button>
          </div>

          <div className="p-3">
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-white/45">
                <Search className="size-4" />
              </span>
              <input
                value={q}
                onChange={(e) => onQChange(e.target.value)}
                placeholder="Search by ref / customer"
                className="h-10 w-full rounded-xl pl-9 pr-3 text-sm outline-none bg-black/40 border border-white/10 text-white placeholder:text-white/35 focus:border-white/20"
              />
            </div>

            <div
              id="unscheduled-drag-zone"
              ref={zoneRef}
              className="mt-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 max-h-[36vh] overflow-auto pr-1"
            >
              {items.map((o) => {
                const pickIsSet = Boolean(o.pickupAt);
                const retIsSet = Boolean(o.returnAt);

                return (
                  <div key={o._id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                    <div className="text-[12px] text-white/55">{o.ref}</div>
                    <div className="text-[14px] font-semibold text-white truncate">{o.customer}</div>

                    <div className="mt-2 flex flex-wrap gap-2">
                      <div
                        data-order-drag
                        data-order-id={o._id}
                        data-kind="pickup"
                        data-title={`Pickup • ${o.ref}`}
                        className="cursor-grab select-none rounded-xl border px-3 py-2 text-[12px] font-semibold bg-sky-500/15 border-sky-400/25 text-white/90"
                        title="Drag to calendar to set pickup time"
                      >
                        Pickup
                      </div>

                      <div
                        data-order-drag
                        data-order-id={o._id}
                        data-kind="return"
                        data-title={`Return • ${o.ref}`}
                        className="cursor-grab select-none rounded-xl border px-3 py-2 text-[12px] font-semibold bg-rose-500/15 border-rose-400/25 text-white/90"
                        title="Drag to calendar to set return time"
                      >
                        Return
                      </div>

                      {pickIsSet ? <PillSet label="Pickup set" /> : <PillUnset label="Pickup set" />}
                      {retIsSet ? <PillSet label="Return set" /> : <PillUnset label="Return set" />}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 text-[12px] text-white/45">
              Drag “Pickup/Return” into the calendar. To delete: drag an existing event into <b>Trash</b>.
            </div>
          </div>
        </div>
      </div>
    </Wrap>
  );
}
