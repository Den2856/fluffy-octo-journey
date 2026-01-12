import { useEffect, useState } from "react";
import { fetchCars } from "../../api/cars";
import type { CarCardDTO } from "../../types/car.types";
import CarCard from "../ui/CarCard";
import Spinner from "../ui/Spinner";
import type { CarsFiltersValue } from "../ui/CarsFilter"

export default function CarsGrid({ featuredOnly = true, limit, filters, }: { featuredOnly?: boolean; limit?: number; filters?: CarsFiltersValue; }) {
  
  const [items, setItems] = useState<CarCardDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");

  const type = filters?.type;
  const seats = filters?.seats;
  const sort = filters?.priceSort ?? "createdAt:desc";

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setErr("");

        const data = await fetchCars({
          featured: featuredOnly,
          limit,
          sort,
          type,
          seats,
        });

        if (!alive) return;
        setItems(data.items);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "Failed to load cars");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [featuredOnly, limit, sort, type, seats]);

  if (loading) return <Spinner />;
  if (err) return <div>{err}</div>;

  return (
    <div className="grid max-w-[1440px] mx-auto gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((car) => (
        <CarCard key={car._id} car={car} />
      ))}
    </div>
  );
}
