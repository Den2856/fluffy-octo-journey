import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import axios from "axios";

import KpiOrdersCards, { type OrderDoc as O1 } from "../../components/backend/orders/KpiOrdersCards";
import EarningsSummaryChart, { type OrderDoc as O2 } from "../../components/backend/orders/EarningsSummaryChart";
import RentStatusDonut, { type OrderDoc as O3 } from "../../components/backend/orders/RentStatusDonut";
import AdminSidebar from "../../components/layout/DashboardSidebar";
import OrdersTable from "../../components/backend/orders/OrdersTable";
import DashboardHeader from "../../components/layout/DashboardHeader";
import BookingsOverviewChart from "../../components/backend/orders/BookingsOverviewChart";

type OrderDoc = O1 & O2 & O3;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderDoc[]>([]);
  const [loading, setLoading] = useState(true);

  const [totalCars, setTotalCars] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const r = await axios.get(`/orders?withPrice=1&page=1&limit=500`);
        if (!cancelled) setOrders(r.data?.data?.items || []);
      } catch (e) {
        console.error(e);
        if (!cancelled) setOrders([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // если у тебя другой фильтр активных — поменяй query
        const r = await axios.get(`/cars?page=1&limit=500`);
        const items = r.data?.data?.items ?? r.data?.items ?? [];
        const n = Array.isArray(items) ? items.length : 0;
        if (!cancelled) setTotalCars(n);
      } catch (e) {
        console.error(e);
        if (!cancelled) setTotalCars(0);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="size-full bg-d-bg flex">
      <AdminSidebar />

      <main className="flex-1 flex flex-col min-h-screen">
        <div className="px-6 pt-4 pb-3">
          <DashboardHeader title="Dashboard" onSearchChange={() => {}} />

          <div className="space-y-6 pt-4">
            <div className="grid gap-4">
              <KpiOrdersCards orders={orders} loading={loading} range="week" totalCars={totalCars} />

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <EarningsSummaryChart orders={orders} loading={loading} />
                </div>
                <RentStatusDonut orders={orders} loading={loading} range="week" />
              </div>
              <BookingsOverviewChart />
            </div>

            <OrdersTable />
          </div>
        </div>

        <div className="px-6 pb-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
