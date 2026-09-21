import "server-only";
import type { AdminMemberSummary, AnnouncementRow, LeadStatus, MemberNoteRow, MemberRow, StaffRow, TrekRow } from "@f7/content";
import { admin } from "./supabase";
import { reservedCounts } from "./treks";
import { estimateInr } from "./owner";

/** All reads for /admin. Every function tolerates a missing Supabase (returns empty) so the pages still render. */

export const istToday = () => new Date(Date.now() + 5.5 * 3_600_000).toISOString().slice(0, 10);
export const plusDays = (iso: string, n: number) => {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

type Row = Record<string, unknown>;

/* ---------------- overview ---------------- */

export async function overview() {
  const a = admin();
  const today = istToday();
  const weekEnd = plusDays(today, 7);
  const monthStart = today.slice(0, 8) + "01";
  const empty = { today, checkins: [] as Row[], expiring: [] as Row[], newLeads: 0, members: 0, active30: 0, usage: { text: 0, photo: 0, inr: 0 }, upcoming: [] as (TrekRow & { reserved: number })[], announcements: [] as AnnouncementRow[] };
  if (!a) return empty;
  const [ck, ex, nl, mc, ac, us, tk, an, counts] = await Promise.all([
    a.from("checkins").select("created_at, members(name, phone, plan_name)").eq("date", today).order("created_at"),
    a.from("members").select("id, name, phone, plan_name, renews_on").gte("renews_on", today).lte("renews_on", weekEnd).order("renews_on"),
    a.from("leads").select("*", { count: "exact", head: true }).eq("status", "new"),
    a.from("members").select("*", { count: "exact", head: true }),
    a.from("checkins").select("member_id").gte("date", plusDays(today, -30)),
    a.from("api_usage").select("kind, count, input_tokens, output_tokens").gte("date", monthStart),
    a.from("treks").select("*").gte("date", today).neq("status", "cancelled").order("date").limit(4),
    a.from("announcements").select("*").lte("starts_on", today).gte("ends_on", today).order("starts_on", { ascending: false }),
    reservedCounts(),
  ]);
  const usage = { text: 0, photo: 0, inr: 0 };
  for (const u of (us.data ?? []) as Row[]) {
    const kind = u.kind === "food_photo" ? "food_photo" : "food_text";
    if (kind === "food_photo") usage.photo += Number(u.count ?? 0);
    else usage.text += Number(u.count ?? 0);
    usage.inr += estimateInr(kind, Number(u.input_tokens ?? 0), Number(u.output_tokens ?? 0));
  }
  return {
    today,
    checkins: (ck.data as Row[]) ?? [],
    expiring: (ex.data as Row[]) ?? [],
    newLeads: nl.count ?? 0,
    members: mc.count ?? 0,
    active30: new Set(((ac.data ?? []) as { member_id: string }[]).map((r) => r.member_id)).size,
    usage,
    upcoming: ((tk.data as TrekRow[]) ?? []).map((t) => ({ ...t, reserved: counts[t.id] ?? 0 })),
    announcements: (an.data as AnnouncementRow[]) ?? [],
  };
}

/* ---------------- treks ---------------- */

export async function listTreks(): Promise<(TrekRow & { reserved: number })[]> {
  const a = admin();
  if (!a) return [];
  const [{ data }, counts] = await Promise.all([a.from("treks").select("*").order("date", { ascending: false }), reservedCounts()]);
  return ((data as TrekRow[]) ?? []).map((t) => ({ ...t, reserved: counts[t.id] ?? 0 }));
}

export type Reservation = { member_id: string; trek_id: string; status: "held" | "confirmed" | "cancelled"; note: string | null; created_at: string; members: { name: string; phone: string | null; plan_name: string | null } | null };

export async function getTrek(id: string): Promise<{ trek: TrekRow | null; reservations: Reservation[] }> {
  const a = admin();
  if (!a) return { trek: null, reservations: [] };
  const [t, r] = await Promise.all([
    a.from("treks").select("*").eq("id", id).maybeSingle(),
    a.from("trek_reservations").select("member_id, trek_id, status, note, created_at, members(name, phone, plan_name)").eq("trek_id", id).order("created_at"),
  ]);
  return { trek: (t.data as TrekRow | null) ?? null, reservations: ((r.data ?? []) as unknown as Reservation[]) };
}

/* ---------------- members ---------------- */

export type MemberFilter = "all" | "expiring" | "inactive" | "noplan" | "new";

export async function listMembers(q: string, filter: MemberFilter): Promise<AdminMemberSummary[]> {
  const a = admin();
  if (!a) return [];
  const today = istToday();
  let query = a.from("admin_member_summary").select("*").order("last_checkin", { ascending: false, nullsFirst: false }).limit(300);
  if (q.trim()) {
    const s = q.trim().replace(/[%,]/g, "");
    query = query.or(`name.ilike.%${s}%,phone.ilike.%${s}%,email.ilike.%${s}%`);
  }
  if (filter === "expiring") query = query.gte("renews_on", today).lte("renews_on", plusDays(today, 7));
  if (filter === "noplan") query = query.is("plan_id", null);
  if (filter === "new") query = query.gte("joined_on", plusDays(today, -14));
  const { data } = await query;
  let rows = ((data as AdminMemberSummary[]) ?? []);
  if (filter === "inactive") rows = rows.filter((m) => !!m.plan_id && (!m.last_checkin || m.last_checkin < plusDays(today, -14)));
  return rows;
}

export async function getMemberProfile(id: string) {
  const a = admin();
  if (!a) return null;
  const since90 = plusDays(istToday(), -90);
  const since14 = plusDays(istToday(), -14);
  const [m, ck, w, f, wa, ac, r, n] = await Promise.all([
    a.from("members").select("*").eq("id", id).maybeSingle(),
    a.from("checkins").select("date").eq("member_id", id).gte("date", since90).order("date"),
    a.from("weights").select("date, kg").eq("member_id", id).order("date").limit(30),
    a.from("food_logs").select("date, kcal, protein_g, meal").eq("member_id", id).is("deleted_at", null).gte("date", since14),
    a.from("water_logs").select("date, ml").eq("member_id", id).gte("date", since14),
    a.from("activity_logs").select("date, name, minutes, kcal").eq("member_id", id).is("deleted_at", null).gte("date", since14),
    a.from("trek_reservations").select("trek_id, status, created_at").eq("member_id", id).order("created_at", { ascending: false }),
    a.from("member_notes").select("*").eq("member_id", id).order("created_at", { ascending: false }).limit(50),
  ]);
  if (!m.data) return null;
  return {
    member: m.data as MemberRow,
    checkins: ((ck.data ?? []) as { date: string }[]).map((x) => x.date),
    weights: ((w.data ?? []) as { date: string; kg: number }[]).map((x) => ({ date: x.date, kg: Number(x.kg) })),
    food: (f.data ?? []) as { date: string; kcal: number; protein_g: number; meal: string }[],
    water: (wa.data ?? []) as { date: string; ml: number }[],
    activity: (ac.data ?? []) as { date: string; name: string; minutes: number; kcal: number }[],
    reservations: (r.data ?? []) as { trek_id: string; status: string; created_at: string }[],
    notes: (n.data ?? []) as MemberNoteRow[],
  };
}

/* ---------------- leads ---------------- */

export type LeadRowFull = { id: string; name: string; phone: string; interest: string | null; message: string | null; source: string; status: LeadStatus; note: string | null; created_at: string; updated_at: string };

export async function listLeads(status: LeadStatus | "all"): Promise<LeadRowFull[]> {
  const a = admin();
  if (!a) return [];
  let q = a.from("leads").select("*").order("created_at", { ascending: false }).limit(300);
  if (status !== "all") q = q.eq("status", status);
  const { data } = await q;
  return (data as LeadRowFull[]) ?? [];
}

/* ---------------- announcements / staff ---------------- */

export async function listAnnouncements(): Promise<AnnouncementRow[]> {
  const a = admin();
  if (!a) return [];
  const { data } = await a.from("announcements").select("*").order("starts_on", { ascending: false }).limit(100);
  return (data as AnnouncementRow[]) ?? [];
}

export async function listStaff(): Promise<StaffRow[]> {
  const a = admin();
  if (!a) return [];
  const { data } = await a.from("staff").select("*").order("created_at");
  return (data as StaffRow[]) ?? [];
}
