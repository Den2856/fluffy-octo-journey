import type { CalendarType } from "../types";

type Props = {
  value: CalendarType;
  onChange: (v: CalendarType) => void;
  className?: string;
};

function ActiveTypeBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      className="h-9 rounded-xl px-4 text-[12px] font-semibold bg-red-600 text-white"
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function InactiveTypeBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      className="h-9 rounded-xl px-4 text-[12px] font-semibold bg-white/5 text-white/75 hover:bg-white/10 border border-white/10"
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function TypeBtn({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  if (active) return <ActiveTypeBtn label={label} onClick={onClick} />;
  return <InactiveTypeBtn label={label} onClick={onClick} />;
}

export default function SchedulerTypeToggle({ value, onChange, className }: Props) {
  return (
    <div className={className || ""}>
      <div className="flex items-center gap-2">
        <TypeBtn label="All" active={value === "all"} onClick={() => onChange("all")} />
        <TypeBtn label="Pickup" active={value === "pickup"} onClick={() => onChange("pickup")} />
        <TypeBtn label="Return" active={value === "return"} onClick={() => onChange("return")} />
      </div>
    </div>
  );
}
