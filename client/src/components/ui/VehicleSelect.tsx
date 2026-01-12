import { useEffect, useState } from "react";
import { Combobox } from "@headlessui/react";

export type CarOption = {
  _id: string;
  make?: string;
  model?: string;
  trim?: string;
  slug?: string;
  pricePerDay?: number;
  currency?: string;
};

type Props = {
  id?: string;
  label?: string;
  placeholder?: string;
  valueId: string | null;
  onChangeId: (id: string | null) => void;
  fetchCars: (q: string) => Promise<CarOption[]>;
};

export default function VehicleSelect({
  id = "vehicle",
  label = "Vehicle",
  placeholder = "Start typing a car…",
  valueId,
  onChangeId,
  fetchCars,
}: Props) {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<CarOption[]>([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<CarOption | null>(null);

  useEffect(() => {
    if (!valueId) setSelected(null);
  }, [valueId]);

  const titleOf = (c: CarOption | null) => {
    if (!c) return "";
    const name = [c.make, c.model, c.trim].filter(Boolean).join(" ");
    return name || "Car";
  };

  useEffect(() => {
    let alive = true;

    const t = setTimeout(async () => {
      const res = await fetchCars(query.trim());
      if (alive) setItems(res ?? []);
    }, 250);

    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [query, fetchCars]);

  return (
    <div className="flex flex-col gap-1 w-full">
      <label htmlFor={id} className="text-[12px]">
        {label}
      </label>

      <Combobox
        value={selected}
        onChange={(c: CarOption | null) => {
          setSelected(c);
          onChangeId(c?._id ?? null);
        }}
      >
        <div className="relative">
          <Combobox.Input
            id={id}
            placeholder={placeholder}
            className="w-full bg-dark-100  p-3 text-md border-b border-primary focus:outline-none focus:border-gray-600"
            displayValue={(c: CarOption) => titleOf(c)}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 120)}
            autoComplete="off"
          />

          {open && (
            <Combobox.Options className="absolute z-50 mt-2 w-full overflow-hidden rounded-md border border-white/10 bg-dark-100 shadow-xl">
              {items.length === 0 ? (
                <div className="px-3 py-2 text-sm text-white/60">
                  Nothing found
                </div>
              ) : (
                items.map((c) => (
                  <Combobox.Option
                    key={c._id}
                    value={c}
                    className={({ active }) =>
                      [
                        "cursor-pointer px-3 py-2 text-sm border-b border-white/5 last:border-b-0",
                        active ? "bg-white/10" : "bg-transparent",
                      ].join(" ")
                    }
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate text-white">
                        {[c.make, c.model, c.trim].filter(Boolean).join(" ") || "Car"}
                      </span>
                      {typeof c.pricePerDay === "number" && (
                        <span className="shrink-0 text-white/60">
                          {c.currency ?? "$"}{c.pricePerDay}/day
                        </span>
                      )}
                    </div>
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          )}
        </div>
      </Combobox>
    </div>
  );
}
