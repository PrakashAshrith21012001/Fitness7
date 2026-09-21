import type { Trek } from "./gym";
import type { TrekRow } from "./supabase-types";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** A database trek → the shape the site and app already render. `reserved` = held + confirmed reservations. */
export function trekFromRow(r: TrekRow, reserved = 0): Trek {
  const [y, m] = r.date.split("-").map(Number);
  return {
    id: r.id,
    title: r.title,
    location: r.location,
    date: r.date,
    month: `${MONTHS[(m ?? 1) - 1]} ${y}`,
    distanceKm: Number(r.distance_km),
    altitudeM: r.altitude_m,
    difficulty: r.difficulty,
    durationText: r.duration_text,
    priceINR: r.price_inr,
    memberPriceINR: r.member_price_inr,
    slotsTotal: r.slots_total,
    slotsLeft: Math.max(0, r.slots_total - reserved),
    summary: r.summary,
    highlights: r.highlights ?? [],
    includes: r.includes ?? [],
    meetingPoint: r.meeting_point,
    image: r.cover_url ?? "",
  };
}

/** "Yercaud Sunrise Climb" + 2026-10-18 → "yercaud-sunrise-climb-oct-2026" */
export function trekSlug(title: string, date: string): string {
  const [y, m] = date.split("-").map(Number);
  const mon = MONTHS[(m ?? 1) - 1]?.slice(0, 3).toLowerCase() ?? "";
  const base = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 40);
  return `${base}-${mon}-${y}`;
}
