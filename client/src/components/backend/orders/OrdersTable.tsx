import { useEffect, useMemo, useState, type ReactNode } from "react";
import axios from "axios";
import { API, type Order, type SortKey } from "../../../types/adminOrders.types";
import { Search } from "lucide-react";
import { Select, type Option } from "../../ui/CustomSelect";
import Pagination from "../../ui/Pagination";
import { AssetImage } from "../../ui/AssetImage";

const PAGE_SIZE = 15;

type Car = {
  _id: string;
  make: string;
  model: string;
  trim?: string;
  type?: string;
  slug: string;
  pricePerDay: number;
  currency?: string;
  thumbnailUrl: string;
  gallery?: { url: string; alt?: string }[];
};


type OrderView = Order & { dateTs: number; dateLabel: string };

const STATUS_OPTIONS: Option[] = [
  { value: "all", label: "All status" },
  { value: "pending", label: "Pending" },
  { value: "planning", label: "Planning" },
  { value: "planned", label: "Planned" },
  { value: "canceled", label: "Canceled" },
  { value: "done", label: "Done" },
];

const STATUS_OPTIONS_FOR_ROW: Option[] = [
  { value: "", label: "—" },
  ...STATUS_OPTIONS.filter((o) => o.value !== "all"),
];

const statusButtonDark = "h-9 w-full rounded-xl border border-white/10 bg-black/25 px-3 text-[12px] text-white outline-none ring-0 focus:outline-none focus:ring-0 focus:border-white/20";


function publicAssetUrl(path: string) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  const origin =
    (import.meta as any).env?.VITE_ASSETS_ORIGIN?.toString().trim() || window.location.origin;

  const base = (import.meta as any).env?.BASE_URL?.toString() || "/";
  const basePrefix = base === "/" ? "" : base.replace(/\/$/, "");

  const p = path.startsWith("/") ? path : `/${path}`;
  return `${origin}${basePrefix}${p}`;
}

function formatMoney(amount: unknown, currency?: unknown) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "—";
  const cur = (currency || "EUR").toString();
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: cur,
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${n} ${cur}`;
  }
}

export default function OrdersTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    axios.defaults.baseURL = API;
    axios.defaults.withCredentials = true;
  }, []);

  useEffect(() => {
    void axios
      .get<{ items: Car[] }>("/cars?active=true&limit=500&page=1")
      .then((r) => setCars(r.data.items || []))
      .catch((e) => {
        console.error("cars load failed", e);
        setCars([]);
      });
  }, []);


  const toDateParts = (o: any) => {
    const raw = o?.date ?? o?.createdAt ?? o?.pickupAt ?? o?.startDate;
    const d = new Date(raw);
    const ts = Number.isNaN(d.getTime()) ? 0 : d.getTime();
    const label = ts
      ? new Intl.DateTimeFormat("ru-RU", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }).format(d)
      : "—";
    return { ts, label };
  };

  async function load(pageToLoad = 1) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("withPrice", "1");
      params.set("page", String(pageToLoad));
      params.set("limit", String(PAGE_SIZE));
      if (q.trim()) params.set("q", q.trim());
      if (statusFilter !== "all") params.set("status", statusFilter);

      const r = await axios.get<{
        success: boolean;
        data: { items: Order[]; total: number; page: number; pages: number };
      }>(`/orders?${params.toString()}`);

      const payload = r.data.data;

      const items: OrderView[] = payload.items.map((o: any) => {
        const { ts, label } = toDateParts(o);
        return { ...o, dateTs: ts, dateLabel: label };
      });


      setOrders(items as Order[]);
      setTotal(payload.total);
      setPage(payload.page);
      setPages(payload.pages || 1);
    } catch (err) {
      console.error("Failed to load orders", err);
      setOrders([]);
      setTotal(0);
      setPage(1);
      setPages(1);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load(1);
  }, [statusFilter]);

  function resolveCar(o: any) {
    const key =
      typeof o?.requestedVehicle === "object" && o?.requestedVehicle?._id
        ? String(o.requestedVehicle._id)
        : typeof o?.requestedVehicle === "string"
          ? o.requestedVehicle
          : "";

    const embedded = o?.assignedVehicle;

    const byId = key ? cars.find((c) => c._id === key) : null;
    const bySlug = key ? cars.find((c) => c.slug === key) : null;

    const c: any = embedded || byId || bySlug;

    const make = (c?.make || "").toString();
    const model = (c?.model || "").toString();
    const trim = (c?.trim || "").toString();
    const type = (c?.type || "").toString();

    const title = [make, model, trim].filter(Boolean).join(" ").trim() || "—";

    const rawThumb =
      c?.thumbnailUrl ||
      (Array.isArray(c?.gallery) && c.gallery[0]?.url ? c.gallery[0].url : "") ||
      "";

    const thumb = rawThumb ? publicAssetUrl(String(rawThumb)) : "";

    return {
      title,
      type,
      thumb,
      pricePerDay: c?.pricePerDay,
      currency: "EUR",
    };
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const rows = useMemo(() => {
    const copy = [...orders] as any[];

    copy.sort((a, b) => {
      let av: any, bv: any;

      switch (sortKey) {
        case "ref":
          av = a.ref || "";
          bv = b.ref || "";
          break;
        case "customer":
          av = a.customer || "";
          bv = b.customer || "";
          break;
        case "date":
          av = Date.parse(a.dateTs);
          bv = Date.parse(b.date);
          break;
        case "vehicle":
          av = resolveCar(a).title;
          bv = resolveCar(b).title;
          break;
        case "price": {
          const ca = resolveCar(a);
          const cb = resolveCar(b);
          av = Number(ca.pricePerDay) || 0;
          bv = Number(cb.pricePerDay) || 0;
          break;
        }
        case "status":
          av = a.status || "";
          bv = b.status || "";
          break;
        default:
          av = a.ref || "";
          bv = b.ref || "";
      }

      const cmp =
        typeof av === "string" && typeof bv === "string"
          ? av.localeCompare(bv)
          : ((av ?? -Infinity) as number) - ((bv ?? -Infinity) as number);

      return sortDir === "asc" ? cmp : -cmp;
    });

    return copy;
  }, [orders, sortKey, sortDir, cars]);

  const TH = ({ k, children }: { k: SortKey; children: ReactNode }) => (
    <th className="px-4 py-3 text-[11px] font-medium text-white/80">
      <button onClick={() => toggleSort(k)} className="inline-flex items-center gap-1 text-left">
        <span>{children}</span>
        <span className={`text-[10px] ${sortKey === k ? "opacity-100" : "opacity-30"} text-white/80`}>
          {sortKey === k ? (sortDir === "asc" ? "▲" : "▼") : "▲"}
        </span>
      </button>
    </th>
  );

  const handleSearchSubmit = (e: any) => {
    e.preventDefault();
    setPage(1);
    void load(1);
  };


  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pages || newPage === page) return;
    setPage(newPage);
    void load(newPage);
  };

  async function updateStatus(o: any, status: string) {
    try {
      const r = await axios.patch<{ success: boolean; data: Order }>(`/orders/${o._id}`, { status });
      setOrders((prev) => prev.map((x: any) => (x._id === o._id ? r.data.data : x)));
    } catch (err) {
      console.error("updateStatus failed", err);
    }
  }

  const headerLabel = loading ? "Loading…" : `Showing ${rows.length} of ${total} orders`;

  return (
    <div className="px-0 pt-4 pb-2">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[15px] font-semibold text-white">Orders List</h2>
          <p className="mt-1 text-[11px] text-white/60">Overview of all customer orders.</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[11px] text-white/60">
              <Search className="size-4" />
            </span>
            <input
              className="h-9 w-full rounded-full bg-black/25 px-9 text-xs border border-white/10 text-white placeholder:text-white/40 focus:border-white/20 focus:outline-none"
              placeholder="Search ref, customer…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </form>

          <div className="w-full sm:w-[180px]">
            <Select
              value={statusFilter}
              onChange={(v) => {
                setStatusFilter(v);
                setPage(1);
              }}
              options={STATUS_OPTIONS}
              placeholder="Filter status"
              buttonClassName={statusButtonDark}
              optionsClassName="bg-[#0e0e0e] text-white ring-white/10 border border-white/10"
              minWidthClass="min-w-[180px]"
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-black/30 shadow-sm ring-1 ring-white/10">
        <div className="flex items-center justify-between bg-red-700/70 px-4 py-3 text-[11px] font-medium text-white border-b border-white/10 rounded-t-2xl">
          <span>Orders</span>
          <span className="text-white/70">{headerLabel}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full text-xs">
            <thead className="bg-black/35">
              <tr className="text-left">
                <TH k="ref">Order Ref</TH>
                <TH k="date">Date</TH>
                <TH k="customer">Customer</TH>
                <TH k="vehicle">Vehicle</TH>
                <TH k="price">Price</TH>
                <TH k="status">Status</TH>
              </tr>
            </thead>

            <tbody className="bg-black/20">
              {loading && (
                <tr>
                  <td className="px-4 py-4 text-white/60" colSpan={6}>
                    Loading…
                  </td>
                </tr>
              )}

              {!loading && rows.length === 0 && (
                <tr>
                  <td className="px-4 py-4 text-white" colSpan={6}>
                    No orders found.
                  </td>
                </tr>
              )}

              {!loading &&
                rows.map((o: any) => {
                  const car = resolveCar(o);

                  return (
                    <tr key={o._id} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-medium text-white">{o.ref}</td>
                      <td className="px-4 py-3 text-white/70 whitespace-nowrap">{o.dateLabel}</td>

                      <td className="px-4 py-3">
                        <div className="text-white truncate max-w-[220px]">{o.customer || "—"}</div>
                        <div className="text-white/60 text-[11px] truncate max-w-[220px]">
                          {o.customerEmail || ""}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 min-w-[320px]">
                          <div className="h-10 w-16 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                            {car.thumb ? (
                              <AssetImage
                                src={car.thumb}
                                alt={car.title}
                                className="h-full w-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="h-full w-full bg-white/5" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="text-white font-medium truncate">{car.title}</div>
                            <div className="text-[11px] text-white/60 truncate">{car.type || ""}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 font-semibold text-white whitespace-nowrap">
                        {o?.pricing?.totalUsd
                          ? formatMoney(o.pricing.totalUsd, "EUR")
                          : `${formatMoney(car.pricePerDay, car.currency)} / day`}
                      </td>

                      <td className="px-4 py-3">
                        <div className="w-[160px]">
                          <Select
                            value={o.status || ""}
                            onChange={(value) => void updateStatus(o, value)}
                            options={STATUS_OPTIONS_FOR_ROW}
                            buttonClassName={statusButtonDark}
                            optionsClassName="bg-dark-200 text-white ring-white/10 border border-white/10"
                            minWidthClass="min-w-[160px]"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="flex border-t justify-end border-white/10 bg-black/25 px-4 py-3 rounded-b-2xl">
            <Pagination
              page={page}
              pages={pages}
              loading={loading}
              onPageChange={(item) => handlePageChange(item)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
