import React, { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export const AUTH_COLORS = {
  bg: "#010101",
  dark200: "#0a0a0a",
  dark100: "#141414",
  primary: "#b81d1d",
};

export const AUTH_CLS = {
  input:
    "h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-white outline-none " +
    "placeholder:text-white/30 focus:border-white/20 focus:bg-white/7",

  btnPrimary: "h-12 rounded-2xl font-medium text-white shadow-lg disabled:opacity-60",

  btnSocial:
    "h-12 rounded-2xl border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 " +
    "flex items-center justify-center gap-2",

  error:
    "rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200",

  subtleCard: "rounded-2xl border border-white/10 bg-white/5 px-5 py-5 text-white/80",
};

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <label className="text-xs text-white/60">{label}</label>
        {hint ? <div className="text-xs text-white/45">{hint}</div> : null}
      </div>
      {children}
    </div>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={[AUTH_CLS.input, props.className].filter(Boolean).join(" ")} />;
}

export function PasswordInput({
  name,
  placeholder,
  required,
  autoComplete,
  className,
}: {
  name: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  className?: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        name={name}
        type={show ? "text" : "password"}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={[AUTH_CLS.input, "pr-12", className].filter(Boolean).join(" ")}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
        aria-label="Toggle password"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

export function PrimaryButton({
  children,
  loading,
}: {
  children: React.ReactNode;
  loading?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={Boolean(loading)}
      className={AUTH_CLS.btnPrimary}
      style={{
        background: `linear-gradient(180deg, ${AUTH_COLORS.primary}, rgba(184,29,29,.85))`,
        boxShadow: "0 18px 40px rgba(184,29,29,.20)",
      }}
    >
      {children}
    </button>
  );
}

export function Divider({ label }: { label: string }) {
  return (
    <div className="my-3 flex items-center gap-4">
      <div className="h-px flex-1 bg-white/10" />
      <div className="text-xs text-white/40">{label}</div>
      <div className="h-px flex-1 bg-white/10" />
    </div>
  );
}

export function ErrorBox({ text }: { text: string }) {
  return <div className={AUTH_CLS.error}>{text}</div>;
}

export function Checkbox({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: React.ReactNode;
}) {
  const id = useId();
  return (
    <label htmlFor={id} className="flex items-center gap-2 text-sm text-white/70 select-none">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-[var(--primary)]"
        style={{ ["--primary" as any]: AUTH_COLORS.primary }}
      />
      {children}
    </label>
  );
}

export function SocialButtons() {
  // UI only (без OAuth логики)
  return (
    <div className="grid grid-cols-1 gap-3">
      <button type="button" className={AUTH_CLS.btnSocial}>
        <GoogleIcon /> Google
      </button>
    </div>
  );
}

export function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 15.2 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4c-7.7 0-14.4 4.3-17.7 10.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.2C29.3 35.6 26.8 36 24 36c-5.3 0-9.7-3.4-11.3-8.1l-6.6 5.1C9.4 39.7 16.1 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.3 4.1-4.1 5.3l.1.1 6.3 5.2C40.6 36.1 44 31.4 44 24c0-1.3-.1-2.6-.4-3.9z"
      />
    </svg>
  );
}

