import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Outlet } from 'react-router-dom';
import DashboardHeader from '../../components/layout/DashboardHeader';
import AdminSidebar from '../../components/layout/DashboardSidebar';
import UsersSummaryCards, { type UsersStats } from '../../components/backend/users/UsersSummaryCards';
import UserActivityChart from '../../components/backend/users/UserActivityChart';
import UsersByRoleChart from '../../components/backend/users/UsersByRoleChart';
import UsersTable, { type User } from '../../components/backend/users/UsersTable';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get<{ success: boolean; data: User[] }>('/users');
        setUsers(res.data.data);
      } catch (e: any) {
        console.error('Failed to load users', e?.response ?? e);
        setError('Failed to load users data');
      } finally {
        setLoading(false);
      }
    };

    void fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q),
    );
  }, [users, search]);

  const stats: UsersStats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === 'active').length;
    const invited = users.filter((u) => u.status === 'invited').length;
    const blocked = users.filter((u) => u.status === 'blocked').length;

    const now = Date.now();
    const FIFTEEN_MIN = 15 * 60 * 1000;
    const online = users.filter((u) => {
      if (!u.lastLoginAt) return false;
      const t = new Date(u.lastLoginAt).getTime();
      return now - t <= FIFTEEN_MIN;
    }).length;

    return { total, active, invited, blocked, online };
  }, [users]);

  return (
    <div className="size-full bg-d-bg flex text-d-ink">
      <AdminSidebar />

      <main className="flex-1 flex flex-col min-h-screen">
        <div className="px-6 pt-4 pb-3">
          <DashboardHeader
            title="Users"
            searchPlaceholder="Search users, emails…"
            onSearchChange={setSearch}
          />

          <div className="space-y-6 pt-4">
            <UsersSummaryCards stats={stats} loading={loading} />

            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)] gap-6">
              <UserActivityChart users={users} loading={loading} />
              <UsersByRoleChart users={users} loading={loading} />
            </div>

            <UsersTable
              users={filteredUsers}
              loading={loading}
              error={error}
            />
          </div>
        </div>

        <div className="px-6 pb-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
