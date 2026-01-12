import React, { useCallback, useMemo, useState } from "react";
import VehicleSelect, { type CarOption } from "../ui/VehicleSelect";

type Status = "idle" | "loading" | "success" | "error";

function Spinner() {
  return (
    <div className="flex justify-center items-center">
      <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" />
      </svg>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <label htmlFor={htmlFor} className="text-[12px]">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function FeedbackForm() {
  const API_BASE = import.meta.env.VITE_API_URL || "";

  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [createdRef, setCreatedRef] = useState<string | null>(null);

  const disabled = status === "loading" || status === "success";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const fetchCars = useCallback(
    async (q: string): Promise<CarOption[]> => {
      const params = new URLSearchParams();
      params.set("limit", "12");
      params.set("mode", "card");
      if (q) params.set("q", q);

      const res = await fetch(`${API_BASE}/cars?${params.toString()}`, {
        credentials: "include",
      });
      const data = await res.json();
      return data.items ?? [];
    },
    [API_BASE]
  );

  const canSubmit = useMemo(() => {
    if (disabled) return false;
    return (
      name.trim().length > 1 &&
      email.trim().length > 3 &&
      !!vehicleId &&
      message.trim().length > 5
    );
  }, [name, email, vehicleId, message, disabled]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setStatus("loading");
    setError(null);
    setCreatedRef(null);

    try {
      const res = await fetch(`${API_BASE}/mail/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, vehicleId, subject, message }),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || "Request failed");
      }

      const payload = await res.json().catch(() => null);
      const ref = payload?.data?.ref || payload?.ref;
      console.log("Created ref:", ref);
      if (typeof ref === "string" && ref.trim()) setCreatedRef(ref);

      setStatus("success");
    } catch (err: any) {
      setStatus("error");
      setError(err?.message || "Something went wrong");
    }
  }

  return (
    <form onSubmit={onSubmit} className="h-full border border-white/10 bg-white/5 p-6 flex flex-col">
      <h3 className="text-[23px] text-white">
        <span className="text-primary">—</span> Send Your Query
      </h3>

      <div className="mt-6 flex flex-col gap-4 md:flex-row">
        <Field label="Name" htmlFor="name">
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="off"
            placeholder="James Smith"
            disabled={disabled}
            className="bg-dark-100 p-3 text-md border-b border-primary focus:outline-none focus:border-gray-600 disabled:opacity-60"
          />
        </Field>

        <Field label="Email" htmlFor="email">
          <input
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jamesmt@gmail.com"
            disabled={disabled}
            className="bg-dark-100 p-3 text-md border-b border-primary focus:outline-none focus:border-gray-600 disabled:opacity-60"
          />
        </Field>
      </div>

      <div className="mt-4">
        <VehicleSelect
          id="vehicle"
          label="Vehicle"
          placeholder="Start typing a car…"
          valueId={vehicleId}
          onChangeId={setVehicleId}
          fetchCars={fetchCars}
        />
      </div>

      <div className="mt-4">
        <Field label="Subject" htmlFor="subject">
          <input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            autoComplete="off"
            placeholder="Subject"
            disabled={disabled}
            className="bg-dark-100 p-3 text-md border-b border-primary focus:outline-none focus:border-gray-600 disabled:opacity-60"
          />
        </Field>
      </div>

      <div className="mt-4 flex-1">
        <Field label="Message" htmlFor="message">
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            autoComplete="off"
            placeholder="Write your message…"
            disabled={disabled}
            className="bg-dark-100 p-3 text-md border-b border-primary focus:outline-none focus:border-gray-600 disabled:opacity-60 min-h-40 w-full resize-none"
          />
        </Field>
      </div>

      {status === "success" && (
        <div className="mt-4 text-sm text-emerald-300">
          Mail sended. Order created {createdRef ? `Order ref: ${createdRef}` : ""}
        </div>
      )}

      {status === "error" && error && (
        <div className="mt-4 text-sm text-red-400">{error}</div>
      )}

      <div className="mt-6 flex justify-center">
        <button
          type="submit"
          disabled={!canSubmit || status === "loading" || status === "success"}
          className="h-11 w-full border border-white/10 bg-dark-100 hover:bg-primary transition-colors duration-300 ease-in-out"
          aria-busy={status === "loading"}
        >
          {status === "loading" ? <Spinner /> : status === "success" ? "Thank you" : "Submit"}
        </button>
      </div>
    </form>
  );
}
