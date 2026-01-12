export type CalendarType = "all" | "pickup" | "return";

export type CalendarEvent = {
  id: string;
  orderId: string;
  type: "pickup" | "return";
  start: string;
  end: string;
  title: string;
  customer: string;
  ref: string;
  status: string;
  vehicleId: string | null;
  thumbnailUrl: string | null;
};

export type OrderLite = {
  _id: string;
  ref: string;
  customer: string;
  status: string;
  pickupAt: string | null;
  returnAt: string | null;
};

