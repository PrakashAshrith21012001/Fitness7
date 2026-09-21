import "server-only";
import { treks as staticTreks, trekFromRow, type Trek, type TrekRow, type AnnouncementRow } from "@f7/content";
import { admin } from "./supabase";

/**
 * Treks and announcements for the public site and the app's /api routes.
 * Published rows from the database; the hand-written list in shared/gym.ts
 * when the table is empty or Supabase isn't configured, so the site never
 * shows a blank section.
 */

export async function reservedCounts(): Promise<Record<string, number>> {
  const a = admin();
  if (!a) return {};
  const { data } = await a.from("trek_reservations").select("trek_id").neq("status", "cancelled");
  const out: Record<string, number> = {};
  for (const r of (data ?? []) as { trek_id: string }[]) out[r.trek_id] = (out[r.trek_id] ?? 0) + 1;
  return out;
}

export async function getPublishedTreks(): Promise<{ treks: Trek[]; source: "db" | "static" }> {
  const a = admin();
  if (!a) return { treks: staticTreks, source: "static" };
  const [{ data, error }, counts] = await Promise.all([a.from("treks").select("*").eq("status", "published").order("date"), reservedCounts()]);
  if (error || !data || data.length === 0) return { treks: staticTreks, source: "static" };
  return { treks: (data as TrekRow[]).map((r) => trekFromRow(r, counts[r.id] ?? 0)), source: "db" };
}

export async function getActiveAnnouncements(audience: "app" | "site"): Promise<AnnouncementRow[]> {
  const a = admin();
  if (!a) return [];
  const today = new Date(Date.now() + 5.5 * 3_600_000).toISOString().slice(0, 10);
  const { data } = await a
    .from("announcements")
    .select("*")
    .lte("starts_on", today)
    .gte("ends_on", today)
    .in("audience", [audience, "both"])
    .order("starts_on", { ascending: false });
  return (data as AnnouncementRow[]) ?? [];
}
