import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

type ActiveKey = "type" | "price" | "seats" | null;

export type CarsFiltersValue = {
  type?: string;
  seats?: number;
  priceSort?: "pricePerDay:asc" | "pricePerDay:desc";
};

type Props = {
  title?: string;
  typeOptions: string[];
  seatOptions: number[];
  value: CarsFiltersValue;
  onChange: (next: CarsFiltersValue) => void;
  className?: string;
};

export default function CarsFilter({
  title = "All Our Cars",
  typeOptions,
  seatOptions,
  value,
  onChange,
  className = "",
}: Props) {
  const [open, setOpen] = useState<ActiveKey>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

const appliedKey: ActiveKey = value.type
  ? "type"
  : value.priceSort
    ? "price"
    : value.seats
      ? "seats"
      : null;

const leftTitle = useMemo(() => {

  if (open === "type") return "Filter By Type";
  if (open === "price") return "Sort By Price";
  if (open === "seats") return "Filter By Seats";


  if (appliedKey === "type") return value.type ?? title;

  if (appliedKey === "seats") return value.seats ? `${value.seats} Seats` : title;

  if (appliedKey === "price") {
    if (value.priceSort === "pricePerDay:asc") return "Low to High";
    if (value.priceSort === "pricePerDay:desc") return "High to Low";
    return title;
  }

  return title;
}, [open, appliedKey, value.type, value.seats, value.priceSort, title]);

  const applyExclusive = (next: CarsFiltersValue) => {
    onChange(next);
  };

  const Button = ({
    label,
    isOpen,
    selected,
    onClick,
  }: {
    label: string;
    isOpen: boolean;
    selected: boolean;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={isOpen}
      className={[
        "relative inline-flex items-center justify-between gap-2",
        "h-10 px-4",
        "w-full sm:w-auto min-w-[180px]",
        "bg-dark-200 text-white/90",
        "shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset]",
        "transition",
        "hover:border-white/20",
        selected ? "text-white" : "",
        "after:content-[''] after:absolute after:left-0 after:right-0 after:bottom-0 after:h-[2px] after:bg-primary",
      ].join(" ")}
    >
      <span className="text-[12px] md:text-[13px] font-medium">{label}</span>
      <ChevronDown
        className={[
          "h-4 w-4 text-primary transition-transform duration-200",
          isOpen ? "rotate-180" : "rotate-0",
        ].join(" ")}
      />
    </button>
  );

  const Dropdown = ({
    children,
    open,
    align = "right",
  }: {
    children: React.ReactNode;
    open: boolean;
    align?: "left" | "right";
  }) => {
    if (!open) return null;

    const smAlign = align === "right" ? "sm:right-0 sm:left-auto" : "sm:left-0 sm:right-auto";

    return (
      <div
        className={[
          "absolute top-[calc(100%+8px)] z-50",
          "left-0 right-0",
          smAlign,
          "sm:min-w-[220px] sm:w-[220px]",
          "bg-dark-200",
          "border border-white/10",
          "shadow-xl",
          "p-2",
        ].join(" ")}
      >
        {children}
      </div>
    );
  };

  const Item = ({
    active,
    children,
    onClick,
  }: {
    active?: boolean;
    children: React.ReactNode;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full text-left px-3 py-2",
        "text-[12px] md:text-[13px]",
        "transition",
        active ? "bg-white/10 text-white" : "text-white/80 hover:bg-white/5 hover:text-white",
      ].join(" ")}
    >
      {children}
    </button>
  );

  return (
    <div
      ref={wrapRef}
      className={[
        "w-full",
        "flex flex-col gap-4",
        "lg:flex-row lg:items-center lg:justify-between",
        className,
      ].join(" ")}
    >
      <div className="flex items-center gap-3">
        <span className="inline-block h-[2px] w-6 bg-primary" />
        <h2 className="text-white text-2xl md:text-3xl font-medium tracking-tight">
          {leftTitle}
        </h2>
      </div>


      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3 sm:w-auto">
        {/* TYPE */}
        <div className="relative">
          <Button
            label="Filter By Type"
            isOpen={open === "type"}
            selected={appliedKey === "type"}
            onClick={() => setOpen((k) => (k === "type" ? null : "type"))}
          />
          <Dropdown open={open === "type"} align="right">
            <Item
              active={!value.type && appliedKey === null}
              onClick={() => {
                applyExclusive({});
                setOpen(null);
              }}
            >
              All types
            </Item>
            <div className="my-1 h-px bg-white/10" />
            {typeOptions.map((t) => (
              <Item
                key={t}
                active={value.type?.toLowerCase() === t.toLowerCase()}
                onClick={() => {
                  applyExclusive({ type: t });
                  setOpen(null);
                }}
              >
                {t}
              </Item>
            ))}
          </Dropdown>
        </div>

        {/* PRICE */}
        <div className="relative">
          <Button
            label="Sort By Price"
            isOpen={open === "price"}
            selected={appliedKey === "price"}
            onClick={() => setOpen((k) => (k === "price" ? null : "price"))}
          />
          <Dropdown open={open === "price"} align="right">
            <Item
              active={!value.priceSort && appliedKey === null}
              onClick={() => {
                applyExclusive({});
                setOpen(null);
              }}
            >
              Default
            </Item>
            <div className="my-1 h-px bg-white/10" />
            <Item
              active={value.priceSort === "pricePerDay:asc"}
              onClick={() => {
                applyExclusive({ priceSort: "pricePerDay:asc" });
                setOpen(null);
              }}
            >
              Low → High
            </Item>
            <Item
              active={value.priceSort === "pricePerDay:desc"}
              onClick={() => {
                applyExclusive({ priceSort: "pricePerDay:desc" });
                setOpen(null);
              }}
            >
              High → Low
            </Item>
          </Dropdown>
        </div>

        {/* SEATS */}
        <div className="relative">
          <Button
            label="Filter By Seats"
            isOpen={open === "seats"}
            selected={appliedKey === "seats"}
            onClick={() => setOpen((k) => (k === "seats" ? null : "seats"))}
          />
          <Dropdown open={open === "seats"} align="right">
            <Item
              active={!value.seats && appliedKey === null}
              onClick={() => {
                applyExclusive({});
                setOpen(null);
              }}
            >
              Any seats
            </Item>
            <div className="my-1 h-px bg-white/10" />
            {seatOptions.map((s) => (
              <Item
                key={s}
                active={value.seats === s}
                onClick={() => {
                  applyExclusive({ seats: s });
                  setOpen(null);
                }}
              >
                {s} seats
              </Item>
            ))}
          </Dropdown>
        </div>
      </div>
    </div>
  );
}
