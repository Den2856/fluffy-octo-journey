import { useMemo } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

type OrderStatus = "pending" | "planning" | "planned" | "canceled" | "done";

export type OrderDoc = {
  _id: string;
  ref: string;
  status: OrderStatus;
  date?: string;
  createdAt?: string;
  updatedAt?: string;
};

type Props = {
  orders: OrderDoc[];
  loading?: boolean;
  range?: "week" | "month";
};

const cardBase = "rounded-2xl bg-black/30 ring-1 ring-white/10 shadow-sm";
const cardPad = "p-4 md:p-5";
const subtle = "text-white/60";

function tsOf(o: OrderDoc): number {
  const raw = o.date || o.createdAt || o.updatedAt;
  const t = raw ? Date.parse(raw) : NaN;
  return Number.isFinite(t) ? t : 0;
}

function weekBounds(now = Date.now()) {
  const d = new Date(now);
  const day = (d.getDay() + 6) % 7;
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

function inRange<T extends OrderDoc>(orders: T[], start: number, end: number) {
  return orders.filter((o) => {
    const t = tsOf(o);
    return t >= start && t < end;
  });
}

function mapToBucket(status: OrderStatus): "hired" | "pending" | "cancelled" {
  if (status === "canceled") return "cancelled";
  if (status === "pending" || status === "planning") return "pending";
  return "hired"; // planned + done
}

export default function RentStatusDonut({ orders, loading = false, range = "week" }: Props) {
  const now = Date.now();

  const currentOrders = useMemo(() => {
    const cur = range === "month" ? monthBounds(now) : weekBounds(now);
    return inRange(orders, cur.start, cur.end);
  }, [orders, range, now]);

  const data = useMemo(() => {
    const counts = { hired: 0, pending: 0, cancelled: 0 };
    for (const o of currentOrders) counts[mapToBucket(o.status)]++;
    const total = counts.hired + counts.pending + counts.cancelled || 1;

    return [
      { name: "Hired", key: "hired", value: counts.hired, pct: Math.round((counts.hired / total) * 100) },
      { name: "Pending", key: "pending", value: counts.pending, pct: Math.round((counts.pending / total) * 100) },
      { name: "Cancelled", key: "cancelled", value: counts.cancelled, pct: Math.round((counts.cancelled / total) * 100) },
    ];
  }, [currentOrders]);

  return (
    <div className={`${cardBase} ${cardPad}`}>
      <div className="mb-3">
        <div className="text-[14px] font-semibold text-white">Rent Status</div>
        <div className={`text-[11px] ${subtle}`}>Current period distribution</div>
      </div>

      <div className="flex items-center gap-4 flex-col">
        <div className="h-[170px] w-[170px]">
          {loading ? (
            <div className="h-full grid place-items-center text-white/60 text-[12px]">Loading…</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={0}
                  stroke="transparent"
                >
                  {data.map((x) => (
                    <Cell
                      key={x.key}
                      fill={
                        x.key === "pending"
                          ? "rgba(239,68,68,0.95)"
                          : x.key === "hired"
                            ? "rgba(134,24,24,0.90)"
                            : "rgba(255,255,255,0.08)"
                      }
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="min-w-0 flex-1">
          {data.map((x) => (
            <div key={x.key} className="flex items-center justify-between gap-3 py-2">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block size-2 rounded-[3px]"
                  style={{
                    background:
                      x.key === "pending"
                        ? "rgba(239,68,68,0.95)"
                        : x.key === "hired"
                          ? "rgba(134,24,24,0.90)"
                          : "rgba(255,255,255,0.08)",
                  }}
                />
                <span className="text-[12px] text-white/75">{x.name}</span>
              </div>
              <span className="text-[12px] text-white font-medium">{x.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
