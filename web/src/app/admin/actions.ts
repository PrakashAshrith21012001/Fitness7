"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { LeadStatus, StaffRole, TrekStatus } from "@f7/content";
import { plans, trekSlug } from "@f7/content";
import { admin } from "@/server/supabase";
import { AT_COOKIE, RT_COOKIE, can, cookieOpts, createStaff, currentStaff, signInStaff, type Staff } from "@/server/admin-auth";
import { OWNER_COOKIE, issueCookie, passwordMatches } from "@/server/owner";

/**
 * Every write in /admin goes through here. Each action re-checks the role,
 * validates the form, writes with the server key, then revalidates the page.
 * Results come back as ?ok= / ?error= query strings so the pages stay plain
 * server components with no client state.
 */

const str = (fd: FormData, k: string, max = 500) => String(fd.get(k) ?? "").trim().slice(0, max);
const num = (fd: FormData, k: string, min: number, max: number, dflt = 0) => {
  const n = Number(String(fd.get(k) ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : dflt;
};
const lines = (fd: FormData, k: string) => str(fd, k, 2000).split(/\r?\n/).map((s) => s.trim()).filter(Boolean).slice(0, 12);
function back(path: string, q: Record<string, string>): never {
  const u = new URLSearchParams(q).toString();
  redirect(`${path}${u ? `?${u}` : ""}`);
}

async function requireRole(min: StaffRole): Promise<Staff> {
  const { staff } = await currentStaff();
  if (!can(staff, min)) redirect("/admin/login?error=role");
  return staff!;
}

/* ---------------- sign in / out ---------------- */

export async function loginAction(fd: FormData) {
  const jar = await cookies();
  const mode = str(fd, "mode");
  if (mode === "owner") {
    if (!passwordMatches(str(fd, "password", 200))) back("/admin/login", { error: "wrong" });
    const c = issueCookie();
    jar.set(OWNER_COOKIE, c.value, { ...cookieOpts("/"), maxAge: c.maxAge });
    redirect("/admin");
  }
  const res = await signInStaff(str(fd, "email", 200).toLowerCase(), str(fd, "password", 200));
  if (!res.ok) back("/admin/login", { error: res.error });
  jar.set(AT_COOKIE, res.access, { ...cookieOpts("/"), maxAge: res.expiresIn });
  jar.set(RT_COOKIE, res.refresh, { ...cookieOpts("/"), maxAge: 60 * 60 * 24 * 30 });
  redirect("/admin");
}

export async function logoutAction() {
  const jar = await cookies();
  for (const k of [AT_COOKIE, RT_COOKIE]) jar.set(k, "", { ...cookieOpts("/"), maxAge: 0 });
  jar.set(OWNER_COOKIE, "", { ...cookieOpts("/"), maxAge: 0 });
  jar.set(OWNER_COOKIE, "", { ...cookieOpts("/owner"), maxAge: 0 });
  redirect("/admin/login");
}

/* ---------------- treks ---------------- */

export async function saveTrekAction(fd: FormData) {
  const staff = await requireRole("admin");
  const a = admin();
  if (!a) back("/admin/treks", { error: "Supabase isn't configured." });
  const title = str(fd, "title", 80);
  const date = str(fd, "date", 10);
  if (title.length < 3) back(str(fd, "return") || "/admin/treks/new", { error: "Give the trek a title." });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) back(str(fd, "return") || "/admin/treks/new", { error: "Pick a date." });
  const existing = str(fd, "id", 80);
  const id = existing || trekSlug(title, date);
  const row = {
    id,
    title,
    location: str(fd, "location", 80) || "Tamil Nadu",
    date,
    duration_text: str(fd, "duration_text", 80) || "Day trip",
    meeting_point: str(fd, "meeting_point", 120) || "Fitness 7 Gym",
    difficulty: (["Easy", "Moderate", "Challenging"].includes(str(fd, "difficulty")) ? str(fd, "difficulty") : "Moderate") as "Easy" | "Moderate" | "Challenging",
    distance_km: num(fd, "distance_km", 0, 200),
    altitude_m: Math.round(num(fd, "altitude_m", 0, 9000)),
    price_inr: Math.round(num(fd, "price_inr", 0, 100000)),
    member_price_inr: Math.round(num(fd, "member_price_inr", 0, 100000)),
    slots_total: Math.round(num(fd, "slots_total", 1, 500, 20)),
    summary: str(fd, "summary", 600),
    highlights: lines(fd, "highlights"),
    includes: lines(fd, "includes"),
    cover_url: str(fd, "cover_url", 500) || null,
    gallery: str(fd, "gallery", 5000).split("\n").map((s) => s.trim()).filter(Boolean).slice(0, 12),
    status: (["draft", "published", "cancelled"].includes(str(fd, "status")) ? str(fd, "status") : "draft") as TrekStatus,
    ...(existing ? {} : { created_by: staff.userId }),
  };
  const { error } = await a.from("treks").upsert(row, { onConflict: "id" });
  if (error) back(str(fd, "return") || "/admin/treks/new", { error: error.message });
  revalidatePath("/");
  revalidatePath("/admin/treks");
  revalidatePath(`/admin/treks/${id}`);
  redirect(`/admin/treks/${id}?ok=${encodeURIComponent(row.status === "published" ? "Saved and published — it's on the site now." : "Saved as " + row.status + ".")}`);
}

export async function setTrekStatusAction(fd: FormData) {
  await requireRole("admin");
  const a = admin();
  const id = str(fd, "id", 80);
  const status = str(fd, "status") as TrekStatus;
  if (!a || !id || !["draft", "published", "cancelled"].includes(status)) back(`/admin/treks/${id}`, { error: "Bad request." });
  const { error } = await a.from("treks").update({ status }).eq("id", id);
  revalidatePath("/");
  revalidatePath("/admin/treks");
  revalidatePath(`/admin/treks/${id}`);
  back(`/admin/treks/${id}`, error ? { error: error.message } : { ok: `Now ${status}.` });
}

export async function deleteTrekAction(fd: FormData) {
  await requireRole("admin");
  const a = admin();
  const id = str(fd, "id", 80);
  if (!a || !id) back("/admin/treks", { error: "Bad request." });
  const { count } = await a.from("trek_reservations").select("*", { count: "exact", head: true }).eq("trek_id", id).neq("status", "cancelled");
  if ((count ?? 0) > 0) back(`/admin/treks/${id}`, { error: `${count} members hold a slot — cancel the trek instead of deleting it.` });
  await a.from("treks").delete().eq("id", id);
  revalidatePath("/");
  revalidatePath("/admin/treks");
  redirect("/admin/treks?ok=Deleted.");
}

export async function setReservationAction(fd: FormData) {
  await requireRole("coach");
  const a = admin();
  const trekId = str(fd, "trek_id", 80);
  const memberId = str(fd, "member_id", 80);
  const status = str(fd, "status");
  if (!a || !["held", "confirmed", "cancelled"].includes(status)) back(`/admin/treks/${trekId}`, { error: "Bad request." });
  const { error } = await a.from("trek_reservations").update({ status, updated_at: new Date().toISOString() }).eq("trek_id", trekId).eq("member_id", memberId);
  revalidatePath(`/admin/treks/${trekId}`);
  revalidatePath("/");
  back(`/admin/treks/${trekId}`, error ? { error: error.message } : { ok: "Updated." });
}

/* ---------------- members ---------------- */

export async function setMemberPlanAction(fd: FormData) {
  await requireRole("admin");
  const a = admin();
  const id = str(fd, "member_id", 80);
  if (!a || !id) back(`/admin/members/${id}`, { error: "Bad request." });
  const planId = str(fd, "plan_id", 40);
  const planName = plans.find((p) => p.id === planId)?.name ?? planId;
  const renews = str(fd, "renews_on", 10);
  const patch = planId
    ? { plan_id: planId, plan_name: planName, renews_on: /^\d{4}-\d{2}-\d{2}$/.test(renews) ? renews : null }
    : { plan_id: null, plan_name: null, renews_on: null };
  const { error } = await a.from("members").update(patch).eq("id", id);
  revalidatePath(`/admin/members/${id}`);
  revalidatePath("/admin/members");
  back(`/admin/members/${id}`, error ? { error: error.message } : { ok: planId ? "Plan updated. The member sees it on their next sync." : "Plan removed." });
}

export async function addNoteAction(fd: FormData) {
  const staff = await requireRole("coach");
  const a = admin();
  const id = str(fd, "member_id", 80);
  const body = str(fd, "body", 1000);
  if (!a || !id || body.length < 2) back(`/admin/members/${id}`, { error: "Write a note first." });
  const { error } = await a.from("member_notes").insert({ member_id: id, author: staff.userId, author_name: staff.name, body });
  revalidatePath(`/admin/members/${id}`);
  back(`/admin/members/${id}`, error ? { error: error.message } : { ok: "Note added." });
}

export async function deleteNoteAction(fd: FormData) {
  await requireRole("admin");
  const a = admin();
  const id = str(fd, "member_id", 80);
  const noteId = str(fd, "note_id", 80);
  if (a && noteId) await a.from("member_notes").delete().eq("id", noteId);
  revalidatePath(`/admin/members/${id}`);
  back(`/admin/members/${id}`, { ok: "Note removed." });
}

/* ---------------- leads ---------------- */

export async function updateLeadAction(fd: FormData) {
  await requireRole("coach");
  const a = admin();
  const id = str(fd, "id", 80);
  const status = str(fd, "status") as LeadStatus;
  const note = str(fd, "note", 500);
  const ret = str(fd, "return", 120) || "/admin/leads";
  if (!a || !id || !["new", "contacted", "joined", "lost"].includes(status)) back(ret, { error: "Bad request." });
  const { error } = await a.from("leads").update({ status, note: note || null, updated_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
  back(ret, error ? { error: error.message } : { ok: "Saved." });
}

/* ---------------- announcements ---------------- */

export async function saveAnnouncementAction(fd: FormData) {
  const staff = await requireRole("admin");
  const a = admin();
  const title = str(fd, "title", 80);
  if (!a || title.length < 3) back("/admin/announcements", { error: "Give it a title." });
  const row = {
    ...(str(fd, "id", 80) ? { id: str(fd, "id", 80) } : {}),
    title,
    body: str(fd, "body", 600),
    starts_on: /^\d{4}-\d{2}-\d{2}$/.test(str(fd, "starts_on")) ? str(fd, "starts_on") : undefined,
    ends_on: /^\d{4}-\d{2}-\d{2}$/.test(str(fd, "ends_on")) ? str(fd, "ends_on") : undefined,
    audience: (["app", "site", "both"].includes(str(fd, "audience")) ? str(fd, "audience") : "both") as "app" | "site" | "both",
    link_url: str(fd, "link_url", 300) || null,
    created_by: staff.userId,
  };
  const { error } = await a.from("announcements").upsert(row);
  revalidatePath("/admin/announcements");
  revalidatePath("/");
  back("/admin/announcements", error ? { error: error.message } : { ok: "Saved. The app picks it up on its next open." });
}

export async function deleteAnnouncementAction(fd: FormData) {
  await requireRole("admin");
  const a = admin();
  const id = str(fd, "id", 80);
  if (a && id) await a.from("announcements").delete().eq("id", id);
  revalidatePath("/admin/announcements");
  revalidatePath("/");
  back("/admin/announcements", { ok: "Removed." });
}

/* ---------------- staff ---------------- */

export async function createStaffAction(fd: FormData) {
  await requireRole("owner");
  const role = str(fd, "role") as StaffRole;
  const res = await createStaff({
    name: str(fd, "name", 60),
    email: str(fd, "email", 120),
    password: str(fd, "password", 200),
    role: ["owner", "admin", "coach"].includes(role) ? role : "admin",
  });
  revalidatePath("/admin/staff");
  back("/admin/staff", res.ok ? { ok: "Login created. Share the email and password with them; they can sign in at /admin/login." } : { error: res.error });
}

export async function setStaffActiveAction(fd: FormData) {
  const me = await requireRole("owner");
  const a = admin();
  const id = str(fd, "user_id", 80);
  const active = str(fd, "active") === "1";
  if (a && id && id !== me.userId) await a.from("staff").update({ active }).eq("user_id", id);
  revalidatePath("/admin/staff");
  back("/admin/staff", { ok: active ? "Re-activated." : "Deactivated — they can't sign in any more." });
}
