import { CalendarDays, ChevronLeft, ChevronRight, ListTodo, Trash2 } from "lucide-react";
import type { CalendarType } from "../types";
import SchedulerTypeToggle from "./SchedulerTypeToggle";

type Props = {
  title: string;
  type: CalendarType;
  onTypeChange: (v: CalendarType) => void;
  onToday: () => void;
  onPrev: () => void;
  onNext: () => void;
  onOpenOrders?: () => void;
  viewLabel: string;
  onToggleView: () => void;
  trashArmed: boolean;
  showTrash?: boolean;
  showOrdersButton?: boolean;
};

function TrashIdle() {
  return (
    <div
      id="calendar-trash"
      className="h-9 rounded-xl px-3 text-[12px] font-semibold border grid place-items-center transition bg-red-500/15 text-red-200 border-red-500/25"
      title="Drag event here to remove"
    >
      <span className="inline-flex items-center gap-2">
        <Trash2 className="size-4" />
        Trash
      </span>
    </div>
  );
}

function TrashArmed() {
  return (
    <div
      id="calendar-trash"
      className="h-9 rounded-xl px-3 text-[12px] font-semibold border grid place-items-center transition bg-red-600 text-white border-red-500/40"
      title="Drag event here to remove"
    >
      <span className="inline-flex items-center gap-2">
        <Trash2 className="size-4" />
        Trash
      </span>
    </div>
  );
}

export default function SchedulerHeader({
  title,
  type,
  onTypeChange,
  onToday,
  onPrev,
  onNext,
  onOpenOrders,
  viewLabel,
  onToggleView,
  trashArmed,
  showTrash = true,
  showOrdersButton = true,
}: Props) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border-b border-white/10">
      <button
        type="button"
        onClick={onToday}
        className="h-9 rounded-xl px-3 text-[12px] font-semibold bg-white/5 text-white/75 hover:bg-white/10 border border-white/10"
      >
        Today
      </button>

      <button
        type="button"
        onClick={onPrev}
        className="h-9 w-9 rounded-xl grid place-items-center bg-white/5 hover:bg-white/10 border border-white/10"
        aria-label="Prev"
      >
        <ChevronLeft className="size-4 text-white/80" />
      </button>

      <button
        type="button"
        onClick={onNext}
        className="h-9 w-9 rounded-xl grid place-items-center bg-white/5 hover:bg-white/10 border border-white/10"
        aria-label="Next"
      >
        <ChevronRight className="size-4 text-white/80" />
      </button>

      <div className="ml-2 text-[16px] font-semibold text-white">{title}</div>

      <div className="ml-auto flex items-center gap-2">
        <div className="hidden md:flex">
          <SchedulerTypeToggle value={type} onChange={onTypeChange} />
        </div>

        {showTrash ? (trashArmed ? <TrashArmed /> : <TrashIdle />) : null}

        {showOrdersButton && onOpenOrders ? (
          <button
            type="button"
            onClick={onOpenOrders}
            className="h-9 rounded-xl px-3 text-[12px] font-semibold bg-white/5 text-white/75 hover:bg-white/10 border border-white/10"
          >
            <span className="inline-flex items-center gap-2">
              <ListTodo className="size-4" />
              Orders
            </span>
          </button>
        ) : null}

        <button
          type="button"
          onClick={onToggleView}
          className="h-9 rounded-xl px-3 text-[12px] font-semibold bg-white/5 text-white/75 hover:bg-white/10 border border-white/10"
        >
          <span className="inline-flex items-center gap-2">
            <CalendarDays className="size-4" />
            {viewLabel}
          </span>
        </button>
      </div>
    </div>
  );
}
