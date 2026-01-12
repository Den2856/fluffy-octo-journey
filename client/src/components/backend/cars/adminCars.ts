import { http } from "../../../api/http";
import type { Car, CarUpsertPayload } from "../../../types/admin.car.types";

export async function adminGetCar(id: string) {
  const { data } = await http.get<Car>(`/cars/by-id/${id}`);
  return data;
}

export async function adminListCars(params: {
  q?: string;
  active?: "all" | "true" | "false";
  page?: number;
  limit?: number;
}) {
  const { data } = await http.get<{ items: Car[] }>("/cars", {
    params: {
      q: params.q || "",
      active: params.active || "all",
      page: params.page ?? 1,
      limit: params.limit ?? Infinity,
    },
  });
  return data.items;
}

export async function adminCreateCar(payload: CarUpsertPayload) {
  const { data } = await http.post<Car>("/cars", payload);
  return data;
}

export async function adminUpdateCar(id: string, payload: CarUpsertPayload) {
  const { data } = await http.patch<Car>(`/cars/${id}`, payload);
  return data;
}

export async function adminSetCarActive(id: string, isActive: boolean) {
  const { data } = await http.patch<Car>(`/cars/${id}/active`, { isActive });
  return data;
}

export async function adminSetCarFeatured(id: string, isFeatured: boolean) {
  const { data } = await http.patch<Car>(`/cars/${id}/featured`, { isFeatured });
  return data;
}

export async function adminUploadCarImages(id: string, files: File[], alts?: string[]) {
  const fd = new FormData();
  files.forEach((f) => fd.append("files", f));
  if (alts?.length) fd.append("alts", JSON.stringify(alts));

  const { data } = await http.post<Car>(`/cars/${id}/upload`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
}