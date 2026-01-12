import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Bell, Search, Settings, LogOut } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || '/api/v1';

type Role = 'admin' | 'user' | 'visitor';

type Me = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
};

type MeResponse = {
  success: boolean;
  data: { user: Me };
};

interface DashboardHeaderProps {
  title?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
}

const roleLabel: Record<Role, string> = {
  admin: 'Admin',
  user: 'User',
  visitor: 'Visitor',
};

function getInitials(name?: string) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '—';
  const first = parts[0]?.[0] ?? '';
  const second = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + second).toUpperCase();
}

export default function DashboardHeader({ title = 'Dashboard', searchPlaceholder = 'Search order, items…', onSearchChange, }: DashboardHeaderProps) {
  const [me, setMe] = useState<MeResponse["data"]["user"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  useEffect(() => {
    axios.defaults.baseURL = API;
    axios.defaults.withCredentials = true;
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const r = await axios.get<MeResponse>('/auth/me');
        if (!cancelled) setMe(r.data?.data?.user ?? null);
      } catch {
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    onSearchChange?.(q);
  }, [q, onSearchChange]);

  const initials = useMemo(() => getInitials(me?.name), [me?.name]);

  const handleLogout = async () => {
    try {
      await axios.post('/auth/logout');
    } catch {}
    window.location.href = '/login';
  };

  return (
    <header className="w-full">
      <div className="flex items-center justify-between gap-4 rounded-2xl bg-d-sand300 px-4 py-3 sm:px-6 shadow-sm border border-black/5">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-2xl font-semibold text-d-ink truncate">
            {title}
          </h1>
        </div>

        <div className="flex-1 max-w-xl hidden md:flex">
          <label className="flex w-full items-center gap-2 rounded-full bg-d-bg px-3 py-2 border border-black/5 shadow-inner">
            <Search className="h-4 w-4 text-d-ink/60" />
            <input
              className="w-full bg-transparent text-sm text-d-ink placeholder:text-d-ink/60 focus:outline-none"
              placeholder={searchPlaceholder}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </label>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-d-bg border border-black/5 hover:bg-d-bg/80 transition"
            aria-label="Settings"
          >
            <Settings className="h-4 w-4 text-d-ink" />
          </button>

          <button
            type="button"
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-d-bg border border-black/5 hover:bg-d-bg/80 transition"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4 text-d-ink" />
          </button>

          <div className="flex items-center gap-2 sm:gap-3 rounded-full bg-d-sand300 px-2 py-1.5 sm:px-3 border border-black/5">
            <div className="h-8 w-8 rounded-full bg-d-lime-700 text-d-ink flex items-center justify-center text-xs font-semibold">
              {initials}
            </div>

            <div className="hidden sm:flex flex-col">
              <span className="text-xs font-medium text-d-ink">
                {loading ? 'Loading…' : me?.name || '—'}
              </span>
              <span className="text-[10px] text-d-ink/60">
                {me ? roleLabel[me.role] : ''}
              </span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="ml-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-d-bg border border-black/5 hover:bg-d-bg/80 transition"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="h-3.5 w-3.5 text-d-ink" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
