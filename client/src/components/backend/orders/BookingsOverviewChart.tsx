import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import { Select, type Option } from "../../ui/CustomSelect";
import { API } from "../../../types/adminOrders.types";

type OrderStatus = "pending" | "planning" | "planned" | "canceled" | "done";

type OrderDoc = {
  _id: string;
  status?: OrderStatus;
  date?: string;
  createdAt?: string;
  pickupAt?: string;
  startDate?: string;
};

type RangeKey = "thisYear" | "lastYear";

type Point = {
  month: string;   // Jan
  value: number;   // bookings count
  header: string;  // April 2028
  idx: number;     // 0..11
};

const RANGE_OPTIONS: Option[] = [
  { value: "thisYear", label: "This Year" },
  { value: "lastYear", label: "Last Year" },
];

const CARD_BASE = "rounded-2xl bg-black/30 ring-1 ring-white/10 shadow-sm";
const CARD_PAD = "p-4 md:p-5";

const LIMIT = 500;

// как в OrdersTable: берем “дату заказа” из нескольких возможных полей
function orderTs(o: OrderDoc): number {
  const raw = o.date || o.createdAt || o.pickupAt || o.startDate;
  const t = raw ? Date.parse(raw) : NaN;
  return Number.isFinite(t) ? t : 0;
}

function monthShort(i: number) {
  const d = new Date(2020, i, 1);
  return d.toLocaleString("en-US", { month: "short" });
}

function monthHeader(year: number, i: number) {
  const d = new Date(year, i, 1);
  return d.toLocaleString("en-US", { month: "long", year: "numeric" });
}

function formatYAxisTick(v: any) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "";
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
  return String(Math.round(n));
}

function computeNiceMax(maxVal: number) {
  // простой “nice” максимум под 5 делений, чтобы было похоже на скрин
  if (!Number.isFinite(maxVal) || maxVal <= 0) return 1200;
  const steps = [50, 100, 150, 200, 250, 300, 400, 500];
  const targetTicks = 4; // 0..max = 5 меток
  let best = 1200;

  for (const s of steps) {
    const m = Math.ceil(maxVal / s) * s;
    // стараемся чтобы было около 4 шагов вверх
    if (m / s >= targetTicks && m < best) best = m;
  }
  // если очень много — просто округлим до ближайших 100/500
  if (best < maxVal) best = Math.ceil(maxVal / 500) * 500;
  return best;
}

function TooltipCard({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload as Point | undefined;
  if (!p) return null;

  return (
    <div className="rounded-2xl bg-[#0e0e0e]/95 border border-white/10 px-4 py-3 shadow-xl">
      <div className="text-[11px] text-white/60">{p.header}</div>
      <div className="mt-1 text-[16px] font-semibold text-white">{p.value}</div>
    </div>
  );
}

async function fetchAllOrders(cancelRef: { current: boolean }) {
  // 1-в-1 как OrdersTable: URLSearchParams + axios.get + r.data.data
  const params1 = new URLSearchParams();
  params1.set("page", "1");
  params1.set("limit", String(LIMIT));
  params1.set("withPrice", "0"); // не нужно для количества бронирований, но формат как в OrdersTable

  const r1 = await axios.get<{
    success: boolean;
    data: { items: OrderDoc[]; total: number; page: number; pages: number };
  }>(`/orders?${params1.toString()}`);

  const first = r1.data?.data;
  const out: OrderDoc[] = [...(first?.items || [])];

  const totalPages = Number(first?.pages || 1);

  // добираем остальные страницы
  for (let p = 2; p <= totalPages; p++) {
    if (cancelRef.current) return [];
    const params = new URLSearchParams();
    params.set("page", String(p));
    params.set("limit", String(LIMIT));
    params.set("withPrice", "0");

    const r = await axios.get<{
      success: boolean;
      data: { items: OrderDoc[]; total: number; page: number; pages: number };
    }>(`/orders?${params.toString()}`);

    const payload = r.data?.data;
    const items = payload?.items || [];
    out.push(...items);
  }

  return out;
}

export default function BookingsOverviewChart() {
  const [range, setRange] = useState<RangeKey>("thisYear");
  const [loading, setLoading] = useState(true);

  const [points, setPoints] = useState<Point[]>([]);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const cancelRef = useRef(false);

  useEffect(() => {
    axios.defaults.baseURL = API;
    axios.defaults.withCredentials = true;
  }, []);

  useEffect(() => {
    cancelRef.current = false;

    (async () => {
      setLoading(true);
      try {
        const all = await fetchAllOrders(cancelRef);

        if (cancelRef.current) return;

        const now = new Date();
        const year = range === "thisYear" ? now.getFullYear() : now.getFullYear() - 1;

        // 12 месяцев
        const counts = new Array(12).fill(0) as number[];

        for (const o of all) {
          // можно исключить canceled (обычно бронь = не canceled)
          if (o.status === "canceled") continue;

          const t = orderTs(o);
          if (!t) continue;

          const d = new Date(t);
          if (d.getFullYear() !== year) continue;

          const m = d.getMonth();
          if (m < 0 || m > 11) continue;

          counts[m] += 1;
        }

        const next: Point[] = [];
        for (let i = 0; i < 12; i++) {
          next.push({
            month: monthShort(i),
            value: counts[i],
            header: monthHeader(year, i),
            idx: i,
          });
        }

        setPoints(next);
      } catch (e) {
        console.error("BookingsOverview load failed", e);
        setPoints([]);
      } finally {
        if (!cancelRef.current) setLoading(false);
      }
    })();

    return () => {
      cancelRef.current = true;
    };
  }, [range]);

  const defaultActiveIndex = useMemo(() => {
    const now = new Date();
    if (range === "thisYear") return now.getMonth();
    return 11;
  }, [range]);

  const activeIndex = hoverIndex === null ? defaultActiveIndex : hoverIndex;

  const maxVal = useMemo(() => {
    let m = 0;
    for (const p of points) if (p.value > m) m = p.value;
    return m;
  }, [points]);

  const yMax = useMemo(() => computeNiceMax(maxVal), [maxVal]);

  // цвета как на скрине: тёмные столбы + 1 красный
  const barInactive = "#1b2a3a";
  const barActive = "#ff1f3d";

  return (
    <div className={CARD_BASE + " " + CARD_PAD}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-[14px] font-semibold text-white">Bookings Overview</div>

        <div className="w-[150px]">
          <Select
            value={range}
            onChange={(v) => setRange(v as RangeKey)}
            options={RANGE_OPTIONS}
            placeholder="This Year"
            buttonClassName="h-9 w-full rounded-xl border border-white/10 bg-black/25 px-3 text-[12px] text-white"
            optionsClassName="bg-[#0e0e0e] text-white ring-white/10 border border-white/10"
            minWidthClass="min-w-[150px]"
          />
        </div>
      </div>

      <div className="h-[240px] md:h-[280px]">
        {loading ? (
          <div className="h-full grid place-items-center text-white/60 text-[12px]">Loading…</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={points}
              margin={{ top: 10, right: 12, bottom: 8, left: 6 }}
              onMouseMove={(state: any) => {
                const i = state?.activeTooltipIndex;
                if (typeof i === "number" && i >= 0 && i <= 11) {
                  if (hoverIndex !== i) setHoverIndex(i);
                }
              }}
              onMouseLeave={() => setHoverIndex(null)}
            >
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis
                dataKey="month"
                stroke="rgba(255,255,255,0.45)"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[0, yMax]}
                tickCount={5}
                stroke="rgba(255,255,255,0.45)"
                tickLine={false}
                axisLine={false}
                tickFormatter={formatYAxisTick}
              />
              <Tooltip
                content={<TooltipCard />}
                cursor={{ fill: "rgba(255,255,255,0.06)" }}
              />

              <Bar dataKey="value" barSize={28} radius={[12, 12, 12, 12]}>
                {points.map((p, i) => (
                  <Cell key={p.idx} fill={i === activeIndex ? barActive : barInactive} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
