import "server-only";
import { admin } from "./supabase";

/**
 * Per-member daily limits for the food routes, kept in `api_usage`
 * (one row per member × day × kind) via the `bump_api_usage` function in
 * supabase/schema.sql. Tokens are added to the same row so the owner
 * dashboard can show what the feature costs.
 */

export const LIMITS = { food_text: 200, food_photo: 20 } as const;
export type UsageKind = keyof typeof LIMITS;

export async function usedToday(memberId: string, kind: UsageKind): Promise<number> {
  const c = admin();
  if (!c) return 0;
  const { data } = await c
    .from("api_usage")
    .select("count")
    .eq("member_id", memberId)
    .eq("kind", kind)
    .eq("date", new Date().toISOString().slice(0, 10))
    .maybeSingle();
  return (data?.count as number | undefined) ?? 0;
}

/** Record one call (+tokens). Returns the new count for today. */
export async function bump(memberId: string, kind: UsageKind, inputTokens: number, outputTokens: number): Promise<number> {
  const c = admin();
  if (!c) return 0;
  const { data, error } = await c.rpc("bump_api_usage", { p_member: memberId, p_kind: kind, p_in: inputTokens, p_out: outputTokens });
  if (error) {
    console.error("food: bump_api_usage failed", error.message);
    return 0;
  }
  return (data as number) ?? 0;
}

export const LIMIT_MESSAGE: Record<UsageKind, string> = {
  food_text: "You've logged a lot today — text logging resets at midnight. You can still add from Recent.",
  food_photo: "20 photos a day is the limit — type the meal instead and it still counts.",
};
