type Props = {
  loading: boolean;
};

export default function SchedulerLegend({ loading }: Props) {
  return (
    <div className="flex items-center gap-4 px-4 py-2 text-[12px] text-white/70 bg-black/10 border-b border-white/10">
      <span className="inline-flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-sky-400" />
        Pickup
      </span>

      <span className="inline-flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-primary" />
        Return
      </span>

      <span className="ml-auto text-white/45">{loading ? "Loading…" : ""}</span>
    </div>
  );
}
