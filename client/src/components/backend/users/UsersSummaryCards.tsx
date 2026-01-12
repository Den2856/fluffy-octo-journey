import React from 'react';

export type UsersStats = {
  total: number;
  active: number;
  invited: number;
  blocked: number;
  online: number;
};

type Props = {
  stats: UsersStats;
  loading: boolean;
};

const cardBase =
  'flex flex-col justify-between rounded-2xl bg-d-sand300 border border-black/5 shadow-sm px-4 py-3';

const UsersSummaryCards: React.FC<Props> = ({ stats, loading }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <SummaryCard
        label="Total users"
        value={stats.total}
        description="All accounts in the system"
        accent="bg-d-lime-900"
        loading={loading}
      />
      <SummaryCard
        label="Active"
        value={stats.active}
        description="Currently active accounts"
        accent="bg-d-lime-800"
        loading={loading}
      />
      <SummaryCard
        label="Online (15 min)"
        value={stats.online}
        description="Recently active sessions"
        accent="bg-d-lime-700"
        loading={loading}
      />
      <SummaryCard
        label="Invited / Blocked"
        value={`${stats.invited} / ${stats.blocked}`}
        description="Pending vs blocked"
        accent="bg-d-lime-600"
        loading={loading}
      />
    </div>
  );
};

type CardProps = {
  label: string;
  value: number | string;
  description: string;
  accent: string;
  loading: boolean;
};

const SummaryCard: React.FC<CardProps> = ({
  label,
  value,
  description,
  accent,
  loading,
}) => {
  return (
    <div className={cardBase}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-d-ink/60">{label}</p>
          {loading ? (
            <div className="mt-2 h-6 w-20 rounded bg-d-bg border border-black/5 animate-pulse" />
          ) : (
            <p className="mt-1 text-xl font-semibold text-d-ink">{value}</p>
          )}
        </div>
        <div className={`h-9 w-9 rounded-full ${accent} opacity-90`} />
      </div>
      <p className="mt-2 text-[11px] text-d-ink/60">{description}</p>
    </div>
  );
};

export default UsersSummaryCards;
