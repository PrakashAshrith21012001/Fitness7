import "server-only";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

/**
 * Server-side Supabase. Two clients:
 *
 *  admin()  — the secret key. Bypasses RLS. Used for leads, rate limits and
 *             the owner dashboard. Never reaches the browser or the app.
 *  userFromRequest() — verifies the app's JWT (Authorization: Bearer …) and
 *             returns the auth user, so a route can act for exactly one member.
 *
 * Both return null when the env vars are missing, so local dev without a
 * Supabase project still builds and runs (leads fall back to the JSONL file).
 */

const url = process.env.SUPABASE_URL?.trim() || process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const secret = (process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY)?.trim();

export const supabaseConfigured = !!url && !!secret;

let adminClient: SupabaseClient | null = null;

export function admin(): SupabaseClient | null {
  if (!supabaseConfigured) return null;
  if (!adminClient) {
    adminClient = createClient(url!, secret!, {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    });
  }
  return adminClient;
}

export type AuthResult = { user: User; token: string } | { user: null; token: null; reason: "no-token" | "invalid" | "unconfigured" };

/** Verify the bearer token the app sends. */
export async function userFromRequest(request: Request): Promise<AuthResult> {
  const c = admin();
  if (!c) return { user: null, token: null, reason: "unconfigured" };
  const auth = request.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!token) return { user: null, token: null, reason: "no-token" };
  const { data, error } = await c.auth.getUser(token);
  if (error || !data.user) return { user: null, token: null, reason: "invalid" };
  return { user: data.user, token };
}
