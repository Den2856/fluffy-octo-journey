import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import type { User } from './UsersTable';

type Props = {
  users: User[];
  loading: boolean;
};

const COLORS = ['#ccd97f', '#9dfada', '#d5f6e5', '#bef264'];

const UsersByRoleChart: React.FC<Props> = ({ users, loading }) => {
  const data = useMemo(() => {
    const map = new Map<string, number>();

    for (const u of users) {
      const role = u.role || 'unknown';
      map.set(role, (map.get(role) ?? 0) + 1);
    }

    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [users]);

  const tooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const p = payload[0]?.payload;
    return (
      <div className="rounded-xl bg-d-ink px-3 py-2 text-[11px] text-d-sand300 shadow-md border border-black/5">
        <div className="font-semibold">{p?.name}</div>
        <div className="text-[10px] text-d-sand300/70">
          Users: <span className="text-d-sand300 font-semibold">{p?.value ?? 0}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-2xl bg-d-sand300 border border-black/5 shadow-sm p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-semibold text-d-ink">Users by role</h2>
          <p className="text-[11px] text-d-ink/60">
            Distribution of roles among all users
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-xs text-d-ink/60">
          Loading role distribution…
        </div>
      ) : !data.length ? (
        <div className="flex-1 flex items-center justify-center text-xs text-d-ink/60">
          No users to analyse.
        </div>
      ) : (
        <div className="flex-1 min-h-[260px] rounded-2xl bg-d-bg border border-black/5 p-3">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={84}
                innerRadius={44}
                dataKey="value"
                nameKey="name"
                paddingAngle={2}
              >
                {data.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={tooltip} />
              <Legend
                wrapperStyle={{ fontSize: 11 }}
                formatter={(value: any) => <span className="text-d-ink/60">{String(value)}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default UsersByRoleChart;
