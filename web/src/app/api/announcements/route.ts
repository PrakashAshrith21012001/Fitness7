import { NextResponse } from "next/server";
import { getActiveAnnouncements } from "@/server/treks";

export const runtime = "nodejs";
export const revalidate = 60;

/** GET /api/announcements?audience=app|site → { announcements } — active today. */
export async function GET(request: Request) {
  const aud = new URL(request.url).searchParams.get("audience") === "site" ? "site" : "app";
  const announcements = await getActiveAnnouncements(aud);
  return NextResponse.json({ announcements }, { headers: { "cache-control": "public, s-maxage=60, stale-while-revalidate=300" } });
}
