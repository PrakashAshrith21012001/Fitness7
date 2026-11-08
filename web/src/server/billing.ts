import "server-only";
import { admin } from "./supabase";
import { istToday, plusDays } from "./admin-data";
import { AT_RISK_DAYS, daysBetween, planById, stageOf, stepFor, STEP_PRIORITY, type ReminderStep, type Stage } from "@/lib/billing";
import { signPayToken, verifyPayToken } from "@/lib/paytoken";

/**
 * Reads and writes for renewals & billing (migration-005). Every read tolerates
 * a missing Supabase or a missing migration (returns empty + `ready: false`),
 * so the admin pages still render and say what to do.
 */

export type DueMember = {
  id: string;
  name: string;
  phone: string | null;
  plan_id: string | null;
  plan_name: string | null;
  renews_on: string;
  last_checkin: string | null;
  stage: Stage;
  days: number;
  step: ReminderStep | null;
  /** price of their current plan — what we expect to collect */
  expected: number;
  lastReminder: { step: string; sent_at: string; by: string } | null;
  /** the reminder for today's step has already gone out for this end date */
  remindedForStep: boolean;
};

export type PaymentRow = {
  id: string;
  member_id: string;
  membership_id: string | null;
  amount_inr: number;
  method: string;
  reference: string | null;
  note: string | null;
  paid_on: string;
  receipt_no: string;
  public_token: string;
  recorded_by_name: string;
  voided: boolean;
  created_at: string;
  members?: { name: string; phone: string | null } | null;
  memberships?: { plan_name: string; starts_on: string; ends_on: string } | null;
};

export type MembershipRow = { id: string; plan_id: string; plan_name: string; price_inr: number; starts_on: string; ends_on: string; status: string; created_at: string };

const missing = (e: { code?: string; message?: string } | null) => !!e && (e.code === "42P01" || e.code === "PGRST205" || /does not exist|schema cache/i.test(e.message ?? ""));

/* ---------------- dues board ---------------- */

export async function duesBoard(): Promise<{ ready: boolean; members: DueMember[] }> {
  const a = admin();
  if (!a) return { ready: false, members: [] };
  const today = istToday();
  const { data, error } = await a
    .from("admin_member_summary")
    .select("id, name, phone, plan_id, plan_name, renews_on, last_checkin")
    .gte("renews_on", plusDays(today, -90))
    .lte("renews_on", plusDays(today, 7))
    .order("renews_on");
  if (error) return { ready: false, members: [] };
  const rows = (data ?? []) as Omit<DueMember, "stage" | "days" | "step" | "expected" | "lastReminder" | "remindedForStep">[];
  const ids = rows.map((r) => r.id);
  const rem = ids.length ? await a.from("reminders").select("member_id, step, for_end, sent_at, sent_by_name").in("member_id", ids).gte("sent_at", plusDays(today, -120)).order("sent_at", { ascending: false }) : { data: [], error: null };
  const ready = !missing(rem.error);
  const byMember = new Map<string, { step: string; for_end: string | null; sent_at: string; sent_by_name: string }[]>();
  for (const r of (rem.data ?? []) as { member_id: string; step: string; for_end: string | null; sent_at: string; sent_by_name: string }[]) {
    const list = byMember.get(r.member_id) ?? [];
    list.push(r);
    byMember.set(r.member_id, list);
  }
  const members = rows.map((r) => {
    const { stage, days } = stageOf(r.renews_on, today);
    const step = stepFor(stage, days);
    const sent = byMember.get(r.id) ?? [];
    const last = sent[0];
    return {
      ...r,
      stage,
      days,
      step,
      expected: planById(r.plan_id ?? "")?.priceINR ?? 0,
      lastReminder: last ? { step: last.step, sent_at: last.sent_at, by: last.sent_by_name } : null,
      remindedForStep: !!step && sent.some((s) => s.step === step && s.for_end === r.renews_on),
    };
  });
  return { ready, members };
}

export async function logReminder(memberId: string, step: string, forEnd: string | null, staff: { userId: string | null; name: string }) {
  const a = admin();
  if (!a) return;
  await a.from("reminders").insert({ member_id: memberId, step, for_end: forEnd, channel: "whatsapp_manual", sent_by: staff.userId, sent_by_name: staff.name });
}

/* ---------------- collections ---------------- */

export async function collections(month: string): Promise<{ ready: boolean; payments: PaymentRow[] }> {
  const a = admin();
  if (!a) return { ready: false, payments: [] };
  const from = `${month}-01`;
  const [y, m] = month.split("-").map(Number);
  const to = new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 10);
  const { data, error } = await a
    .from("payments")
    .select("*, members(name, phone), memberships(plan_name, starts_on, ends_on)")
    .gte("paid_on", from)
    .lt("paid_on", to)
    .order("paid_on", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) return { ready: !missing(error), payments: [] };
  return { ready: true, payments: (data ?? []) as PaymentRow[] };
}

/** Renewal rate over the last 30 days: memberships that ended in that window, and how many were followed by another. */
export async function renewalStats(): Promise<{ ready: boolean; due: number; renewed: number; collectedToday: number; collectedMonth: number; dueWeek: number; dueWeekInr: number }> {
  const a = admin();
  const empty = { ready: false, due: 0, renewed: 0, collectedToday: 0, collectedMonth: 0, dueWeek: 0, dueWeekInr: 0 };
  if (!a) return empty;
  const today = istToday();
  const [ended, pay, week] = await Promise.all([
    a.from("memberships").select("member_id, starts_on, ends_on").eq("status", "active").gte("ends_on", plusDays(today, -30)).lt("ends_on", today),
    a.from("payments").select("amount_inr, paid_on").eq("voided", false).gte("paid_on", today.slice(0, 8) + "01"),
    a.from("members").select("plan_id").gte("renews_on", today).lte("renews_on", plusDays(today, 7)),
  ]);
  if (missing(ended.error) || missing(pay.error)) return empty;
  const endedRows = (ended.data ?? []) as { member_id: string; starts_on: string; ends_on: string }[];
  let renewed = 0;
  if (endedRows.length) {
    const { data: later } = await a.from("memberships").select("member_id, starts_on").eq("status", "active").in("member_id", [...new Set(endedRows.map((r) => r.member_id))]);
    const all = (later ?? []) as { member_id: string; starts_on: string }[];
    renewed = endedRows.filter((r) => all.some((x) => x.member_id === r.member_id && x.starts_on > r.starts_on)).length;
  }
  const payRows = (pay.data ?? []) as { amount_inr: number; paid_on: string }[];
  const weekRows = (week.data ?? []) as { plan_id: string | null }[];
  return {
    ready: true,
    due: endedRows.length,
    renewed,
    collectedToday: payRows.filter((p) => p.paid_on === today).reduce((s, p) => s + p.amount_inr, 0),
    collectedMonth: payRows.reduce((s, p) => s + p.amount_inr, 0),
    dueWeek: weekRows.length,
    dueWeekInr: weekRows.reduce((s, r) => s + (planById(r.plan_id ?? "")?.priceINR ?? 0), 0),
  };
}

/* ---------------- one member ---------------- */

export async function memberBilling(id: string): Promise<{ ready: boolean; memberships: MembershipRow[]; payments: PaymentRow[]; reminders: { step: string; sent_at: string; sent_by_name: string }[] }> {
  const a = admin();
  if (!a) return { ready: false, memberships: [], payments: [], reminders: [] };
  const [ms, ps, rs] = await Promise.all([
    a.from("memberships").select("*").eq("member_id", id).order("starts_on", { ascending: false }).limit(24),
    a.from("payments").select("*, memberships(plan_name, starts_on, ends_on)").eq("member_id", id).order("paid_on", { ascending: false }).limit(24),
    a.from("reminders").select("step, sent_at, sent_by_name").eq("member_id", id).order("sent_at", { ascending: false }).limit(10),
  ]);
  if (missing(ms.error)) return { ready: false, memberships: [], payments: [], reminders: [] };
  return { ready: true, memberships: (ms.data ?? []) as MembershipRow[], payments: (ps.data ?? []) as PaymentRow[], reminders: (rs.data ?? []) as { step: string; sent_at: string; sent_by_name: string }[] };
}

export async function paymentById(id: string): Promise<PaymentRow | null> {
  const a = admin();
  if (!a) return null;
  const { data } = await a.from("payments").select("*, members(name, phone), memberships(plan_name, starts_on, ends_on)").eq("id", id).maybeSingle();
  return (data as PaymentRow | null) ?? null;
}

/** Public receipt page: by the unguessable token printed in the WhatsApp link. */
export async function receiptByToken(token: string): Promise<PaymentRow | null> {
  const a = admin();
  if (!a || !/^[0-9a-f-]{36}$/i.test(token)) return null;
  const { data } = await a.from("payments").select("*, members(name, phone), memberships(plan_name, starts_on, ends_on)").eq("public_token", token).maybeSingle();
  return (data as PaymentRow | null) ?? null;
}

/* ---------------- writes ---------------- */

export async function recordPayment(input: {
  memberId: string;
  planId: string;
  planName: string;
  price: number;
  starts: string;
  ends: string;
  amount: number;
  method: string;
  reference: string;
  note: string;
  paidOn: string;
  staff: { userId: string | null; name: string };
}): Promise<{ ok: true; paymentId: string; receiptNo: string; token: string } | { ok: false; error: string }> {
  const a = admin();
  if (!a) return { ok: false, error: "Supabase isn't configured." };
  const { data, error } = await a.rpc("record_payment", {
    p_member: input.memberId,
    p_plan_id: input.planId,
    p_plan_name: input.planName,
    p_price: input.price,
    p_starts: input.starts,
    p_ends: input.ends,
    p_amount: input.amount,
    p_method: input.method,
    p_reference: input.reference,
    p_note: input.note,
    p_paid_on: input.paidOn,
    p_staff: input.staff.userId,
    p_staff_name: input.staff.name,
  });
  if (error) return { ok: false, error: missing(error) || /function .* does not exist|Could not find the function/i.test(error.message) ? "Billing tables aren't set up yet — run supabase/migration-005-billing.sql in Supabase first." : error.message };
  const row = (Array.isArray(data) ? data[0] : data) as { payment_id: string; receipt_no: string; public_token: string } | undefined;
  if (!row) return { ok: false, error: "Payment wasn't saved." };
  return { ok: true, paymentId: row.payment_id, receiptNo: row.receipt_no, token: row.public_token };
}

export async function voidPayment(id: string) {
  const a = admin();
  if (!a) return { ok: false as const, error: "Supabase isn't configured." };
  const { error } = await a.rpc("void_payment", { p_payment: id });
  return error ? { ok: false as const, error: error.message } : { ok: true as const };
}

/**
 * Add a member who signed up at the desk (no app yet). Creates the auth user
 * by phone so that when they install the app and sign in with the same number,
 * it's the same account — plan, payments and all.
 */
export async function addDeskMember(name: string, phone91: string): Promise<{ ok: true; id: string; existed: boolean } | { ok: false; error: string }> {
  const a = admin();
  if (!a) return { ok: false, error: "Supabase isn't configured." };
  const local = phone91.slice(2);
  const { data: found } = await a.from("members").select("id, name").or(`phone.eq.${phone91},phone.eq.+${phone91},phone.eq.${local}`).limit(1);
  const hit = (found ?? [])[0] as { id: string; name: string } | undefined;
  if (hit) {
    if (!hit.name && name) await a.from("members").update({ name }).eq("id", hit.id);
    return { ok: true, id: hit.id, existed: true };
  }
  const created = await a.auth.admin.createUser({ phone: `+${phone91}`, phone_confirm: true, user_metadata: { name, added_by: "desk" } });
  if (created.error || !created.data.user) return { ok: false, error: created.error?.message ?? "Couldn't create the member." };
  const id = created.data.user.id;
  // the on_auth_user_created trigger made the members row; fill in what we know
  await a.from("members").upsert({ id, name, phone: phone91, provider: "phone", onboarded: false }, { onConflict: "id" });
  return { ok: true, id, existed: false };
}

/* ---------------- Phase 2: pay links, at-risk, today's list ---------------- */

const paySecret = () => (process.env.PAY_LINK_SECRET || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
const SITE = () => (process.env.NEXT_PUBLIC_SITE_URL ?? "https://fitness7gym.in").replace(/\/$/, "");
export const gymUpi = () => process.env.GYM_UPI_ID?.trim() || null;

/** The renewal pay link for a member's current end date — null until GYM_UPI_ID is set. */
export function payLinkFor(memberId: string, endsOn: string | null | undefined): string | null {
  if (!gymUpi() || !endsOn) return null;
  const t = signPayToken(memberId, endsOn, paySecret());
  return t ? `${SITE()}/pay/${t}` : null;
}

export function readPayToken(token: string) {
  return verifyPayToken(token, paySecret());
}

/** What the public pay page needs. Never returns more than the member's first name and plan. */
export async function payPageData(memberId: string): Promise<{ name: string; phone: string | null; plan_id: string | null; plan_name: string | null; renews_on: string | null } | null> {
  const a = admin();
  if (!a) return null;
  const { data } = await a.from("members").select("name, phone, plan_id, plan_name, renews_on").eq("id", memberId).maybeSingle();
  return (data as { name: string; phone: string | null; plan_id: string | null; plan_name: string | null; renews_on: string | null } | null) ?? null;
}

export type AtRiskMember = { id: string; name: string; phone: string | null; plan_name: string | null; renews_on: string; last_checkin: string; away: number; nudgedAt: string | null };

/**
 * Members whose plan is still running, who used to check in, but haven't for
 * AT_RISK_DAYS+ days — the people most likely not to renew. Anyone nudged in
 * the last 14 days is listed with `nudgedAt` so nobody gets messaged twice.
 */
export async function atRisk(): Promise<AtRiskMember[]> {
  const a = admin();
  if (!a) return [];
  const today = istToday();
  const { data, error } = await a
    .from("admin_member_summary")
    .select("id, name, phone, plan_name, renews_on, last_checkin, checkin_count")
    .gte("renews_on", today)
    .gt("checkin_count", 0)
    .lte("last_checkin", plusDays(today, -AT_RISK_DAYS))
    .order("last_checkin")
    .limit(60);
  if (error || !data) return [];
  const rows = data as { id: string; name: string; phone: string | null; plan_name: string | null; renews_on: string; last_checkin: string }[];
  const ids = rows.map((r) => r.id);
  const { data: rem } = ids.length
    ? await a.from("reminders").select("member_id, sent_at").eq("step", "nudge").in("member_id", ids).gte("sent_at", plusDays(today, -14))
    : { data: [] };
  const nudged = new Map<string, string>();
  for (const r of (rem ?? []) as { member_id: string; sent_at: string }[]) if (!nudged.has(r.member_id)) nudged.set(r.member_id, r.sent_at);
  return rows.map((r) => ({ ...r, last_checkin: r.last_checkin.slice(0, 10), away: daysBetween(r.last_checkin.slice(0, 10), today), nudgedAt: nudged.get(r.id) ?? null }));
}

export type SendItem = { id: string; name: string; phone: string; kind: ReminderStep | "nudge"; detail: string; amount: number; href: string };

/** Today's send list, most urgent first: renewal reminders not yet sent, then we-miss-you notes. */
export async function sendList(): Promise<{ ready: boolean; items: SendItem[] }> {
  const [{ ready, members }, risk] = await Promise.all([duesBoard(), atRisk()]);
  const due = members
    .filter((m) => m.step && !m.remindedForStep && m.phone)
    .sort((x, y) => STEP_PRIORITY.indexOf(x.step!) - STEP_PRIORITY.indexOf(y.step!) || x.days - y.days)
    .map<SendItem>((m) => ({
      id: m.id,
      name: m.name || "—",
      phone: m.phone!,
      kind: m.step!,
      detail: m.days > 0 ? `ends ${m.renews_on.slice(8)}/${m.renews_on.slice(5, 7)} · in ${m.days} day${m.days === 1 ? "" : "s"}` : m.days === 0 ? "ends today" : `ended ${-m.days} day${m.days === -1 ? "" : "s"} ago`,
      amount: m.expected,
      href: `/admin/remind?m=${m.id}`,
    }));
  const seen = new Set(due.map((d) => d.id));
  const nudges = risk
    .filter((r) => !r.nudgedAt && r.phone && !seen.has(r.id))
    .map<SendItem>((r) => ({ id: r.id, name: r.name || "—", phone: r.phone!, kind: "nudge", detail: `no visit for ${r.away} days · plan runs till ${r.renews_on.slice(8)}/${r.renews_on.slice(5, 7)}`, amount: 0, href: `/admin/remind?m=${r.id}&step=nudge` }));
  return { ready, items: [...due, ...nudges] };
}
