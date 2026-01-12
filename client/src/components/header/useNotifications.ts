import { useEffect, useMemo, useRef, useState } from "react";
import { api, API_BASE } from "./api";

export type NotificationItem = {
  _id: string;
  type: "booking_ready" | "booking_changed" | "order_status" | "generic";
  title: string;
  body?: string;
  orderId?: string;
  readAt: string | null;
  createdAt?: string;
};

export function useNotifications(enabled: boolean, panelOpen: boolean) {

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);

  const esRef = useRef<EventSource | null>(null);

  const unreadBadge = useMemo(() => (unread > 99 ? "99+" : String(unread)), [unread]);

  async function fetchUnread() {
    if (!enabled) return;
    try {
      const r = await api.get("/notifications/unread-count");
      setUnread(Number(r.data?.data?.unread ?? 0));
    } catch {}
  }

  async function fetchList() {
    if (!enabled) return;
    setLoading(true);
    try {
      const r = await api.get("/notifications?limit=10");
      const arr = (r.data?.data?.items ?? []) as NotificationItem[];
      setItems(arr);
      setUnread(arr.filter((x) => !x.readAt).length);
    } catch {
      setItems([]);
      setUnread(0);
    } finally {
      setLoading(false);
    }
  }

  async function markAllRead() {
    if (!enabled) return;
    try {
      await api.patch("/notifications/read-all");
      await fetchList();
    } catch {}
  }

  async function markOneRead(id: string) {
    if (!enabled) return;
    try {
      await api.patch(`/notifications/${id}/read`);
      setItems((prev) => prev.map((n) => (n._id === id ? { ...n, readAt: new Date().toISOString() } : n)));
      setUnread((u) => Math.max(0, u - 1));
    } catch {}
  }

  useEffect(() => {
    if (!enabled) {
      setItems([]);
      setUnread(0);
      return;
    }
    void fetchUnread();
    const t = setInterval(() => void fetchUnread(), 15000);
    return () => clearInterval(t);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    if (!panelOpen) return;
    void fetchList();
  }, [enabled, panelOpen]);


  useEffect(() => {
    if (!enabled) return;

    const url = `${API_BASE.replace(/\/$/, "")}/notifications/stream`;

    try {
      const es = new EventSource(url, { withCredentials: true } as any);
      esRef.current = es;

      es.onmessage = () => {
        void fetchUnread();
        if (panelOpen) void fetchList();
      };

      es.onerror = () => {
      };
    } catch {}

    return () => {
      try {
        esRef.current?.close();
      } catch {}
      esRef.current = null;
    };
  }, [enabled, panelOpen]);

  return {
    loading,
    items,
    unread,
    unreadBadge,
    fetchUnread,
    fetchList,
    markAllRead,
    markOneRead,
  };
}
