import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import { LayoutDashboard, Package, Users, ChevronLeft, ChevronRight, CarFront, Calendar, } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || '/api/v1';

type Role = 'admin' | 'user' | 'visitor';

type MeResponse = {
  success: boolean;
  data: {
    _id: string;
    name: string;
    email: string;
    role: Role;
  };
};

type NavItem = {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: Role[];
  highlightActive?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    to: '#',
    icon: LayoutDashboard,
    roles: ['admin'],
    highlightActive: false,
  },
  {
    label: 'Orders',
    to: '/admin/orders',
    icon: Package,
    roles: ['admin'],
  },
  {
    label: 'Fleet',
    to: '/admin/fleet',
    icon: CarFront,
    roles: ['admin'],
  },
  {
    label: 'Calendar',
    to: '/admin/calendar',
    icon: Calendar,
    roles: ['admin'],
  },
  {
    label: 'Users',
    to: '/admin/users',
    icon: Users,
    roles: ['admin'],
  },
];

export default function AdminSidebar() {
  const [role, setRole] = useState<Role | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    axios.defaults.baseURL = API;
    axios.defaults.withCredentials = true;

    let cancelled = false;

    const stored = window.localStorage.getItem('adminSidebarCollapsed');
    if (stored === '1') setCollapsed(true);

    (async () => {
      try {
        const res = await axios.get<MeResponse>('/auth/me');
        if (!cancelled) setRole(res.data.data.role);
      } catch {}
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => { window.localStorage.setItem('adminSidebarCollapsed', collapsed ? '1' : '0'); }, [collapsed]);

  const items = NAV_ITEMS.filter((item) => {
    if (!role || !item.roles) return true;
    return item.roles.includes(role);
  });

  return (
    <aside className={`bg-d-sand300 border-r border-black/90 flex flex-col py-4 transition-all duration-200 ${ collapsed ? 'w-20' : 'w-56' }`}>
      <div className={`px-3 pb-6 flex items-center ${collapsed ? 'justify-center' : 'justify-between gap-2'}`}>
        <div className={`flex items-center gap-2 ${collapsed ? 'hidden' : ''}`}>
          <div className="h-8 w-8 rounded-lg bg-d-lime-700 flex items-center justify-center shadow-sm">
            <div className="flex gap-0.5">
              <span className="h-5 w-1.5 rounded-full bg-d-lime-950" />
              <span className="h-5 w-1.5 rounded-full bg-d-lime-900" />
              <span className="h-5 w-1.5 rounded-full bg-d-lime-800" />
            </div>
          </div>
          {!collapsed && (
            <span className="text-sm font-semibold text-d-ink tracking-tight">
              opt-rent
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="ml-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-d-bg border border-black/5 text-ink/60 hover:bg-d-bg/80 transition"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5 text-d-ink" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5 text-d-ink" />
          )}
        </button>
      </div>

      <nav className={`flex-1 ${collapsed ? 'px-1' : 'px-2'} space-y-1`}>
        {items.map((item) => (
          <NavItemLink key={item.to} item={item} collapsed={collapsed} />
        ))}
      </nav>
    </aside>
  );
}

function NavItemLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const { icon: Icon, label, to, highlightActive } = item;

  return (
    <NavLink
      to={to}
      title={collapsed ? label : undefined}
      className={({ isActive }) => {
        const base = 'flex items-center px-3 py-2 rounded-xl text-sm transition-colors';
        const activeStyles = 'bg-d-lime-900 text-d-ink font-medium shadow-sm';
        const inactiveStyles = 'text-ink/60 hover:bg-d-sand300';
        const justify = collapsed ? 'justify-center' : 'gap-3';
        const active = highlightActive === false ? false : isActive;
        
        return `${base} ${justify} ${active ? activeStyles : inactiveStyles}`;
      }}
    >
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-d-bg border border-black/5">
        <Icon className="h-3.5 w-3.5 text-d-ink" />
      </span>
      {!collapsed && <span className="truncate text-d-ink">{label}</span>}
    </NavLink>
  );
}
