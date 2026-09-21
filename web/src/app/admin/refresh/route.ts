import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AT_COOKIE, RT_COOKIE, cookieOpts, refreshStaff } from "@/server/admin-auth";

export const runtime = "nodejs";

/** Access token expired → use the refresh token, set fresh cookies, go back. */
export async function GET(request: Request) {
  const jar = await cookies();
  const rt = jar.get(RT_COOKIE)?.value;
  const url = new URL(request.url);
  const next = url.searchParams.get("next") ?? "/admin";
  const fail = () => {
    const res = NextResponse.redirect(new URL("/admin/login?error=expired", url.origin), 303);
    res.cookies.set(AT_COOKIE, "", { ...cookieOpts("/"), maxAge: 0 });
    res.cookies.set(RT_COOKIE, "", { ...cookieOpts("/"), maxAge: 0 });
    return res;
  };
  if (!rt) return fail();
  const r = await refreshStaff(rt);
  if (!r.ok) return fail();
  const res = NextResponse.redirect(new URL(next.startsWith("/admin") ? next : "/admin", url.origin), 303);
  res.cookies.set(AT_COOKIE, r.access, { ...cookieOpts("/"), maxAge: r.expiresIn });
  res.cookies.set(RT_COOKIE, r.refresh, { ...cookieOpts("/"), maxAge: 60 * 60 * 24 * 30 });
  return res;
}
