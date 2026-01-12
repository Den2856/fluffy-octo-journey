import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || '/api/v1';

axios.defaults.baseURL = API;
axios.defaults.withCredentials = true;

export type OrderStatus =
  | 'new'
  | 'planned'
  | 'in_transit'
  | 'delivered'
  | 'canceled';

export type GeoPoint = {
  type: 'Point';
  coordinates: [number, number];
};

export type PricingBreakdown = {
  baseFixed: number;
  distanceKm: number;
  distanceCost: number;
  serviceCost: number;
  priorityAdj: number;
  windowPenalty: number;
  overweightPenalty: number;
};

export type Pricing = {
  totalUsd: number;
  breakdown: PricingBreakdown;
};

export type Order = {
  _id: string;
  ref: string;
  customer?: string;
  address?: string;
  date: string;
  status: OrderStatus;

  pickupLocation?: GeoPoint | null;
  dropoffLocation?: GeoPoint | null;
  stops?: GeoPoint[];

  distanceKm?: number;
  serviceTimeMin?: number;
  demandKg?: number;
  demandM3?: number;

  assignedVehicle?: any;
  assignedDriver?: any;

  pricing?: Pricing;
};

type MyOrdersResponse = {
  success: boolean;
  data: {
    items: Order[];
  };
};

export function useMyOrdersRealtime(pollMs = 10000) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setError(null);
      const res = await axios.get<MyOrdersResponse>('/orders/my');
      setOrders(res.data.data.items || []);
      setLoading(false);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || 'Ошибка загрузки заказов');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();

    const id = window.setInterval(() => {
      fetchOrders();
    }, pollMs);

    return () => window.clearInterval(id);
  }, [fetchOrders, pollMs]);

  return { orders, loading, error, refresh: fetchOrders };
}
