import "server-only";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import type { StaffRole, StaffRow } from "@f7/content";
import { admin, supabaseConfigured } from "./supabase";
import { OWNER_COOKIE, cookieValid as ownerCookieValid, ownerEnabled } from "./owner";

/**
 * Who is using /admin.
 *
 * Staff sign in with email + password through Supabase Auth; the access and
 * refresh tokens live in httpOnly cookies scoped to /admin and /api/admin.
 * A row in `staff` (active = true) decides the role. The env OWNER_PASSWORD
 * still works as "owner mode" — that is how the first admin gets created
 * without touching the Supabase dashboard.
 */

export type Staff = { userId: string | null; name: string; email: string; role: StaffRole; ownerMode?: boolean };

export const AT_COOKIE = "f7_adm_at";
export const RT_COOKIE = "f7_adm_rt";
const RANK: Record<StaffRole, number> = { coach: 1, admin: 2, owner: 3 };

const url = process.env.SUPABASE_URL?.trim() || process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const anon = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY)?.trim();

/** A throwaway client for the auth endpoints (sign-in, refresh). */
function authClient() {
  if (!url || !anon) return null;
  return createClient(url, anon, { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false } });
}

export function can(staff: Staff | null, min: StaffRole): boolean {
  return !!staff && RANK[staff.role] >= RANK[min];
}

export type SignInResult = { ok: true; access: string; refresh: string; expiresIn: number } | { ok: false; error: string };

export async function signInStaff(email: string, password: string): Promise<SignInResult> {
  const c = authClient();
  const a = admin();
  if (!c || !a) return { ok: false, error: "Supabase isn't configured on this server." };
  const { data, error } = await c.auth.signInWithPassword({ email, password });
  if (error || !data.session) return { ok: false, error: "Email or password didn't match." };
  const { data: row } = await a.from("staff").select("*").eq("user_id", data.user.id).eq("active", true).maybeSingle();
  if (!row) {
    await c.auth.signOut().catch(() => {});
    return { ok: false, error: "This account isn't on the staff list. Ask the owner to add you." };
  }
  return { ok: true, access: data.session.access_token, refresh: data.session.refresh_token, expiresIn: data.session.expires_in ?? 3600 };
}

export async function refreshStaff(refreshToken: string): Promise<SignInResult> {
  const c = authClient();
  if (!c) return { ok: false, error: "unconfigured" };
  const { data, error } = await c.auth.refreshSession({ refresh_token: refreshToken });
  if (error || !data.session) return { ok: false, error: "expired" };
  return { ok: true, access: data.session.access_token, refresh: data.session.refresh_token, expiresIn: data.session.expires_in ?? 3600 };
}

export const cookieOpts = (path = "/") => ({ httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path });

/** Current staff from cookies. `needsRefresh` = the access token is gone/expired but a refresh token exists. */
export async function currentStaff(): Promise<{ staff: Staff | null; needsRefresh: boolean }> {
  const jar = await cookies();
  // Owner mode (env password) — always available, even without Supabase.
  if (ownerCookieValid(jar.get(OWNER_COOKIE)?.value)) {
    return { staff: { userId: null, name: "Owner", email: "", role: "owner", ownerMode: true }, needsRefresh: false };
  }
  const at = jar.get(AT_COOKIE)?.value;
  const rt = jar.get(RT_COOKIE)?.value;
  const a = admin();
  if (!a) return { staff: null, needsRefresh: false };
  if (at) {
    const { data } = await a.auth.getUser(at);
    if (data.user) {
      const { data: row } = await a.from("staff").select("*").eq("user_id", data.user.id).eq("active", true).maybeSingle();
      if (row) {
        const r = row as StaffRow;
        return { staff: { userId: r.user_id, name: r.name || r.email, email: r.email, role: r.role }, needsRefresh: false };
      }
      return { staff: null, needsRefresh: false };
    }
  }
  return { staff: null, needsRefresh: !!rt };
}

export function adminEnabled() {
  return supabaseConfigured || ownerEnabled();
}

/** Create a staff login (owner only): an auth user with a password, plus the staff row. */
export async function createStaff(input: { name: string; email: string; password: string; role: StaffRole }): Promise<{ ok: true } | { ok: false; error: string }> {
  const a = admin();
  if (!a) return { ok: false, error: "Supabase isn't configured." };
  const email = input.email.trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) return { ok: false, error: "That doesn't look like an email address." };
  if (input.password.length < 8) return { ok: false, error: "Password needs 8+ characters." };
  // Reuse an existing auth user with this email (e.g. re-adding someone) rather than failing.
  let userId: string | null = null;
  const created = await a.auth.admin.createUser({ email, password: input.password, email_confirm: true, user_metadata: { name: input.name, staff: true } });
  if (created.data.user) userId = created.data.user.id;
  else {
    const list = await a.auth.admin.listUsers({ page: 1, perPage: 200 });
    const existing = list.data.users.find((u) => u.email?.toLowerCase() === email);
    if (!existing) return { ok: false, error: created.error?.message ?? "Couldn't create the login." };
    userId = existing.id;
    await a.auth.admin.updateUserById(userId, { password: input.password });
  }
  const { error } = await a.from("staff").upsert({ user_id: userId, name: input.name.trim(), email, role: input.role, active: true });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
