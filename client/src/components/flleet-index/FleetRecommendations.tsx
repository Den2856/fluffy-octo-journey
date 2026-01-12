import { useEffect, useState } from "react";
import CarCard from "../ui/CarCard";
import Spinner from "../ui/Spinner";
import type { CarCardDTO } from "../../types/car.types";

async function fetchRecommendations(slug: string, limit = 3) {
  const API = import.meta.env.VITE_API_URL;
  const res = await fetch(`${API}/cars/${slug}/recommendations?limit=${limit}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as { items: CarCardDTO[] };
}

export default function FlletRecommendations({ slug }: { slug: string }) {
  const [items, setItems] = useState<CarCardDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        const data = await fetchRecommendations(slug, 3);
        if (!alive) return;
        setItems(data.items);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [slug]);

  if (loading) return <Spinner />;
  if (!items.length) return null;

  return (
    <section className="flex gap-6 flex-col">
      <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
        You may also like:
      </h2>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((car) => (
          <CarCard key={car._id} car={car} />
        ))}
      </div>
    </section>
  );
}
