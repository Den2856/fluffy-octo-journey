import React, { useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, } from 'recharts';
import type { User } from './UsersTable';

type Props = {
  users: User[];
  loading: boolean;
};

type ActivityPoint = {
  date: string;
  newUsers: number;
  activeUsers: number;
};

const DAYS = 21;

const UserActivityChart: React.FC<Props> = ({ users, loading }) => {
  const data = useMemo<ActivityPoint[]>(() => {
    if (!users.length) return [];

    const map = new Map<string, ActivityPoint>();

    const today = new Date();
    for (let i = DAYS - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10);

      map.set(key, {
        date: key.slice(5),
        newUsers: 0,
        activeUsers: 0,
      });
    }

    for (const u of users) {
      if (u.createdAt) {
        const key = u.createdAt.slice(0, 10);
        const bucket = map.get(key);
        if (bucket) bucket.newUsers += 1;
      }

      if (u.lastLoginAt) {
        const key = u.lastLoginAt.slice(0, 10);
        const bucket = map.get(key);
        if (bucket) bucket.activeUsers += 1;
      }
    }

    return Array.from(map.values());
  }, [users]);

  const tooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;

    const newUsers = payload.find((p: any) => p.dataKey === 'newUsers')?.value ?? 0;
    const activeUsers = payload.find((p: any) => p.dataKey === 'activeUsers')?.value ?? 0;

    return (
      <div className="rounded-xl bg-d-ink px-3 py-2 text-[11px] text-d-sand300 shadow-md border border-black/5">
        <div className="text-[10px] text-d-sand300/70">Day: <span className="text-d-sand300">{label}</span></div>
        <div className="mt-1 grid gap-0.5">
          <div className="flex items-center justify-between gap-6">
            <span className="text-d-sand300/80">New users</span>
            <span className="font-semibold text-d-sand300">{newUsers}</span>
          </div>
          <div className="flex items-center justify-between gap-6">
            <span className="text-d-sand300/80">Active users</span>
            <span className="font-semibold text-d-sand300">{activeUsers}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-2xl bg-d-sand300 border border-black/5 shadow-sm p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-semibold text-d-ink">User activity</h2>
          <p className="text-[11px] text-d-ink/60">
            New vs active users for the last {DAYS} days
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-xs text-d-ink/60">
          Loading activity…
        </div>
      ) : !data.length ? (
        <div className="flex-1 flex items-center justify-center text-xs text-d-ink/60">
          Not enough data to build activity chart.
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Line chart */}
          <div className="min-h-[220px] rounded-2xl bg-d-bg border border-black/5 p-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ece7e4" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9e9694' }} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9e9694' }} tickLine={false} axisLine={false} />
                <Tooltip content={tooltip} cursor={{ stroke: '#ccd97f', strokeWidth: 1 }} />
                <Legend
                  wrapperStyle={{ fontSize: 11 }}
                  formatter={(value: any) => <span className="text-d-ink/60">{String(value)}</span>}
                />
                <Line
                  type="monotone"
                  dataKey="newUsers"
                  name="New users"
                  stroke="#ddffc2"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="activeUsers"
                  name="Active users"
                  stroke="#d5f6e5"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Bar chart */}
          <div className="min-h-[220px] rounded-2xl bg-d-bg border border-black/5 p-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ece7e4" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9e9694' }} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9e9694' }} tickLine={false} axisLine={false} />
                <Tooltip content={tooltip} cursor={{ fill: 'transparent' }} />
                <Legend
                  wrapperStyle={{ fontSize: 11 }}
                  formatter={(value: any) => <span className="text-d-ink/60">{String(value)}</span>}
                />
                <Bar dataKey="newUsers" name="New users" fill="#d5f6e5" radius={[6, 6, 0, 0]} />
                <Bar dataKey="activeUsers" name="Active users" fill="#ddffc2" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserActivityChart;
