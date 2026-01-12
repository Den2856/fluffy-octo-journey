import { Schema, model } from "mongoose";

const NotificationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: ["booking_ready", "booking_changed", "order_status", "generic"],
      default: "booking_changed",
    },
    title: { type: String, required: true },
    body: { type: String },
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const NotificationModel = model("Notification", NotificationSchema);