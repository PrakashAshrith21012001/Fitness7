import { hours } from "@f7/content";

/**
 * "Open now · closes 12:00 PM" from the opening hours in shared/gym.ts,
 * always in IST whatever the visitor's own clock says. Pure — callers decide
 * when to run it (client only: a cached server page would show a stale state).
 */

type Range = { open: number; close: number; label: string };

/** "5:00 AM – 12:00 PM" or "4:00 – 10:00 PM" (start inherits the end's AM/PM) → minutes. */
function parseRange(text: string | null): Range | null {
  if (!text) return null;
  const [a, b] = text.split(/\s*[–-]\s*/);
  if (!a || !b) return null;
  const toMin = (t: string, fallback?: string) => {
    const m = t.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);
    if (!m) return NaN;
    let h = Number(m[1]) % 12;
    const ap = (m[3] ?? fallback ?? "AM").toUpperCase();
    if (ap === "PM") h += 12;
    return h * 60 + Number(m[2] ?? 0);
  };
  const endAp = b.trim().match(/(AM|PM)$/i)?.[1];
  const close = toMin(b);
  let open = toMin(a, endAp);
  if (open > close) open = toMin(a, "AM"); // "11:00 – 1:00 PM" style
  return Number.isNaN(open) || Number.isNaN(close) ? null : { open, close, label: b.trim() };
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export type OpenStatus = { open: boolean; text: string; todayIndex: number };

export function openStatus(now: Date = new Date()): OpenStatus {
  const ist = new Date(now.getTime() + (330 + now.getTimezoneOffset()) * 60_000);
  const dayIdx = ist.getDay();
  const mins = ist.getHours() * 60 + ist.getMinutes();
  const today = hours.find((h) => h.day === DAYS[dayIdx]);
  const ranges = today ? [parseRange(today.morning), parseRange(today.evening)].filter((r): r is Range => !!r) : [];

  const current = ranges.find((r) => mins >= r.open && mins < r.close);
  if (current) return { open: true, text: `Open now · closes ${current.label}`, todayIndex: dayIdx };

  const later = ranges.find((r) => mins < r.open);
  const fmt = (m: number) => {
    const h = Math.floor(m / 60);
    const mm = m % 60;
    return `${h % 12 || 12}${mm ? `:${String(mm).padStart(2, "0")}` : ""} ${h >= 12 ? "PM" : "AM"}`;
  };
  if (later) return { open: false, text: `Closed · opens ${fmt(later.open)} today`, todayIndex: dayIdx };

  const tomorrow = hours.find((h) => h.day === DAYS[(dayIdx + 1) % 7]);
  const first = tomorrow ? parseRange(tomorrow.morning) ?? parseRange(tomorrow.evening) : null;
  return { open: false, text: first ? `Closed · opens ${fmt(first.open)} tomorrow` : "Closed today", todayIndex: dayIdx };
}
