import axios from "axios";
import type { CalendarEvent, CalendarType, OrderLite } from "./types";

export function configureAxios(baseURL: string) {
  axios.defaults.baseURL = baseURL;
  axios.defaults.withCredentials = true;
}

export async function fetchCalendarEvents(from: Date, to: Date, type: CalendarType) {
  const params = new URLSearchParams();
  params.set("from", from.toISOString());
  params.set("to", to.toISOString());
  params.set("type", type);

  const r = await axios.get<{ success: boolean; data: { items: CalendarEvent[] } }>(
    `/orders/calendar?${params.toString()}`
  );

  return r.data?.data?.items || [];
}

export async function fetchUnscheduledOrders(q: string) {
  const params = new URLSearchParams();
  params.set("status", "planning");
  params.set("limit", "200");
  q.trim() && params.set("q", q.trim());

  const r = await axios.get<{ success: boolean; data: { items: any[] } }>(`/orders?${params.toString()}`);

  const items = (r.data?.data?.items || []).map((o: any) => ({
    _id: String(o._id),
    ref: String(o.ref || ""),
    customer: String(o.customer || ""),
    status: String(o.status || ""),
    pickupAt: o.pickupAt ? new Date(o.pickupAt).toISOString() : null,
    returnAt: o.returnAt ? new Date(o.returnAt).toISOString() : null,
  })) as OrderLite[];

  return items;
}

export async function patchOrderSchedule(
  orderId: string,
  kind: "pickup" | "return",
  start: Date | null,
  end: Date | null
) {
  const body = {
    type: kind,
    start: start ? start.toISOString() : null,
    end: end ? end.toISOString() : null,
  };

  const r = await axios.patch(`/orders/${orderId}/schedule`, body);
  return r.data;
}
