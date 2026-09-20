import { NextResponse } from "next/server";
import { admin, userFromRequest } from "@/server/supabase";

export const runtime = "nodejs";

/**
 * GET    /api/member/me  — the signed-in member's row + prefs + counts
 * DELETE /api/member/me  — delete the account (auth user; every table cascades)
 *
 * Both need the app's Supabase JWT: `Authorization: Bearer <access_token>`.
 * The owner dashboard reads members with the admin client directly; this
 * route exists for the app ("Your data" / "Delete my data") and for support.
 */

function unauthorized(reason: string) {
  const msg = reason === "unconfigured" ? "Backend not configured." : "Please sign in again.";
  return NextResponse.json({ error: msg }, { status: reason === "unconfigured" ? 503 : 401 });
}

export async function GET(request: Request) {
  const auth = await userFromRequest(request);
  if (!auth.user) return unauthorized(auth.reason);
  const c = admin()!;
  const id = auth.user.id;

  const [member, prefs, checkins, weights, follows, reservations, food] = await Promise.all([
    c.from("members").select("*").eq("id", id).maybeSingle(),
    c.from("notification_prefs").select("classes,treks,renewals").eq("member_id", id).maybeSingle(),
    c.from("checkins").select("*", { count: "exact", head: true }).eq("member_id", id),
    c.from("weights").select("*", { count: "exact", head: true }).eq("member_id", id),
    c.from("class_follows").select("*", { count: "exact", head: true }).eq("member_id", id),
    c.from("trek_reservations").select("*", { count: "exact", head: true }).eq("member_id", id),
    c.from("food_logs").select("*", { count: "exact", head: true }).eq("member_id", id).is("deleted_at", null),
  ]);

  if (member.error) return NextResponse.json({ error: member.error.message }, { status: 500 });
  if (!member.data) return NextResponse.json({ error: "No member record yet." }, { status: 404 });

  return NextResponse.json({
    member: member.data,
    notifications: prefs.data ?? { classes: true, treks: true, renewals: true },
    counts: {
      checkins: checkins.count ?? 0,
      weights: weights.count ?? 0,
      follows: follows.count ?? 0,
      reservations: reservations.count ?? 0,
      foodLogs: food.count ?? 0,
    },
  });
}

export async function DELETE(request: Request) {
  const auth = await userFromRequest(request);
  if (!auth.user) return unauthorized(auth.reason);
  const c = admin()!;
  // Deleting the auth user cascades: members → every per-member table.
  const { error } = await c.auth.admin.deleteUser(auth.user.id);
  if (error) return NextResponse.json({ error: "Couldn't delete right now. Message us on WhatsApp and we'll do it by hand." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
