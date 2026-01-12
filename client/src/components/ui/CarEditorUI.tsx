import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

export function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export const inputCls =
  "w-full rounded-xl border border-white/10 bg-white/0 px-3 py-2 text-sm text-white/90 outline-none placeholder:text-white/40 focus:border-white/25";

export function SectionCard({
  title,
  right,
  children,
}: {
  title: string;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm font-semibold text-white">{title}</div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

export function TextField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="space-y-1">
      <div className="text-[12px] text-white/60">{label}</div>
      <input value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} placeholder={placeholder} />
    </label>
  );
}

export function NumberField({
  label,
  value,
  placeholder,
  onChangeValue,
}: {
  label: string;
  value: number | undefined;
  placeholder?: string;
  onChangeValue: (v: number | undefined) => void;
}) {
  return (
    <label className="space-y-1">
      <div className="text-[12px] text-white/60">{label}</div>
      <NumberInput value={value} placeholder={placeholder} onChangeValue={onChangeValue} mode="float" />
    </label>
  );
}

export function IntegerField({
  label,
  value,
  placeholder,
  onChangeValue,
}: {
  label: string;
  value: number | undefined;
  placeholder?: string;
  onChangeValue: (v: number | undefined) => void;
}) {
  return (
    <label className="space-y-1">
      <div className="text-[12px] text-white/60">{label}</div>
      <NumberInput value={value} placeholder={placeholder} onChangeValue={onChangeValue} mode="int" />
    </label>
  );
}

export function NumberInput({
  value,
  placeholder,
  onChangeValue,
  mode,
}: {
  value: number | undefined;
  placeholder?: string;
  onChangeValue: (v: number | undefined) => void;
  mode: "int" | "float";
}) {
  const [text, setText] = useState(value ?? "");
  const focusedRef = useRef(false);

  useEffect(() => {
    if (focusedRef.current) return;
    setText(value ?? "");
  }, [value]);

  const inputValue = typeof text === "number" ? String(text) : String(text ?? "");

  return (
    <input
      value={inputValue}
      onFocus={() => {
        focusedRef.current = true;
      }}
      onBlur={() => {
        focusedRef.current = false;

        const parsed = mode === "int" ? parseIntLoose(inputValue) : parseNumberLoose(inputValue);
        onChangeValue(parsed);

        setText(parsed ?? "");
      }}
      onChange={(e) => {
        const raw = e.target.value;
        setText(raw);

        if (raw.trim() === "") {
          onChangeValue(undefined);
          return;
        }

        const parsed = mode === "int" ? parseIntLoose(raw) : parseNumberLoose(raw);
        if (typeof parsed === "number") onChangeValue(parsed);
      }}
      className={inputCls}
      placeholder={placeholder}
      inputMode={mode === "float" ? "decimal" : "numeric"}
    />
  );
}

export function parseNumberLoose(raw: string): number | undefined {
  const t = String(raw || "").trim().replace(",", ".");
  if (!t || t === "-" || t === "." || t === "-.") return undefined;
  const n = Number(t);
  return Number.isFinite(n) ? n : undefined;
}

export function parseIntLoose(raw: string): number | undefined {
  const t = String(raw || "").trim();
  if (!t || t === "-") return undefined;
  // разрешаем "12,0" или "12.0" => 12
  const norm = t.replace(",", ".");
  const n = Number(norm);
  if (!Number.isFinite(n)) return undefined;
  return Math.trunc(n);
}

export function publicAssetUrl(path: string) {
  const p = String(path || "");
  if (!p) return p;
  if (/^https?:\/\//i.test(p) || p.startsWith("data:") || p.startsWith("blob:")) return p;

  const base = (import.meta as any)?.env?.BASE_URL ?? "/";
  const b = String(base).endsWith("/") ? String(base).slice(0, -1) : String(base);

  if (p.startsWith("/")) return `${b}${p}`;
  return `${b}/${p}`;
}

export function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={cn(
        "rounded-xl border px-3 py-2 text-xs transition",
        value
          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
          : "border-white/10 bg-white/0 text-white/70 hover:bg-white/5"
      )}
    >
      {label}: {value ? "ON" : "OFF"}
    </button>
  );
}
