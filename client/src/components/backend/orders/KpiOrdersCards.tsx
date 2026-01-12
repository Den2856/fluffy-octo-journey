import { useMemo } from "react";
import { DollarSign, CalendarDays, CarFront, Warehouse } from "lucide-react";

type OrderStatus = "pending" | "planning" | "planned" | "canceled" | "done";

export type OrderDoc = {
  _id: string;
  ref: string;
  status: OrderStatus;
  date?: string;
  createdAt?: string;
  updatedAt?: string;
  pricing?: {
    totalUsd?: number;
    total?: number;
    currency?: string;
  } | null;
};

type Props = {
  orders: OrderDoc[];
  loading?: boolean;
  range?: "week" | "month";
  totalCars?: number | null;
};

const card = "rounded-2xl bg-black/30 ring-1 ring-white/10 shadow-sm";
const iconWrap =
  "grid size-12 place-items-center rounded-full bg-white/5 ring-1 ring-white/10 text-white/80";
const titleCls = "text-[12px] text-white/55";
const valueCls = "text-[28px] font-semibold leading-none text-white";
const rightSub = "text-[12px] text-white/45";

function tsOf(o: OrderDoc): number {
  const raw = o.date || o.createdAt || o.updatedAt;
  const t = raw ? Date.parse(raw) : NaN;
  return Number.isFinite(t) ? t : 0;
}

function inRange(orders: OrderDoc[], start: number, end: number) {
  return orders.filter((o) => {
    const t = tsOf(o);
    return t >= start && t < end;
  });
}

function weekBounds(now = Date.now()) {
  const d = new Date(now);
  const day = (d.getDay() + 6) % 7; // monday-start
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  const start = d.getTime();
  const end = start + 7 * 24 * 3600 * 1000;
  return { start, end };
}

function monthBounds(now = Date.now()) {
  const d = new Date(now);
  const start = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime();
  return { start, end };
}

function sumRevenueUsd(orders: OrderDoc[]) {
  let s = 0;
  for (const o of orders) {
    const n = Number(o.pricing?.totalUsd ?? o.pricing?.total ?? 0);
    if (Number.isFinite(n)) s += n;
  }
  return s;
}

function formatMoneyUsd(n: number) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `$${Math.round(n)}`;
  }
}

function percentChange(current: number, prev: number) {
  if (!prev) return null;
  return ((current - prev) / prev) * 100;
}

function DeltaPill({ v }: { v: number | null }) {
  if (v === null) return <span className="h-7" />;

  const up = v >= 0;
  return (
    <span
      className={[
        "inline-flex h-7 items-center gap-1 rounded-full px-2 text-[12px] font-medium ring-1",
        up
          ? "bg-sky-500/10 text-sky-200 ring-sky-500/20"
          : "bg-rose-500/10 text-rose-200 ring-rose-500/20",
      ].join(" ")}
    >
      {up ? "↑" : "↓"} {Math.abs(v).toFixed(2)}%
    </span>
  );
}

function KpiCard({
  Icon,
  title,
  value,
  delta,
  fromLabel,
}: {
  Icon: any;
  title: string;
  value: string;
  delta: number | null;
  fromLabel: string;
}) {
  return (
    <div className={`${card} px-5 py-4`}>
      <div className="flex items-center gap-4">
        <div className={iconWrap}>
          <Icon className="size-5" />
        </div>

        <div className="min-w-0">
          <div className={titleCls}>{title}</div>
          <div className={`${valueCls} mt-1`}>{value}</div>
        </div>

        <div className="ml-auto flex flex-col items-end gap-1">
          <DeltaPill v={delta} />
          <div className={rightSub}>{fromLabel}</div>
        </div>
      </div>
    </div>
  );
}

export default function KpiOrdersCards({
  orders,
  loading = false,
  range = "week",
  totalCars = null,
}: Props) {
  const now = Date.now();

  const { currentOrders, prevOrders, fromLabel } = useMemo(() => {
    if (range === "month") {
      const cur = monthBounds(now);
      const prev = monthBounds(cur.start - 1);
      return {
        currentOrders: inRange(orders, cur.start, cur.end),
        prevOrders: inRange(orders, prev.start, prev.end),
        fromLabel: "from last month",
      };
    }
    const cur = weekBounds(now);
    const prev = weekBounds(cur.start - 1);
    return {
      currentOrders: inRange(orders, cur.start, cur.end),
      prevOrders: inRange(orders, prev.start, prev.end),
      fromLabel: "from last week",
    };
  }, [orders, range, now]);

  const revenueNow = useMemo(() => sumRevenueUsd(currentOrders), [currentOrders]);
  const revenuePrev = useMemo(() => sumRevenueUsd(prevOrders), [prevOrders]);
  const revenueDelta = loading ? null : percentChange(revenueNow, revenuePrev);

  const bookingsNow = currentOrders.length;
  const bookingsPrev = prevOrders.length;
  const bookingsDelta = loading ? null : percentChange(bookingsNow, bookingsPrev);

  const rentedNow = useMemo(
    () => currentOrders.filter((o) => o.status === "planned").length,
    [currentOrders]
  );
  const rentedPrev = useMemo(
    () => prevOrders.filter((o) => o.status === "planned").length,
    [prevOrders]
  );
  const rentedDelta = loading ? null : percentChange(rentedNow, rentedPrev);

  const availableNow = totalCars == null ? 0 : Math.max(0, totalCars - rentedNow);
  const availablePrev = totalCars == null ? 0 : Math.max(0, totalCars - rentedPrev);
  const availableDelta = loading ? null : percentChange(availableNow, availablePrev);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <KpiCard
        Icon={DollarSign}
        title="Total Revenue"
        value={loading ? "—" : formatMoneyUsd(revenueNow)}
        delta={revenueDelta}
        fromLabel={fromLabel}
      />

      <KpiCard
        Icon={CalendarDays}
        title="New Bookings"
        value={loading ? "—" : String(bookingsNow)}
        delta={bookingsDelta}
        fromLabel={fromLabel}
      />

      <KpiCard
        Icon={CarFront}
        title="Rented Cars"
        value={loading ? "—" : `${rentedNow} Unit`}
        delta={rentedDelta}
        fromLabel={fromLabel}
      />

      <KpiCard
        Icon={Warehouse}
        title="Available Cars"
        value={loading ? "—" : `${availableNow} Unit`}
        delta={availableDelta}
        fromLabel={fromLabel}
      />
    </div>
  );
}
