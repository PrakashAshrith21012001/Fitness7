import { NextResponse } from "next/server";
import { getPublishedTreks } from "@/server/treks";

export const runtime = "nodejs";
export const revalidate = 60;

/** GET /api/treks → { treks: Trek[], source: "db" | "static" } — published treks with live slotsLeft. */
export async function GET() {
  const res = await getPublishedTreks();
  return NextResponse.json(res, { headers: { "cache-control": "public, s-maxage=60, stale-while-revalidate=300" } });
}
