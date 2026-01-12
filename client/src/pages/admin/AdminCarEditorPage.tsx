import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { Car, CarUpsertPayload } from "../../types/admin.car.types";
import { adminCreateCar, adminGetCar, adminUpdateCar } from "../../components/backend/cars/adminCars";
import CarEditorPanel from "../../components/backend/cars/CarEditorPanel";

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export default function AdminCarEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const isCreate = !id;

  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadErr, setLoadErr] = useState<string>("");

  async function loadOne(carId: string) {
    setLoading(true);
    setLoadErr("");
    try {
      const c = await adminGetCar(carId);
      setCar(c);
    } catch (e: any) {
      setLoadErr(e?.response?.data?.message || e?.message || "Failed to load car");
      setCar(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!id) {
      setCar(null);
      setLoadErr("");
      setLoading(false);
      return;
    }
    loadOne(id);
  }, [id]);

  async function onSave(payload: CarUpsertPayload, carId?: string) {
    const saved = carId ? await adminUpdateCar(carId, payload) : await adminCreateCar(payload);
    setCar(saved);

    if (!carId) {
      navigate(`/admin/fleet`, { replace: true });
    }

    return saved;
  }

  const title = useMemo(() => {
    if (isCreate) return "Create car";
    const name = [car?.make, car?.model, car?.trim].filter(Boolean).join(" ").trim();
    return name ? `Edit: ${name}` : "Edit car";
  }, [isCreate, car?.make, car?.model, car?.trim]);

  const meta = useMemo(() => {
    if (isCreate) return null;
    if (!car) return null;
    const items: Array<{ label: string; value: string }> = [];
    if (car.slug) items.push({ label: "slug", value: String(car.slug) });
    return items;
  }, [isCreate, car]);

  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-4 px-3 py-4 md:px-6">
      {/* top header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-[12px] text-white/45">
            <Link to="/admin/fleet" className="hover:text-white/70">
              Fleet
            </Link>
            <span className="text-white/20">/</span>
            <span className="text-white/65">{isCreate ? "New" : "Edit"}</span>
          </div>

          <div className="mt-1 truncate text-xl font-semibold text-white">{title}</div>

          {!isCreate && car ? (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "rounded-full border px-2 py-[2px] text-[10px]",
                  car.isActive
                    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                    : "border-red-400/20 bg-red-400/10 text-red-200"
                )}
              >
                {car.isActive ? "ACTIVE" : "INACTIVE"}
              </span>
              {car.isFeatured ? (
                <span className="rounded-full border border-yellow-400/20 bg-yellow-400/10 px-2 py-[2px] text-[10px] text-yellow-200">
                  FEATURED
                </span>
              ) : null}

              {meta?.map((x) => (
                <span
                  key={x.label}
                  className="rounded-full border border-white/10 bg-white/0 px-2 py-[2px] text-[10px] text-white/60"
                >
                  {x.label}: {x.value}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="rounded-xl border border-white/10 bg-white/0 px-3 py-2 text-xs text-white/80 hover:bg-white/5"
          >
            Back
          </button>
        </div>
      </div>

      {loadErr ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {loadErr}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">Loading…</div>
      ) : (
        <CarEditorPanel
          variant="page"
          car={car}
          mode={isCreate ? "create" : "edit"}
          onClose={() => navigate(-1)}
          onSave={onSave}
          afterChange={() => (id ? loadOne(id) : undefined)}
        />
      )}
    </div>
  );
}
