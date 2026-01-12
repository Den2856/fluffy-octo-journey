import type { CarCardDTO } from "../types/car.types";

const API_BASE = import.meta.env.VITE_API_URL || "";

export type CarsOptionsResponse = {
  types: string[];
  seats: number[];
};

export type CarsResponse = {
  items: CarCardDTO[];
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export async function fetchCars(params?: {
  featured?: boolean;
  q?: string;
  page?: number;
  limit?: number;
  sort?: string;
  type?: string;
  seats?: number;
}) {
  const sp = new URLSearchParams();

  sp.set("active", "true");
  sp.set("mode", "card");

  if (params?.featured) sp.set("featured", "true");
  if (params?.q) sp.set("q", params.q);
  if (params?.type) sp.set("type", params.type);
  if (params?.seats) sp.set("seats", String(params.seats));
  sp.set("page", String(params?.page ?? 1));
  sp.set("limit", String(params?.limit ?? 32));
  sp.set("sort", params?.sort ?? "createdAt:desc");

  const res = await fetch(`${API_BASE}/cars?${sp.toString()}`, { credentials: "include", });

  if (!res.ok) throw new Error(`Cars request failed: ${res.status}`);
  return (await res.json()) as CarsResponse;
}

export async function fetchCarOptions() {
  const res = await fetch(`${API_BASE}/cars/options`, { credentials: "include" });
  if (!res.ok) throw new Error(`Options request failed: ${res.status}`);
  return (await res.json()) as CarsOptionsResponse;
}

export async function fetchCarBySlug(slug: string) {
  const res = await fetch(`${API_BASE}/cars/${slug}`, {
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }

  return res.json();
}