import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Select, type Option } from "../../ui/CustomSelect";

type OrderStatus = "pending" | "planning" | "planned" | "canceled" | "done";

export type OrderDoc = {
  _id: string;
  status: OrderStatus;
  date?: string;
  createdAt?: string;
  updatedAt?: string;
  pricing?: { totalUsd?: number; total?: number } | null;
};

type RangeKey = "1y" | "8m" | "4m" | "3m";

type Props = {
  orders: OrderDoc[];
  loading?: boolean;
  defaultRange?: RangeKey;
};

const cardBase = "rounded-2xl bg-black/30 ring-1 ring-white/10 shadow-sm";
const cardPad = "p-4 md:p-5";

const RANGE_OPTIONS: Option[] = [
  { value: "1y", label: "Last Year" },
  { value: "8m", label: "Last 8 Month" },
  { value: "4m", label: "Last 4 Month" },
  { value: "3m", label: "Last 3 Month" },
];

function tsOf(o: OrderDoc): number {
  const raw = o.date || o.createdAt || o.updatedAt;
  const t = raw ? Date.parse(raw) : NaN;
  return Number.isFinite(t) ? t : 0;
}

function toUsd(o: OrderDoc): number {
  const n = Number(o.pricing?.totalUsd ?? o.pricing?.total ?? 0);
  return Number.isFinite(n) ? n : 0;
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

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(d: Date) {
  return d.toLocaleString("en-US", { month: "short" });
}

function headerLabel(d: Date) {
  return d.toLocaleString("en-US", { month: "long", year: "numeric" });
}

function rangeToMonths(k: RangeKey) {
  if (k === "3m") return 3;
  if (k === "4m") return 4;
  if (k === "8m") return 8;
  return 12;
}

type Point = {
  key: string;
  month: string;
  total: number;
  header: string;
};

function buildMonthlySeries(orders: OrderDoc[], monthsBack: number, nowTs: number): Point[] {
  const now = new Date(nowTs);

  const end = new Date(now.getFullYear(), now.getMonth(), 1);

  const buckets: { d: Date; key: string; total: number }[] = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(end.getFullYear(), end.getMonth() - i, 1);
    buckets.push({ d, key: monthKey(d), total: 0 });
  }

  const map = new Map(buckets.map((b) => [b.key, b]));
  for (const o of orders) {
    const t = tsOf(o);
    if (!t) continue;
    const d = new Date(t);
    const k = monthKey(new Date(d.getFullYear(), d.getMonth(), 1));
    const b = map.get(k);
    if (!b) continue;
    b.total += toUsd(o);
  }

  return buckets.map((b) => ({
    key: b.key,
    month: monthLabel(b.d),
    total: Math.round(b.total),
    header: headerLabel(b.d),
  }));
}

function TooltipCard({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload as Point | undefined;
  if (!p) return null;

  return (
    <div className="rounded-2xl bg-[#0e0e0e]/95 border border-white/10 px-4 py-3 shadow-xl">
      <div className="text-[11px] text-white/60">{p.header}</div>
      <div className="mt-1 text-[16px] font-semibold text-white">{formatMoneyUsd(p.total)}</div>
    </div>
  );
}

export default function EarningsSummaryChart({
  orders,
  loading = false,
  defaultRange = "8m",
}: Props) {
  const [range, setRange] = useState<RangeKey>(defaultRange);
  const monthsBack = rangeToMonths(range);

  const nowTs = Date.now();

  const data = useMemo(() => {
    return buildMonthlySeries(orders, monthsBack, nowTs);
  }, [orders, monthsBack, nowTs]);

  const peakIndex = useMemo(() => {
    if (!data.length) return 0;
    let bestI = 0;
    let best = data[0].total;
    for (let i = 1; i < data.length; i++) {
      if (data[i].total > best) {
        best = data[i].total;
        bestI = i;
      }
    }
    return bestI;
  }, [data]);

  return (
    <div className={`${cardBase} ${cardPad}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-[14px] font-semibold text-white">Earnings Summary</div>
        </div>

        <div className="w-[170px]">
          <Select
            value={range}
            onChange={(v) => setRange(v as RangeKey)}
            options={RANGE_OPTIONS}
            placeholder="Last 8 Month"
            buttonClassName="h-9 w-full rounded-xl border border-white/10 bg-black/25 px-3 text-[12px] text-white"
            optionsClassName="bg-[#0e0e0e] text-white ring-white/10 border border-white/10"
            minWidthClass="min-w-[170px]"
          />
        </div>
      </div>

      <div className="h-[260px] md:h-[300px] text-red-500">
        {loading ? (
          <div className="h-full grid place-items-center text-white/60 text-[12px]">Loading…</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 18, right: 16, bottom: 8, left: 4 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis
                dataKey="month"
                stroke="rgba(255,255,255,0.45)"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="rgba(255,255,255,0.45)"
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${Math.round(Number(v) / 1000)}K`}
              />
              <Tooltip content={<TooltipCard />} cursor={{ stroke: "rgba(255,255,255,0.08)" }} />

              <Line
                type="monotone"
                dataKey="total"
                stroke="currentColor"
                strokeWidth={2.5}
                dot={false}
                activeDot={{
                  r: 6,
                  strokeWidth: 2,
                  stroke: "rgba(255,255,255,0.25)",
                }}
              />

              {data[peakIndex] && (
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="transparent"
                  dot={(props: any) => {
                    const { cx, cy, index } = props;
                    if (index !== peakIndex) return null;
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={6}
                        fill="rgba(255,255,255, 1)"
                        stroke="rgba(0,0,0,0.35)"
                        strokeWidth={2}
                      />
                    );
                  }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
