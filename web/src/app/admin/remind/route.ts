import { NextResponse } from "next/server";
import { can, currentStaff } from "@/server/admin-auth";
import { admin } from "@/server/supabase";
import { istToday } from "@/server/admin-data";
import { gymUpi, logReminder, payLinkFor, paymentById } from "@/server/billing";
import { daysBetween, nudgeText, planById, receiptText, reminderText, stageOf, stepFor, waUrl, type ReminderStep } from "@/lib/billing";

export const dynamic = "force-dynamic";

/**
 * GET /admin/remind?m=<member id>            → today's renewal reminder
 * GET /admin/remind?p=<payment id>&step=receipt → the payment's receipt
 * GET /admin/remind?m=<member id>&step=nudge  → "we haven't seen you" note
 *
 * Logs the message (so the dues board shows "reminded" and nobody sends it
 * twice), then opens WhatsApp with the text filled in. Staff press Send.
 */
const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://fitness7gym.in").replace(/\/$/, "");

export async function GET(request: Request) {
  const { staff, needsRefresh } = await currentStaff();
  const url = new URL(request.url);
  if (!can(staff, "coach")) return NextResponse.redirect(new URL(needsRefresh ? "/admin/refresh" : "/admin/login", url));
  const who = { userId: staff!.userId, name: staff!.name };
  const back = (error: string) => NextResponse.redirect(new URL(`/admin/dues?error=${encodeURIComponent(error)}`, url));

  if (url.searchParams.get("step") === "receipt") {
    const p = await paymentById(url.searchParams.get("p") ?? "");
    if (!p || !p.members?.phone) return back("That payment has no phone number to send to.");
    const text = receiptText({
      name: p.members.name,
      plan: p.memberships?.plan_name ?? "membership",
      amount: p.amount_inr,
      starts: p.memberships?.starts_on ?? p.paid_on,
      ends: p.memberships?.ends_on ?? p.paid_on,
      receiptNo: p.receipt_no,
      url: `${SITE}/receipt/${p.public_token}`,
    });
    await logReminder(p.member_id, "receipt", p.memberships?.ends_on ?? null, who);
    return NextResponse.redirect(waUrl(p.members.phone, text));
  }

  const a = admin();
  const id = url.searchParams.get("m") ?? "";
  if (!a || !/^[0-9a-f-]{36}$/i.test(id)) return back("Member not found.");
  if (url.searchParams.get("step") === "nudge") {
    const { data: r } = await a.from("admin_member_summary").select("id, name, phone, last_checkin, renews_on").eq("id", id).maybeSingle();
    if (!r?.phone) return back("This member has no phone number.");
    const away = r.last_checkin ? daysBetween(String(r.last_checkin).slice(0, 10), istToday()) : 0;
    await logReminder(r.id, "nudge", r.renews_on ?? null, who);
    return NextResponse.redirect(waUrl(r.phone, nudgeText(r.name, away)));
  }

  const { data: m } = await a.from("members").select("id, name, phone, plan_id, plan_name, renews_on").eq("id", id).maybeSingle();
  if (!m?.phone || !m.renews_on) return back("This member has no phone number or end date yet.");
  const { stage, days } = stageOf(m.renews_on, istToday());
  const step = (url.searchParams.get("step") as ReminderStep | null) ?? stepFor(stage, days);
  if (!step) return back(`${m.name || "This member"} isn't due yet.`);
  const text = reminderText(step, { name: m.name, plan: m.plan_name, end: m.renews_on, amount: planById(m.plan_id ?? "")?.priceINR ?? null, upi: gymUpi(), payUrl: ["t-7", "t-3", "due", "grace"].includes(step) ? payLinkFor(m.id, m.renews_on) : null });
  await logReminder(m.id, step, m.renews_on, who);
  return NextResponse.redirect(waUrl(m.phone, text));
}
