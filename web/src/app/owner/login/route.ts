import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** Old owner login → the admin sign-in (owner-password mode). */
export async function POST(request: Request) {
  return NextResponse.redirect(new URL("/admin/login?mode=owner", new URL(request.url).origin), 303);
}
