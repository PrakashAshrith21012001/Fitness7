import { NextResponse } from "next/server";
import { OWNER_COOKIE, issueCookie, ownerEnabled, passwordMatches } from "@/server/owner";

export const runtime = "nodejs";

/** Crude throttle: 10 tries per IP per 10 minutes. */
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 600_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 10;
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const back = (q: string) => NextResponse.redirect(new URL(`/owner${q}`, url.origin), 303);
  if (!ownerEnabled()) return back("?error=disabled");
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (limited(ip)) return back("?error=slow");
  const form = await request.formData().catch(() => null);
  if (form?.get("signout")) {
    const res = back("");
    res.cookies.set(OWNER_COOKIE, "", { path: "/owner", maxAge: 0 });
    return res;
  }
  const password = String(form?.get("password") ?? "");
  if (!passwordMatches(password)) return back("?error=wrong");
  const c = issueCookie();
  const res = back("");
  res.cookies.set(OWNER_COOKIE, c.value, { httpOnly: true, sameSite: "lax", secure: url.protocol === "https:", path: "/owner", maxAge: c.maxAge });
  return res;
}

