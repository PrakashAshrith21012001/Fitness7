"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { StaffRole } from "@f7/content";
import { can, currentStaff, type Staff } from "@/server/admin-auth";
import { istToday } from "@/server/admin-data";
import { addDeskMember, recordPayment, voidPayment } from "@/server/billing";
import { endFor, isIso, normalizePhone, PAY_METHODS, planById, planMonths } from "@/lib/billing";

/** Renewals & billing writes. Same pattern as actions.ts: role check → validate → write → redirect with ?ok/?error. */

const str = (fd: FormData, k: string, max = 300) => String(fd.get(k) ?? "").trim().slice(0, max);
function back(path: string, q: Record<string, string>): never {
  const u = new URLSearchParams(q).toString();
  redirect(`${path}${u ? `?${u}` : ""}`);
}
async function requireRole(min: StaffRole): Promise<Staff> {
  const { staff } = await currentStaff();
  if (!can(staff, min)) redirect("/admin/login?error=role");
  return staff!;
}

type PayFields = { planId: string; planName: string; price: number; starts: string; ends: string; amount: number; method: string; reference: string; note: string; paidOn: string };

function readPayment(fd: FormData): PayFields | string {
  const planId = str(fd, "plan_id", 40);
  const plan = planById(planId);
  if (!plan) return "Pick a plan.";
  const starts = str(fd, "starts_on", 10);
  if (!isIso(starts)) return "Pick the start date.";
  const amount = Math.round(Number(str(fd, "amount").replace(/[^\d.]/g, "")));
  if (!Number.isFinite(amount) || amount < 0 || amount > 200000) return "Enter the amount paid.";
  const method = str(fd, "method", 20);
  if (!PAY_METHODS.some((m) => m.id === method)) return "Pick how they paid.";
  const paidOn = isIso(str(fd, "paid_on", 10)) ? str(fd, "paid_on", 10) : istToday();
  return {
    planId,
    planName: plan.name,
    price: plan.priceINR,
    starts,
    ends: endFor(starts, planMonths(planId)),
    amount,
    method,
    reference: str(fd, "reference", 80),
    note: str(fd, "note", 300),
    paidOn,
  };
}

export async function recordPaymentAction(fd: FormData) {
  const staff = await requireRole("admin");
  const memberId = str(fd, "member_id", 80);
  const ret = `/admin/members/${memberId}`;
  const p = readPayment(fd);
  if (typeof p === "string") back(ret, { error: p });
  const res = await recordPayment({ memberId, ...p, staff: { userId: staff.userId, name: staff.name } });
  if (!res.ok) back(ret, { error: res.error });
  revalidatePath(ret);
  revalidatePath("/admin");
  revalidatePath("/admin/dues");
  revalidatePath("/admin/collections");
  revalidatePath("/admin/members");
  back(ret, { paid: res.paymentId });
}

export async function addMemberAction(fd: FormData) {
  const staff = await requireRole("admin");
  const name = str(fd, "name", 60);
  const phone = normalizePhone(str(fd, "phone", 20));
  if (name.length < 2) back("/admin/members/new", { error: "Enter their name." });
  if (!phone) back("/admin/members/new", { error: "Enter a 10-digit Indian mobile number." });
  const added = await addDeskMember(name, phone);
  if (!added.ok) back("/admin/members/new", { error: added.error });
  revalidatePath("/admin/members");
  const ret = `/admin/members/${added.id}`;
  if (!str(fd, "plan_id")) back(ret, { ok: added.existed ? "They were already a member — opened their profile." : "Member added. Record their payment when they pay." });
  const p = readPayment(fd);
  if (typeof p === "string") back(ret, { error: `Member saved, but the payment wasn't: ${p}` });
  const res = await recordPayment({ memberId: added.id, ...p, staff: { userId: staff.userId, name: staff.name } });
  if (!res.ok) back(ret, { error: `Member saved, but the payment wasn't: ${res.error}` });
  revalidatePath("/admin");
  revalidatePath("/admin/dues");
  revalidatePath("/admin/collections");
  back(ret, { paid: res.paymentId, ...(added.existed ? { ok: "They were already a member — payment added to their profile." } : {}) });
}

export async function voidPaymentAction(fd: FormData) {
  await requireRole("owner");
  const id = str(fd, "payment_id", 80);
  const ret = str(fd, "return", 160) || "/admin/collections";
  const res = await voidPayment(id);
  revalidatePath("/admin");
  revalidatePath("/admin/dues");
  revalidatePath("/admin/collections");
  revalidatePath("/admin/members");
  back(ret, res.ok ? { ok: "Payment voided. Their end date went back to the previous plan." } : { error: res.error });
}
