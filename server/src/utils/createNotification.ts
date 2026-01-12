import { NotificationModel } from "../models/notification.model";
import { pushToUser } from "./notfyHub";

export async function createNotification(input: {
  userId: string;
  type: "booking_ready" | "booking_changed" | "order_status" | "generic";
  title: string;
  body?: string;
  orderId?: string;
}) {
  const doc = await NotificationModel.create({
    user: input.userId,
    type: input.type,
    title: input.title,
    body: input.body,
    orderId: input.orderId,
  });

  // push realtime
  pushToUser(String(input.userId), {
    _id: String(doc._id),
    type: doc.type,
    title: doc.title,
    body: doc.body,
    orderId: doc.orderId ? String(doc.orderId) : undefined,
    createdAt: doc.createdAt.toISOString(),
    readAt: doc.readAt,
  });

  return doc;
}