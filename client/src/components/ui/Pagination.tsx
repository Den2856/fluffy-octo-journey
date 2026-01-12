import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type PageItem = number | "ellipsis";

function getPageItems(current: number, total: number): PageItem[] {
  const items: PageItem[] = [];
  if (total <= 7) {
    for (let i = 1; i <= total; i++) items.push(i);
    return items;
  }
  if (current <= 3) items.push(1, 2, 3, 4, "ellipsis", total);
  else if (current >= total - 2) items.push(1, "ellipsis", total - 3, total - 2, total - 1, total);
  else items.push(1, "ellipsis", current - 1, current, current + 1, "ellipsis", total);
  return items;
}

export type PaginationProps = {
  page: number;
  pages: number;
  loading?: boolean;
  onPageChange: (page: number) => void;

  className?: string;
  disabled?: boolean;
  variant?: "dark" | "light";
};

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export default function Pagination({
  page,
  pages,
  loading = false,
  disabled = false,
  onPageChange,
  className,
  variant = "dark",
}: PaginationProps) {
  const isDisabled = disabled || loading || pages <= 1;

  const pageItems = useMemo(() => getPageItems(page, pages), [page, pages]);

  const baseBtn =
    variant === "dark"
      ? "border border-white/10 bg-black/25 text-white"
      : "border border-black/10 bg-white text-black";

  const hoverBtn = variant === "dark" ? "hover:bg-red-700/70" : "hover:bg-black/5";

  const muted = variant === "dark" ? "text-white/60" : "text-black/50";

  const handle = (p: number) => {
    if (isDisabled) return;
    if (p < 1 || p > pages || p === page) return;
    onPageChange(p);
  };

  if (pages <= 1) return null;

  return (
    <nav className={cn("flex gap-1 text-[11px]", className)}>
      <button
        type="button"
        onClick={() => handle(page - 1)}
        disabled={isDisabled || page === 1}
        className={cn(
          "flex size-7 items-center justify-center rounded-[8px]",
          baseBtn,
          isDisabled || page === 1 ? "cursor-default opacity-50" : hoverBtn
        )}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>

      {pageItems.map((item, idx) =>
        item === "ellipsis" ? (
          <span key={`ellipsis-${idx}`} className={cn("px-2 flex items-center justify-center", muted)}>
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => handle(item)}
            disabled={isDisabled}
            className={cn(
              "flex size-7 items-center justify-center rounded-[8px] text-[11px] font-medium transition-colors duration-200",
              baseBtn,
              item === page
                ? variant === "dark"
                  ? "bg-red-700/70 text-white shadow-sm"
                  : "bg-black/10 text-black shadow-sm"
                : variant === "dark"
                  ? "text-white/75"
                  : "text-black/70",
              isDisabled ? "opacity-60" : hoverBtn
            )}
          >
            {item}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => handle(page + 1)}
        disabled={isDisabled || page === pages}
        className={cn(
          "flex size-7 items-center justify-center rounded-[8px]",
          baseBtn,
          isDisabled || page === pages ? "cursor-default opacity-50" : hoverBtn
        )}
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}
