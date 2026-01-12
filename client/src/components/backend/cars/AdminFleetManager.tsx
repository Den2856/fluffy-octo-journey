import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { type Car } from "../../../types/admin.car.types";
import { Search, List, Grid2X2, Plus } from "lucide-react";
import { Select, type Option } from "../../ui/CustomSelect";
import { API } from "../../../types/adminOrders.types";
import Pagination from "../../ui/Pagination";

import FleetGridView from "./FleetGridView";
import FleetListView from "./FleetListView";
import { b, viewBtnClass, type BusyKey } from "./fleetView.shared";

const PAGE_SIZE = 21;

export default function AdminFleetManager() {
  const navigate = useNavigate();

  const [items, setItems] = useState<Car[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");
  const [active, setActive] = useState<"all" | "true" | "false">("all");
  const [type, setType] = useState<string>("all");

  const [view, setView] = useState<"list" | "grid">("list");

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const [busyMap, setBusyMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    axios.defaults.baseURL = API;
    axios.defaults.withCredentials = true;
  }, []);

  const statusOptions: Option[] = useMemo(
    () => [
      { value: "all", label: "Status" },
      { value: "true", label: "Available" },
      { value: "false", label: "Unavailable" },
    ],
    []
  );

  const typeOptions: Option[] = useMemo(() => {
    const uniq = Array.from(
      new Set(
        items
          .map((x: any) => (x?.type || "").toString().trim())
          .filter(Boolean)
      )
    );
    const opts: Option[] = [{ value: "all", label: "Car Type" }];
    for (const t of uniq) opts.push({ value: t, label: t });
    return opts;
  }, [items]);

  function busyKey(id: string, key: BusyKey) {
    return `${id}:${key}`;
  }

  function isBusy(id: string, key: BusyKey) {
    return Boolean(busyMap[busyKey(id, key)]);
  }

  async function setCarActive(id: string, next: boolean) {
    const k = busyKey(id, "active");
    setBusyMap((m) => ({ ...m, [k]: true }));

    const prevCar = items.find((x: any) => String((x as any)._id) === id) as any;

    setItems((s) =>
      s.map((x: any) => (String(x._id) === id ? ({ ...x, isActive: next } as any) : x))
    );

    try {
      const r = await axios.patch(`/cars/${id}/active`, { isActive: next });
      const updated = r.data as any;

      setItems((s) => s.map((x: any) => (String(x._id) === id ? updated : x)));

      const shouldHide = active !== "all" && String(next) !== String(active);
      if (shouldHide) {
        setItems((s) => s.filter((x: any) => String(x._id) !== id));
      }
    } catch (e: any) {
      prevCar && setItems((s) => s.map((x: any) => (String(x._id) === id ? prevCar : x)));
      setErr(e?.response?.data?.message || e?.message || "Failed to update active");
    } finally {
      setBusyMap((m) => ({ ...m, [k]: false }));
    }
  }

  async function setCarFeatured(id: string, next: boolean) {
    const k = busyKey(id, "featured");
    setBusyMap((m) => ({ ...m, [k]: true }));

    const prevCar = items.find((x: any) => String((x as any)._id) === id) as any;

    setItems((s) =>
      s.map((x: any) => (String(x._id) === id ? ({ ...x, isFeatured: next } as any) : x))
    );

    try {
      const r = await axios.patch(`/cars/${id}/featured`, { isFeatured: next });
      const updated = r.data as any;

      setItems((s) => s.map((x: any) => (String(x._id) === id ? updated : x)));
    } catch (e: any) {
      prevCar && setItems((s) => s.map((x: any) => (String(x._id) === id ? prevCar : x)));
      setErr(e?.response?.data?.message || e?.message || "Failed to update featured");
    } finally {
      setBusyMap((m) => ({ ...m, [k]: false }));
    }
  }

  function toggleActive(car: Car) {
    const id = String((car as any)._id);
    const next = !Boolean((car as any).isActive);
    void setCarActive(id, next);
  }

  function toggleFeatured(car: Car) {
    const id = String((car as any)._id);
    const next = !Boolean((car as any).isFeatured);
    void setCarFeatured(id, next);
  }

  async function load(pageToLoad = 1) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(pageToLoad));
      params.set("limit", String(PAGE_SIZE));

      params.set("active", active);

      const qq = q.trim();
      qq && params.set("q", qq);
      type !== "all" && params.set("type", type);

      const r = await axios.get<{
        success: boolean;
        data: { items: Car[]; total: number; page: number; pages: number };
      }>(`/cars?${params.toString()}`);

      const payload = r.data.data;

      setItems(payload.items || []);
      setPage(payload.page || pageToLoad);
      setPages(payload.pages || 1);
    } catch (e: any) {
      console.error("Failed to load cars", e);
      setErr(e?.response?.data?.message || e?.message || "Failed to load cars");
      setItems([]);
      setPage(1);
      setPages(1);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setPage(1);
    void load(1);
  }, [q, active, type]);

  function openCreate() {
    navigate("new");
  }

  function openEdit(car: Car) {
    navigate(String((car as any)._id));
  }

  function handleDelete(car: Car) {
    console.log("delete", (car as any)._id);
  }

  const handlePageChange = (newPage: number) => {
    const ok = newPage >= 1 && newPage <= pages && newPage !== page;
    const run =
      {
        true: () => {
          setPage(newPage);
          void load(newPage);
        },
        false: () => {},
      }[b(ok)];
    run();
  };

  const ghostBtn =
    "rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/80 hover:bg-white/5";

  const errNode =
    {
      true: (
        <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {err}
        </div>
      ),
      false: null,
    }[b(err)];

  const FleetViewByMode = {
    grid: FleetGridView,
    list: FleetListView,
  } as const;

  const FleetView = FleetViewByMode[view];

  const bodyKey = String(Number(Boolean(loading)) * 2 + Number(Boolean(items.length === 0)));

  const readyBody = (
    <FleetView
      items={items}
      ghostBtn={ghostBtn}
      openEdit={openEdit}
      handleDelete={handleDelete}
      toggleActive={toggleActive}
      toggleFeatured={toggleFeatured}
      isBusy={isBusy}
    />
  );

  const bodyNode =
    {
      "0": readyBody,
      "1": <div className="p-6 text-sm text-white/70">No cars found.</div>,
      "2": <div className="p-6 text-sm text-white/70">Loading…</div>,
      "3": <div className="p-6 text-sm text-white/70">Loading…</div>,
    }[bodyKey] || <div className="p-6 text-sm text-white/70">Loading…</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <div className="relative w-full md:w-[360px]">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-white/55">
              <Search className="size-4" />
            </span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search client name, car, etc"
              className="h-10 w-full rounded-full pl-9 pr-3 text-sm outline-none bg-black/25 border border-white/10 text-white placeholder:text-white/35 focus:border-white/20"
            />
          </div>

          <div className="w-full md:w-[180px]">
            <Select
              value={type}
              onChange={(v) => setType(v)}
              options={typeOptions}
              placeholder="Car Type"
              buttonClassName="h-10 w-full rounded-full border border-white/10 bg-black/25 px-3 text-[12px] text-white focus:border-white/20"
              optionsClassName="bg-[#0e0e0e] text-white ring-white/10 border border-white/10"
              minWidthClass="min-w-[180px]"
            />
          </div>

          <div className="w-full md:w-[160px]">
            <Select
              value={active}
              onChange={(v) => setActive(v as any)}
              options={statusOptions}
              placeholder="Status"
              buttonClassName="h-10 w-full rounded-full border border-white/10 bg-black/25 px-3 text-[12px] text-white focus:border-white/20"
              optionsClassName="bg-[#0e0e0e] text-white ring-white/10 border border-white/10"
              minWidthClass="min-w-[160px]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setView("list")}
            className={viewBtnClass.list[b(view === "list")]}
            aria-label="List view"
          >
            <List className="size-4 text-white" />
          </button>

          <button
            type="button"
            onClick={() => setView("grid")}
            className={viewBtnClass.grid[b(view === "grid")]}
            aria-label="Grid view"
          >
            <Grid2X2 className="size-4 text-white" />
          </button>

          <button
            type="button"
            onClick={openCreate}
            className="h-10 rounded-xl px-4 text-xs font-semibold bg-red-600 text-white hover:bg-red-500"
          >
            <span className="inline-flex items-center gap-2">
              <Plus className="size-4" />
              Add Unit
            </span>
          </button>
        </div>
      </div>

      {errNode}

      <div className="rounded-2xl bg-black/30 shadow-sm ring-1 ring-white/10">
        {bodyNode}

        {pages > 1 && (
          <div className="flex border-t justify-end border-white/10 bg-black/25 px-4 py-3 rounded-b-2xl">
            <Pagination page={page} pages={pages} loading={loading} onPageChange={(item) => handlePageChange(item)} />
          </div>
        )}
      </div>
    </div>
  );
}
