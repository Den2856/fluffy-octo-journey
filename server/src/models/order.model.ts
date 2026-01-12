import { Schema, model, type InferSchemaType, Types } from "mongoose";

export const ORDER_STATUSES = ["pending", "planning", "planned", "canceled", "done"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

const pricingSchema = new Schema(
  {
    totalUsd: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    breakdown: {
      days: { type: Number, default: null },
      pricePerDay: { type: Number, default: null },
    },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    ref: { type: String, required: true, index: true },
    customer: { type: String, required: true, index: true },
    customerEmail: { type: String, required: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    requestedVehicle: { type: Schema.Types.ObjectId, ref: "Car", default: null },
    status: { type: String, enum: ORDER_STATUSES, default: "pending", index: true },
    date: { type: String, default: () => new Date().toISOString(), index: true },

    pickupAt: { type: Date, default: null },
    pickupEndAt: { type: Date, default: null },

    returnAt: { type: Date, default: null },
    returnEndAt: { type: Date, default: null },

    rentalDays: { type: Number, default: null },

    bookingUpdatedBy: { type: String, default: null },

    pricing: { type: pricingSchema, default: null },

    subject: { type: String, default: "" },
    message: { type: String, default: "" },
  },
  { timestamps: true }
);

export type OrderDoc = InferSchemaType<typeof orderSchema> & { _id: Types.ObjectId };
export const OrderModel = model("Order", orderSchema);
