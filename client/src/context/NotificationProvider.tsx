import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "./AuthProvider";

export type NotificationType =
  | "booking_ready"
  | "booking_changed"
  | "order_status"
  | "generic";

export type AppNotification = {
  _id: string;
  type: NotificationType;
  title: string;
  body?: string;
  orderId?: string;
  createdAt: string;
  readAt?: string | null;
};

type Ctx = {
  items: AppNotification[];
  unread: number;
  refresh: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  pushLocal: (n: AppNotification) => void;
};

const NotificationsContext = createContext<Ctx | null>(null);

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}

function uniqById(arr: AppNotification[]) {
  const map = new Map<string, AppNotification>();
  for (const n of arr) map.set(n._id, n);
  return Array.from(map.values()).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export default function NotificationsProvider({ children, }: { children: React.ReactNode; }) {

  const { user } = useAuth() as { user: any | null };
  const API_BASE = import.meta.env.VITE_API_URL || "";

  const [items, setItems] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);

  const esRef = useRef<EventSource | null>(null);
  const pollRef = useRef<number | null>(null);

  const refresh = async () => {
    if (!user) return;

    const [listRes, countRes] = await Promise.all([
      fetch(`${API_BASE}/notifications?limit=25`, { credentials: "include" }),
      fetch(`${API_BASE}/notifications/unread-count`, { credentials: "include" }),
    ]);

    if (listRes.ok) {
      const json = await listRes.json().catch(() => null);
      const next: AppNotification[] = json?.data?.items ?? json?.items ?? [];
      setItems((prev) => uniqById([...next, ...prev]));
    }

    if (countRes.ok) {
      const json = await countRes.json().catch(() => null);
      const c = Number(json?.data?.unread ?? json?.unread ?? 0);
      if (!Number.isNaN(c)) setUnread(c);
    }
  };

  const pushLocal = (n: AppNotification) => {
    setItems((prev) => uniqById([n, ...prev]));
    setUnread((u) => u + (n.readAt ? 0 : 1));
  };

  const markRead = async (id: string) => {
    if (!user) return;
    await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: "PATCH",
      credentials: "include",
    }).catch(() => {});

    setItems((prev) =>
      prev.map((n) => (n._id === id ? { ...n, readAt: n.readAt || new Date().toISOString() } : n))
    );
    setUnread((u) => Math.max(0, u - 1));
  };

  const markAllRead = async () => {
    if (!user) return;
    await fetch(`${API_BASE}/notifications/read-all`, {
      method: "PATCH",
      credentials: "include",
    }).catch(() => {});

    setItems((prev) => prev.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() })));
    setUnread(0);
  };

  useEffect(() => {
    if (!user) {
      setItems([]);
      setUnread(0);
      try {
        esRef.current?.close();
      } catch {}
      esRef.current = null;
      if (pollRef.current) window.clearInterval(pollRef.current);
      pollRef.current = null;
      return;
    }

    void refresh();

    try {
      const es = new EventSource(`${API_BASE}/notifications/stream`, {
        withCredentials: true,
      } as any);

      es.onmessage = (ev) => {
        if (!ev?.data) return;
        if (ev.data === "ping") return;
        const data = JSON.parse(ev.data);
        if (data?._id) pushLocal(data);
      };

      es.onerror = () => {
        try {
          es.close();
        } catch {}
        esRef.current = null;

        if (!pollRef.current) {
          pollRef.current = window.setInterval(() => void refresh(), 15000);
        }
      };

      esRef.current = es;
    } catch {
    
      if (!pollRef.current) {
        pollRef.current = window.setInterval(() => void refresh(), 15000);
      }
    }

    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);

    return () => {
      window.removeEventListener("focus", onFocus);
      try {
        esRef.current?.close();
      } catch {}
      esRef.current = null;

      if (pollRef.current) window.clearInterval(pollRef.current);
      pollRef.current = null;
    };
  }, [user?.email]);

  const value = useMemo<Ctx>(
    () => ({ items, unread, refresh, markRead, markAllRead, pushLocal }),
    [items, unread]
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}
