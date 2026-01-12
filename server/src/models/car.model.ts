import { Schema, model } from "mongoose";
import { Double } from "mongodb";

const CarSchema = new Schema(
  {
    make: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    trim: { type: String, default: "", trim: true },
    type: { type: String, default: "", trim: true },

    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },

    badge: { type: String, default: "" },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    pricePerDay: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "EUR" },

    thumbnailUrl: { type: String, required: false, default: "" },
    gallery: [
      {
        url: { type: String, required: false, default: "" },
        alt: { type: String, default: "" }
      }
    ],

    chips: {
      seats: { type: Number, default: 2 },
      horsepower: { type: Number, default: 0 },
      transmission: { type: String, default: "Automatic" },
      fuel: { type: String, default: "Gas" }
    },

    specs: {
      acceleration0to100Sec: { type: Double, default: 0 },
      drivetrain: { type: String, default: "RWD" },
      transmissionDetail: { type: String, default: "" },
      engine: { type: String, default: "" }
    },

    overviewBlocks: [
      {
        title: { type: String, required: false },
        text: { type: String, required: false }
      }
    ]
  },
  { timestamps: true }
);

CarSchema.index({ isFeatured: 1, createdAt: -1 });

export const CarModel = model("Car", CarSchema);
