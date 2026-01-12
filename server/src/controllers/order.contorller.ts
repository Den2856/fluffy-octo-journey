import type { Request, Response } from "express";
import { OrderModel, ORDER_STATUSES, type OrderStatus } from "../models/order.model";
import { NotificationModel } from "../models/notification.model";
import { pushToUser } from "../utils/notfyHub";
import { CarModel } from "../models/car.model";

type AuthedReq = Request & { user?: { _id: string; role?: string } };

const MS_DAY = 24 * 60 * 60 * 1000;
const PRICED = new Set<OrderStatus>(["planned", "done"]);

function isStatus(x: any): x is OrderStatus {
  return ORDER_STATUSES.includes(x);
}

function safeDate(v: any): Date | null {
  if (!v) return null;
  const d = v instanceof Date ? v : new Date(v);
  return Number.isFinite(d.getTime()) ? d : null;
}

function daysBetween(start: Date, end: Date) {
  const diff = end.getTime() - start.getTime();
  if (!Number.isFinite(diff) || diff <= 0) return 0;
  return Math.max(1, Math.ceil(diff / MS_DAY));
}

function resolveDays(order: any, status: OrderStatus, start: Date | null, end: Date | null): number | null {
  if (start && end) {
    const d = daysBetween(start, end);
    if (d > 0) return d;
  }

  const rd = Number(order?.rentalDays);
  if (Number.isFinite(rd) && rd > 0) return Math.max(1, Math.round(rd));

  if (PRICED.has(status)) return 1;
  return null;
}

async function getPricePerDay(vehicleId: any): Promise<number | null> {
  if (!vehicleId) return null;
  const car = await CarModel.findById(vehicleId).select("pricePerDay").lean();
  const n = Number((car as any)?.pricePerDay);
  return Number.isFinite(n) && n > 0 ? n : null;
}

async function computePricing(order: any, nextStatus: OrderStatus, start: Date | null, end: Date | null) {
  if (!PRICED.has(nextStatus)) return null;
  const vehicleId = order?.requestedVehicle;
  const pricePerDay = await getPricePerDay(vehicleId);
  if (!pricePerDay) return null;

  const days = resolveDays(order, nextStatus, start, end);
  if (!days) return null;

  const totalUsd = Math.round(days * pricePerDay);
  return { totalUsd, currency: "USD", breakdown: { days, pricePerDay } };
}

export async function listOrders(req: AuthedReq, res: Response): Promise<void> {
  try {
    const page = Math.max(Number(req.query.page ?? 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit ?? 15), 1), 500);
    const q = String(req.query.q ?? "").trim();
    const status = String(req.query.status ?? "").trim();
    const withPrice = String(req.query.withPrice ?? "") === "1";

    const filter: any = {};
    if (q) {
      filter.$or = [
        { ref: { $regex: q, $options: "i" } },
        { customer: { $regex: q, $options: "i" } },
        { customerEmail: { $regex: q, $options: "i" } },
      ];
    }
    if (status && status !== "all") filter.status = status;

    const total = await OrderModel.countDocuments(filter);
    const pages = Math.max(Math.ceil(total / limit), 1);

    const items = await OrderModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    if (!withPrice) {
      res.json({ success: true, data: { items, total, page, pages } });
      return;
    }

    const needIds = Array.from(
      new Set(
        items
          .filter((o: any) => PRICED.has(o.status) && !o?.pricing?.totalUsd && o.requestedVehicle)
          .map((o: any) => String(o.requestedVehicle))
      )
    );

    const priceMap = new Map<string, number>();
    if (needIds.length) {
      const cars = await CarModel.find({ _id: { $in: needIds } }).select("_id pricePerDay").lean();
      for (const c of cars as any[]) {
        const p = Number(c?.pricePerDay);
        if (Number.isFinite(p) && p > 0) priceMap.set(String(c._id), p);
      }
    }

    const enriched = items.map((o: any) => {
      if (o?.pricing?.totalUsd) return o;
      if (!PRICED.has(o.status)) return o;

      const pricePerDay = priceMap.get(String(o.requestedVehicle));
      if (!pricePerDay) return o;

      const start = safeDate(o.pickupAt ?? o.pickupEndAt);
      const end = safeDate(o.returnAt ?? o.returnEndAt);
      const days = resolveDays(o, o.status, start, end);
      if (!days) return o;

      return {
        ...o,
        pricing: { totalUsd: Math.round(days * pricePerDay), currency: "USD", breakdown: { days, pricePerDay } },
      };
    });

    res.json({ success: true, data: { items: enriched, total, page, pages } });
  } catch (err: any) {
    console.error("listOrders error:", err);
    res.status(500).json({ success: false, message: err?.message || "Server error" });
  }
}

export async function patchOrder(req: AuthedReq, res: Response): Promise<void> {
  try {
    const { status, pickupEndAt, returnEndAt, rentalDays } = req.body ?? {};

    const orderBefore = await OrderModel.findById(req.params.id).lean();
    if (!orderBefore) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    const upd: any = {};

    // status
    if (status !== undefined) {
      if (!isStatus(status)) {
        res.status(400).json({ success: false, message: "Invalid status" });
        return;
      }
      upd.status = status;
    }

    // booking (optional)
    if (pickupEndAt !== undefined) upd.pickupEndAt = pickupEndAt ? new Date(pickupEndAt) : null;
    if (returnEndAt !== undefined) upd.returnEndAt = returnEndAt ? new Date(returnEndAt) : null;

    // rentalDays (optional)
    if (rentalDays !== undefined) {

      const rdNum = rentalDays === null || rentalDays === "" ? NaN : Number(rentalDays);
      upd.rentalDays = Number.isFinite(rdNum) && rdNum > 0 ? Math.max(1, Math.round(rdNum)) : null;
    }

    const bookingChanged = pickupEndAt !== undefined || returnEndAt !== undefined || rentalDays !== undefined;

    if (bookingChanged) {
      upd.bookingUpdatedBy = req.user?.role === "admin" ? "admin" : String(req.user?._id ?? "system");
    }

    const nextStatus: OrderStatus = (upd.status ?? orderBefore.status) as OrderStatus;


    if (nextStatus === "canceled") {
      upd.pricing = null;
    } else if (bookingChanged || PRICED.has(nextStatus)) {
      const nextStart = pickupEndAt !== undefined ? safeDate(pickupEndAt) : safeDate((orderBefore as any).pickupEndAt);
      const nextEnd = returnEndAt !== undefined ? safeDate(returnEndAt) : safeDate((orderBefore as any).returnEndAt);

      const tmpOrder = {
        ...orderBefore,
        rentalDays: upd.rentalDays !== undefined ? upd.rentalDays : (orderBefore as any).rentalDays,
      };

      upd.pricing = await computePricing(tmpOrder, nextStatus, nextStart, nextEnd);
    }

    const order = await OrderModel.findByIdAndUpdate(req.params.id, upd, { new: true, runValidators: true }).lean();
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    const userId = order.createdBy ? String(order.createdBy) : null;

    if (userId && upd.status === "planning" && (orderBefore as any).status !== "planning") {
      const n = await NotificationModel.create({
        user: userId,
        title: "Choose your booking date",
        body: `Your order ${order.ref} is now in planning. Please pick a booking time in your profile.`,
        href: "/profile",
      });
      pushToUser(userId, { type: "notification", data: n });
    }

    if (userId && bookingChanged) {
      const n = await NotificationModel.create({
        user: userId,
        title: "Booking updated",
        body: `Booking for order ${order.ref} was updated. Please check your profile.`,
        href: "/profile",
      });
      pushToUser(userId, { type: "notification", data: n });
    }

    res.json({ success: true, data: order });
  } catch (err: any) {
    console.error("patchOrder error:", err);
    res.status(500).json({ success: false, message: err?.message || "Server error" });
  }
}
