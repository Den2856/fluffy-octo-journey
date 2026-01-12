
export type Order = {
  _id: string;
  ref: string;
  customer?: string;
  date: string;
  status?: string;

  bookingStartAt?: string | null;
  bookingEndAt?: string | null;
  bookingUpdatedAt?: string | null;
  bookingUpdatedBy?: "admin" | "user" | null;

};

export type SortKey =
  | 'ref'
  | 'date'
  | 'customer'
  | 'vehicle'
  | 'price'
  | 'status';

export const API = import.meta.env.VITE_API_URL || '/api/v1';

