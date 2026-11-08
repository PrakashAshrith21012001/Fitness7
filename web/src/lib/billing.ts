import { brand, plans } from "@f7/content";

/**
 * Renewals & billing — pure helpers shared by the admin pages, server code and
 * the receipt page. No I/O here, so it's easy to test (web/scripts/billing.test.ts).
 *
 * Dates are ISO yyyy-mm-dd in IST. A membership's `ends_on` is the LAST day it
 * is valid (members.renews_on mirrors it, which is what the app reads).
 */

export type PayMethod = "upi_desk" | "cash" | "card" | "upi_link" | "autopay" | "other";
export const PAY_METHODS: { id: PayMethod; label: string }[] = [
  { id: "upi_desk", label: "UPI at desk" },
  { id: "cash", label: "Cash" },
  { id: "card", label: "Card" },
  { id: "upi_link", label: "UPI link" },
  { id: "other", label: "Other" },
];
export const methodLabel = (m: string) => PAY_METHODS.find((x) => x.id === m)?.label ?? (m === "autopay" ? "UPI AutoPay" : m);

/** How many months each plan buys. Unknown plans default to 1. */
export const PLAN_MONTHS: Record<string, number> = { monthly: 1, quarterly: 3, annual: 12, "personal-training": 1 };
export const planMonths = (id: string) => PLAN_MONTHS[id] ?? 1;
export const planById = (id: string) => plans.find((p) => p.id === id);

export const GRACE_DAYS = 5;

const D = (iso: string) => new Date(iso + "T00:00:00Z");
const iso = (d: Date) => d.toISOString().slice(0, 10);
export const isIso = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(D(s).getTime());

export function addDays(day: string, n: number) {
  const d = D(day);
  d.setUTCDate(d.getUTCDate() + n);
  return iso(d);
}

/** Whole days from `a` to `b` (b − a). */
export function daysBetween(a: string, b: string) {
  return Math.round((D(b).getTime() - D(a).getTime()) / 86_400_000);
}

/**
 * Last valid day of a plan that starts on `start` and runs `months` months:
 * 8 Nov + 1 month → 7 Dec. When the target month is shorter (31 Jan + 1 month)
 * the plan runs to that month's last day (28/29 Feb) — no day is lost.
 */
export function endFor(start: string, months: number) {
  const s = D(start);
  const y = s.getUTCFullYear();
  const m = s.getUTCMonth() + months;
  const day = s.getUTCDate();
  const lastDayOfTarget = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  if (day > lastDayOfTarget) return iso(new Date(Date.UTC(y, m, lastDayOfTarget)));
  return addDays(iso(new Date(Date.UTC(y, m, day))), -1);
}

/**
 * Where a renewal should start: the day after the current end date if the
 * member is still active or within grace (no days lost, grace days count),
 * otherwise today.
 */
export function renewalStart(currentEnd: string | null | undefined, today: string) {
  if (currentEnd && isIso(currentEnd) && currentEnd >= addDays(today, -GRACE_DAYS)) return addDays(currentEnd, 1);
  return today;
}

export type Stage = "active" | "due_soon" | "due_today" | "grace" | "lapsed" | "winback" | "gone" | "none";

export const STAGES: { id: Exclude<Stage, "active" | "gone" | "none">; label: string; hint: string }[] = [
  { id: "due_soon", label: "Due in 7 days", hint: "Remind at 7 and 3 days" },
  { id: "due_today", label: "Due today", hint: "Last day of their pass" },
  { id: "grace", label: "In grace", hint: `Ended ≤ ${GRACE_DAYS} days ago — can still train` },
  { id: "lapsed", label: "Lapsed", hint: "6–30 days — call them" },
  { id: "winback", label: "Win back", hint: "31–90 days — send the offer" },
];

/** Stage of a membership ending on `end`, seen on `today`; `days` = end − today. */
export function stageOf(end: string | null | undefined, today: string): { stage: Stage; days: number } {
  if (!end || !isIso(end)) return { stage: "none", days: 0 };
  const days = daysBetween(today, end);
  if (days > 7) return { stage: "active", days };
  if (days >= 1) return { stage: "due_soon", days };
  if (days === 0) return { stage: "due_today", days };
  if (days >= -GRACE_DAYS) return { stage: "grace", days };
  if (days >= -30) return { stage: "lapsed", days };
  if (days >= -90) return { stage: "winback", days };
  return { stage: "gone", days };
}

export type ReminderStep = "t-7" | "t-3" | "due" | "grace" | "lapsed" | "winback";

/** The reminder that fits a stage today (null = nothing to send). */
export function stepFor(stage: Stage, days: number): ReminderStep | null {
  switch (stage) {
    case "due_soon":
      return days <= 3 ? "t-3" : "t-7";
    case "due_today":
      return "due";
    case "grace":
      return "grace";
    case "lapsed":
      return "lapsed";
    case "winback":
      return "winback";
    default:
      return null;
  }
}
export const STEP_LABEL: Record<ReminderStep | "receipt" | "nudge", string> = { "t-7": "7-day reminder", "t-3": "3-day reminder", due: "due-today reminder", grace: "grace reminder", lapsed: "lapsed check-in", winback: "win-back offer", receipt: "receipt", nudge: "we-miss-you note" };

/** Order of today's send list: the most urgent first. */
export const STEP_PRIORITY: ReminderStep[] = ["due", "grace", "t-3", "t-7", "lapsed", "winback"];

/** Members with an active pass who used to check in but haven't for this many days. */
export const AT_RISK_DAYS = 10;

/* ---------------- formatting ---------------- */

export const inr = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const dayMonth = (d: string) => `${Number(d.slice(8, 10))} ${MONTHS[Number(d.slice(5, 7)) - 1]}`;
export const dayMonthYear = (d: string) => `${dayMonth(d)} ${d.slice(0, 4)}`;
const first = (name: string) => (name || "").trim().split(/\s+/)[0] || "there";

/** Indian mobile → "91XXXXXXXXXX" (wa.me format), or null if it isn't one. */
export function normalizePhone(raw: string): string | null {
  let d = String(raw ?? "").replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
  else if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  if (!/^[6-9]\d{9}$/.test(d)) return null;
  return "91" + d;
}
export const phoneDisplay = (p: string | null | undefined) => {
  const n = normalizePhone(p ?? "");
  return n ? `+91 ${n.slice(2, 7)} ${n.slice(7)}` : p ?? "";
};

/* ---------------- WhatsApp messages ---------------- */

type MsgInput = { name: string; plan: string | null; end: string; amount?: number | null; upi?: string | null; payUrl?: string | null };

export function reminderText(step: ReminderStep, m: MsgInput) {
  const hi = `Hi ${first(m.name)}!`;
  const plan = m.plan ? `${brand.name} ${m.plan} pass` : `${brand.name} membership`;
  const how = m.payUrl
    ? `Renew in a minute with any UPI app: ${m.payUrl} — or pay at the desk.`
    : m.upi
      ? `Pay by UPI to ${m.upi}, or at the desk.`
      : "Pay at the desk, or reply here for the UPI details.";
  const pay = [m.amount ? `Renewal: ${inr(m.amount)}.` : null, how].filter(Boolean).join(" ");
  switch (step) {
    case "t-7":
      return `${hi} Your ${plan} is valid till ${dayMonth(m.end)} — 7 days to go. ${pay} Keep the streak going 💪`;
    case "t-3":
      return `${hi} Just 3 days left on your ${plan} (till ${dayMonth(m.end)}). ${pay}`;
    case "due":
      return `${hi} Your ${plan} ends today. Renew to keep training from tomorrow without a break. ${pay}`;
    case "grace":
      return `${hi} Your ${plan} ended on ${dayMonth(m.end)}. You can still train till ${dayMonth(addDays(m.end, GRACE_DAYS))} — renew to keep your slot. ${pay}`;
    case "lapsed":
      return `${hi} We've missed you at ${brand.name}! Your pass ended on ${dayMonth(m.end)}. Shall we restart it this week? Reply here and we'll set it up.`;
    case "winback":
      return `${hi} It's been a while — come back to ${brand.name} this month with no re-joining fee. Reply YES and we'll get you started again.`;
  }
}

/** For an active member who has stopped coming — a check-in, not a sales message. */
export function nudgeText(name: string, daysAway: number) {
  return `Hi ${first(name)}! We haven't seen you at ${brand.name} for ${daysAway} days — all good? If the timing isn't working, tell us and we'll find you a better slot. Your plan is still running 💪`;
}

/**
 * UPI deep link (NPCI "upi://pay"). Opens GPay / PhonePe / Paytm with the
 * payee, amount and note filled in. `tr` is our reference so the desk can
 * match the payment to the member.
 */
export function upiUri(p: { vpa: string; payee: string; amount: number; note: string; ref?: string }) {
  const q = new URLSearchParams({ pa: p.vpa, pn: p.payee });
  if (p.amount > 0) q.set("am", p.amount.toFixed(2));
  q.set("cu", "INR");
  q.set("tn", p.note.slice(0, 50));
  if (p.ref) q.set("tr", p.ref);
  return "upi://pay?" + q.toString().replace(/\+/g, "%20");
}

export function paidText(p: { name: string; phone: string | null; plan: string; amount: number }) {
  return `Hi ${brand.name}, I've paid ${inr(p.amount)} by UPI to renew my ${p.plan} pass.\nName: ${p.name}${p.phone ? `\nPhone: ${phoneDisplay(p.phone)}` : ""}\nUPI ref (UTR): `;
}

export function receiptText(r: { name: string; plan: string; amount: number; starts: string; ends: string; receiptNo: string; url: string }) {
  return `Hi ${first(r.name)}, payment received ✅\n${inr(r.amount)} for ${brand.name} ${r.plan}, valid ${dayMonth(r.starts)} – ${dayMonthYear(r.ends)}.\nReceipt ${r.receiptNo}: ${r.url}\nThank you — see you on the floor!`;
}

export const waUrl = (phone: string, text: string) => `https://wa.me/${normalizePhone(phone) ?? phone.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
