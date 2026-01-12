import type { Car } from "../../../types/admin.car.types";

export type BoolKey = "true" | "false";
export type BusyKey = "active" | "featured";

export function b(v: unknown): BoolKey {
  return String(Boolean(v)) as BoolKey;
}

export type FleetViewProps = {
  items: Car[];
  ghostBtn: string;
  openEdit: (car: Car) => void;
  handleDelete: (car: Car) => void;

  toggleActive: (car: Car) => void;
  toggleFeatured: (car: Car) => void;
  isBusy: (id: string, key: BusyKey) => boolean;
};

export const statusLabelByKey: Record<BoolKey, string> = {
  true: "Available",
  false: "Unavailable",
};

export const statusPillListByKey: Record<BoolKey, string> = {
  true:
    "rounded-[8px] border rounded-r-none px-[10px] py-[4px] text-[14px] border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  false: "rounded-[8px] border rounded-r-none px-[10px] py-[4px] text-[14px] border-white/10 bg-white/5 text-white/70",
};

export const statusPillGridByKey: Record<BoolKey, string> = {
  true:
    "rounded-[8px] border rounded-r-none px-[10px] py-[4px] text-[14px] border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  false:
    "rounded-[8px] border rounded-r-none px-[10px] py-[4px] text-[14px] border-white/10 bg-white/5 text-white/70",
};

export const viewBtnClass = {
  list: {
    true: "h-10 w-10 rounded-xl border border-white/10 grid place-items-center bg-white/10",
    false: "h-10 w-10 rounded-xl border border-white/10 grid place-items-center bg-black/20 hover:bg-white/5",
  },
  grid: {
    true: "h-10 w-10 rounded-xl border border-white/10 grid place-items-center bg-white/10",
    false: "h-10 w-10 rounded-xl border border-white/10 grid place-items-center bg-black/20 hover:bg-white/5",
  },
} as const;
