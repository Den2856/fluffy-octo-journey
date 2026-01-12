import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Listbox } from "@headlessui/react";
import { Check, ChevronDown } from "lucide-react";

export interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  minWidthClass?: string;
  buttonClassName?: string;
  optionsClassName?: string;
}

export function Select({
  value,
  onChange,
  options,
  placeholder = "Select...",
  className = "",
  minWidthClass = "",
  buttonClassName = "",
  optionsClassName = "",
}: SelectProps) {
  const selectedOption = options.find((o) => o.value === value);

  const btnRef = useRef<HTMLButtonElement | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);

  const updatePos = () => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos({
      top: r.bottom + 6,
      left: r.left,
      width: r.width,
    });
  };

  return (
    <div className={`relative ${className} ${minWidthClass}`}>
      <Listbox value={value} onChange={onChange}>
        {({ open }) => {
          useEffect(() => {
            if (!open) return;

            updatePos();
            const onScroll = () => updatePos();
            const onResize = () => updatePos();

            window.addEventListener("scroll", onScroll, true);
            window.addEventListener("resize", onResize);

            return () => {
              window.removeEventListener("scroll", onScroll, true);
              window.removeEventListener("resize", onResize);
            };
          }, [open]);

          return (
            <>
              <Listbox.Button
                ref={btnRef}
                className={
                  "relative w-full rounded-full border border-black/10 px-3 py-2 text-left text-[11px] " +
                  "text-ink/80 shadow-sm outline-none focus:ring-1 focus:ring-d-lime-900 focus:border-d-lime-900 cursor-pointer " +
                  buttonClassName
                }
              >
                <span className="block truncate">
                  {selectedOption?.label ?? placeholder}
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronDown className="h-4 w-4 opacity-80" aria-hidden="true" />
                </span>
              </Listbox.Button>

              {open && pos
                ? createPortal(
                    <div
                      style={{
                        position: "fixed",
                        top: pos.top,
                        left: pos.left,
                        width: pos.width,
                        zIndex: 9999,
                      }}
                    >
                      <Listbox.Options
                        className={
                          "max-h-fit rounded-2xl py-1 text-[11px] shadow-lg ring-1 ring-black/10 focus:outline-none " +
                          optionsClassName
                        }
                      >
                        {options.map((option) => (
                          <Listbox.Option
                            key={option.value === "" ? "__empty__" : option.value}
                            value={option.value}
                            className={({ active }) =>
                              "relative cursor-pointer select-none py-2 px-4 pl-7 " +
                              (active ? "bg-d-lime-800/20 text-ink" : "text-ink/80")
                            }
                          >
                            {({ selected }) => (
                              <>
                                <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                                  {option.label}
                                </span>

                                {selected ? (
                                  <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-ink/80">
                                    <Check className="h-4 w-4" aria-hidden="true" />
                                  </span>
                                ) : null}
                              </>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </div>,
                    document.body
                  )
                : null}
            </>
          );
        }}
      </Listbox>
    </div>
  );
}
