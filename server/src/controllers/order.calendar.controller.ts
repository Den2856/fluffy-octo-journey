import type { Request, Response } from "express";
import { Types } from "mongoose";
import { OrderModel } from "../models/order.model";

type AuthedReq = Request & { user?: { _id: string; role?: string } };

type CalendarType = "all" | "pickup" | "return";

const DEFAULT_SLOT_MIN = 60;

function isValidDate(x: any) {
  const t = Date.parse(String(x));
  return Number.isFinite(t);
}
function toDate(x: any) {
  return new Date(Date.parse(String(x)));
}
function addMinutes(d: Date, min: number) {
  return new Date(d.getTime() + min * 60_000);
}
function overlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && bStart < aEnd;
}
function clampType(x: any): CalendarType {
  if (x === "pickup" || x === "return") return x;
  return "all";
}

function getVehicleTitle(v: any) {
  const make = (v?.make || "").toString().trim();
  const model = (v?.model || "").toString().trim();
  const title = (v?.title || v?.name || "").toString().trim();
  const out = (make + " " + model).trim();
  return out || title || "Vehicle";
}

function buildEvent(order: any, kind: "pickup" | "return") {
  const startKey = kind === "pickup" ? "pickupAt" : "returnAt";
  const endKey = kind === "pickup" ? "pickupEndAt" : "returnEndAt";

  const s: Date | null = order[startKey] ? new Date(order[startKey]) : null;
  if (!s) return null;

  const eRaw: Date | null = order[endKey] ? new Date(order[endKey]) : null;
  const e = eRaw && eRaw > s ? eRaw : addMinutes(s, DEFAULT_SLOT_MIN);

  const v = order.requestedVehicle;
  const title = getVehicleTitle(v);

  return {
    id: `${order._id}:${kind}`,
    orderId: String(order._id),
    type: kind, // pickup | return
    start: s.toISOString(),
    end: e.toISOString(),
    title,
    customer: order.customer || "",
    ref: order.ref || "",
    status: order.status || "",
    vehicleId: v?._id ? String(v._id) : (order.requestedVehicle ? String(order.requestedVehicle) : null),
    thumbnailUrl: v?.thumbnailUrl || null,
  };
}

/**
 * GET /orders/calendar?from=ISO&to=ISO&type=all|pickup|return&carId=...&q=...
 * Возвращает плоский список events (у order может быть 0..2 event)
 */
export async function getOrdersCalendar(req: AuthedReq, res: Response) {
  try {
    const fromQ = req.query.from;
    const toQ = req.query.to;

    if (!isValidDate(fromQ) || !isValidDate(toQ)) {
      res.status(400).json({ success: false, message: "from/to required (ISO date)" });
      return;
    }

    const from = toDate(fromQ);
    const to = toDate(toQ);
    if (!(from < to)) {
      res.status(400).json({ success: false, message: "`from` must be < `to`" });
      return;
    }

    const type = clampType(req.query.type);
    const q = String(req.query.q || "").trim();
    const carId = String(req.query.carId || "").trim();

    const query: any = {};

    // фильтр по авто
    if (carId && Types.ObjectId.isValid(carId)) {
      query.requestedVehicle = new Types.ObjectId(carId);
    }

    // Поиск (ref/customer/email)
    if (q) {
      query.$or = [
        { ref: { $regex: q, $options: "i" } },
        { customer: { $regex: q, $options: "i" } },
        { customerEmail: { $regex: q, $options: "i" } },
      ];
    }

    // В диапазон должны попадать pickup/return события
    // Условия (упрощённо): start внутри диапазона или end внутри диапазона или перекрывает диапазон
    const rangeOr: any[] = [];

    if (type === "all" || type === "pickup") {
      rangeOr.push(
        { pickupAt: { $gte: from, $lt: to } },
        { pickupEndAt: { $gt: from, $lte: to } },
        { pickupAt: { $lt: from }, pickupEndAt: { $gt: to } }
      );
    }

    if (type === "all" || type === "return") {
      rangeOr.push(
        { returnAt: { $gte: from, $lt: to } },
        { returnEndAt: { $gt: from, $lte: to } },
        { returnAt: { $lt: from }, returnEndAt: { $gt: to } }
      );
    }

    // если endAt null (старые записи), они могут не матчиться по endAt.
    // Поэтому добавим запасной матч по startAt в диапазоне (уже есть)
    query.$and = [{ $or: rangeOr }];

    const orders = await OrderModel.find(query)
      .populate("requestedVehicle", "make model title name thumbnailUrl")
      .sort({ pickupAt: 1, returnAt: 1 })
      .lean();

    const events: any[] = [];
    for (const o of orders) {
      if ((type === "all" || type === "pickup") && o.pickupAt) {
        const ev = buildEvent(o, "pickup");
        if (ev) events.push(ev);
      }
      if ((type === "all" || type === "return") && o.returnAt) {
        const ev = buildEvent(o, "return");
        if (ev) events.push(ev);
      }
    }

    res.json({ success: true, data: { items: events } });
  } catch (err: any) {
    console.error("getOrdersCalendar error:", err);
    res.status(500).json({ success: false, message: err?.message || "Server error" });
  }
}

/**
 * PATCH /orders/:id/schedule
 * body: { type: "pickup"|"return", start: ISO, end: ISO }
 * Обновляет тайм-слот и проверяет конфликты по машине (опционально)
 */
export async function patchOrderSchedule(req: AuthedReq, res: Response) {
  try {
    const { id } = req.params;
    const kind = String(req.body?.type || "");
    const startRaw = req.body?.start;
    const endRaw = req.body?.end;

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: "Bad order id" });
      return;
    }
    if (kind !== "pickup" && kind !== "return") {
      res.status(400).json({ success: false, message: "type must be pickup|return" });
      return;
    }

    // ✅ CLEAR MODE: start/end null -> remove event from calendar
    const clearMode = startRaw === null || endRaw === null;

    if (clearMode) {
      const update: any = {};
      if (kind === "pickup") {
        update.pickupAt = null;
        update.pickupEndAt = null;
      } else {
        update.returnAt = null;
        update.returnEndAt = null;
      }

      const saved = await OrderModel.findByIdAndUpdate(id, update, { new: true })
        .populate("requestedVehicle", "make model title name thumbnailUrl")
        .lean();

      res.json({ success: true, data: { order: saved } });
      return;
    }

    // ---- normal mode (set dates) ----
    if (!isValidDate(startRaw) || !isValidDate(endRaw)) {
      res.status(400).json({ success: false, message: "start/end must be ISO date" });
      return;
    }

    const start = toDate(startRaw);
    const end = toDate(endRaw);
    if (!(start < end)) {
      res.status(400).json({ success: false, message: "end must be > start" });
      return;
    }

    const order = await OrderModel.findById(id).lean();
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    const carId = order.requestedVehicle ? String(order.requestedVehicle) : "";
    const checkConflicts = String(req.query?.conflicts ?? "1") !== "0";

    if (checkConflicts && carId && Types.ObjectId.isValid(carId)) {
      const padFrom = new Date(start.getTime() - 24 * 60 * 60_000);
      const padTo = new Date(end.getTime() + 24 * 60 * 60_000);

      const others = await OrderModel.find({
        _id: { $ne: new Types.ObjectId(id) },
        requestedVehicle: new Types.ObjectId(carId),
        $or: [{ pickupAt: { $lt: padTo } }, { returnAt: { $lt: padTo } }],
      }).lean();

      for (const o of others) {
        const s =
          kind === "pickup"
            ? o.pickupAt ? new Date(o.pickupAt) : null
            : o.returnAt ? new Date(o.returnAt) : null;

        if (!s) continue;

        const eRaw =
          kind === "pickup"
            ? o.pickupEndAt ? new Date(o.pickupEndAt) : null
            : o.returnEndAt ? new Date(o.returnEndAt) : null;

        const e = eRaw && eRaw > s ? eRaw : addMinutes(s, DEFAULT_SLOT_MIN);

        if (overlap(start, end, s, e)) {
          res.status(409).json({
            success: false,
            message: "Time conflict with another order",
            conflict: { orderId: String(o._id), type: kind, start: s.toISOString(), end: e.toISOString() },
          });
          return;
        }
      }
    }

    const update: any = {};
    if (kind === "pickup") {
      update.pickupAt = start;
      update.pickupEndAt = end;
    } else {
      update.returnAt = start;
      update.returnEndAt = end;
    }

    const saved = await OrderModel.findByIdAndUpdate(id, update, { new: true })
      .populate("requestedVehicle", "make model title name thumbnailUrl")
      .lean();

    res.json({ success: true, data: { order: saved } });
  } catch (err: any) {
    console.error("patchOrderSchedule error:", err);
    res.status(500).json({ success: false, message: err?.message || "Server error" });
  }
}

export async function getMyCalendarEvents(req: AuthedReq, res: Response) {
  try {
    const uid = String((req.user as any)?._id ?? (req.user as any)?.id ?? "");

    if (!uid || !Types.ObjectId.isValid(uid)) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const fromQ = req.query.from;
    const toQ = req.query.to;

    if (!isValidDate(fromQ) || !isValidDate(toQ)) {
      res.status(400).json({ success: false, message: "from/to required (ISO date)" });
      return;
    }

    const from = toDate(fromQ);
    const to = toDate(toQ);
    if (!(from < to)) {
      res.status(400).json({ success: false, message: "`from` must be < `to`" });
      return;
    }

    const type = clampType(req.query.type);

    const query: any = {
      createdBy: new Types.ObjectId(uid),
    };

    const rangeOr: any[] = [];

    if (type === "all" || type === "pickup") {
      rangeOr.push(
        { pickupAt: { $gte: from, $lt: to } },
        { pickupEndAt: { $gt: from, $lte: to } },
        { pickupAt: { $lt: from }, pickupEndAt: { $gt: to } }
      );
    }

    if (type === "all" || type === "return") {
      rangeOr.push(
        { returnAt: { $gte: from, $lt: to } },
        { returnEndAt: { $gt: from, $lte: to } },
        { returnAt: { $lt: from }, returnEndAt: { $gt: to } }
      );
    }

    query.$and = [{ $or: rangeOr }];

    const orders = await OrderModel.find(query)
      .populate("requestedVehicle", "make model title name thumbnailUrl")
      .sort({ pickupAt: 1, returnAt: 1 })
      .lean();

    const events: any[] = [];
    for (const o of orders) {
      if ((type === "all" || type === "pickup") && o.pickupAt) {
        const ev = buildEvent(o, "pickup");
        if (ev) events.push(ev);
      }
      if ((type === "all" || type === "return") && o.returnAt) {
        const ev = buildEvent(o, "return");
        if (ev) events.push(ev);
      }
    }

    res.json({ success: true, data: { items: events } });
  } catch (err: any) {
    console.error("getMyCalendarEvents error:", err);
    res.status(500).json({ success: false, message: err?.message || "Server error" });
  }
}

