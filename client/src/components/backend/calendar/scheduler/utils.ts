export function fmtMonthYear(d: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(d);
}

export function fmtDayHeader(d: Date) {
  const num = new Intl.DateTimeFormat("en-US", { day: "2-digit" }).format(d);
  const wd = new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(d);
  return { num, wd };
}

export function initials(name: string) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "•";
  const a = parts[0]?.[0] || "";
  const b2 = parts[1]?.[0] || "";
  return (a + b2).toUpperCase();
}

export function insideRect(el: HTMLElement, x: number, y: number) {
  const r = el.getBoundingClientRect();
  return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
}

export function errMsg(e: any, fallback: string) {
  return e?.response?.data?.message || e?.message || fallback;
}
