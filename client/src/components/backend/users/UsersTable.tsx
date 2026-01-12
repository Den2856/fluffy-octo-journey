import React from 'react';

export type UserRole = 'admin' | 'visitor' | 'user' | string;
export type UserStatus = 'active' | 'invited' | 'blocked' | string;

export type User = {
  _id: string;
  name?: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt?: string;
  createdAt?: string;
};

type Props = {
  users: User[];
  loading: boolean;
  error: string | null;
};

const UsersTable: React.FC<Props> = ({ users, loading, error }) => {
  return (
    <div className="rounded-2xl bg-d-sand300 border border-black/5 shadow-sm">
      <div className="px-4 py-3 border-b border-black/5 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-d-ink">Users list</h2>
          <p className="text-[11px] text-d-ink/60">
            Manage accounts and monitor user activity
          </p>
        </div>
        <span className="text-[11px] text-d-ink/50">
          {users.length} users
        </span>
      </div>

      {error && (
        <div className="px-4 py-2 text-xs text-d-warn-100 bg-d-warn-50 border-b border-black/5">
          {error}
        </div>
      )}

      {loading ? (
        <div className="px-4 py-6 text-xs text-d-ink/60">Loading users…</div>
      ) : !users.length ? (
        <div className="px-4 py-6 text-xs text-d-ink/60">
          No users found. Invite or create new accounts from the admin panel.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead className="bg-d-bg">
              <tr>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Role</Th>
                <Th>Status</Th>
                <Th>Last activity</Th>
                <Th>Created</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-d-lime-800/5 transition-colors">
                  <Td>
                    <div className="font-medium text-d-ink">{u.name || '—'}</div>
                  </Td>
                  <Td>
                    <span className="text-d-ink font-medium">{u.email}</span>
                  </Td>
                  <Td>
                    <RoleBadge role={u.role} />
                  </Td>
                  <Td>
                    <StatusBadge status={u.status} />
                  </Td>
                  <Td>{formatDateTime(u.lastLoginAt)}</Td>
                  <Td>{formatDateTime(u.createdAt)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const Th: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-d-ink/60">
    {children}
  </th>
);

const Td: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <td className="px-4 py-2 align-middle text-[11px] text-d-ink/80">
    {children}
  </td>
);

const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
  const base =
    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-medium';
  switch (role) {
    case 'admin':
      return <span className={`${base} border-black/10 bg-d-lime-700 text-d-ink`}>Admin</span>;
    case 'user':
      return <span className={`${base} border-black/10 bg-d-lime-800 text-d-ink`}>User</span>;
    case 'visitor':
      return <span className={`${base} border-black/10 bg-d-lime-850 text-d-ink`}>Visitor</span>;
    default:
      return (
        <span className={`${base} border-black/10 bg-d-bg text-d-ink/60`}>
          {role || 'Unknown'}
        </span>
      );
  }
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const base = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium';
  switch (status) {
    case 'active':
      return <span className={`${base} bg-d-lime-900 text-d-ink`}>Active</span>;
    case 'invited':
      return <span className={`${base} bg-d-lime-700 text-d-ink`}>Invited</span>;
    case 'blocked':
      return <span className={`${base} bg-d-warn-50 text-d-warn-100`}>Blocked</span>;
    default:
      return <span className={`${base} bg-d-bg text-d-ink/60`}>{status || 'Unknown'}</span>;
  }
};

function formatDateTime(value?: string) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default UsersTable;
