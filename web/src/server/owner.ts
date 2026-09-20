import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Owner dashboard gate. One password from the env; the cookie holds an HMAC
 * of it (never the password), valid 7 days. No accounts, no database — the
 * dashboard is for one person at the front desk.
 */

export const OWNER_COOKIE = "f7_owner";
const DAYS = 7;

export function ownerEnabled() {
  return !!process.env.OWNER_PASSWORD && process.env.OWNER_PASSWORD.length >= 8;
}

function sign(exp: number) {
  return createHmac("sha256", process.env.OWNER_PASSWORD ?? "").update(`owner:${exp}`).digest("hex");
}

export function issueCookie(): { value: string; maxAge: number } {
  const exp = Date.now() + DAYS * 86_400_000;
  return { value: `${exp}.${sign(exp)}`, maxAge: DAYS * 86_400 };
}

export function cookieValid(value: string | undefined): boolean {
  if (!ownerEnabled() || !value) return false;
  const [expStr, sig] = value.split(".");
  const exp = Number(expStr);
  if (!exp || exp < Date.now() || !sig) return false;
  const want = sign(exp);
  return sig.length === want.length && timingSafeEqual(Buffer.from(sig), Buffer.from(want));
}

export function passwordMatches(input: string): boolean {
  const want = process.env.OWNER_PASSWORD ?? "";
  if (!ownerEnabled() || input.length !== want.length) return false;
  return timingSafeEqual(Buffer.from(input), Buffer.from(want));
}

/** Rough Anthropic list prices → ₹, for the cost line. Update when prices change. */
export const PRICE_USD_PER_M = {
  "claude-haiku-4-5-20251001": { in: 1, out: 5 },
  "claude-sonnet-4-5": { in: 3, out: 15 },
} as const;
export const INR_PER_USD = 84;

export function estimateInr(kind: "food_text" | "food_photo", inputTokens: number, outputTokens: number): number {
  const model = kind === "food_photo" ? process.env.FOOD_PHOTO_MODEL ?? "claude-sonnet-4-5" : process.env.FOOD_TEXT_MODEL ?? "claude-haiku-4-5-20251001";
  const p = (PRICE_USD_PER_M as Record<string, { in: number; out: number }>)[model] ?? (kind === "food_photo" ? PRICE_USD_PER_M["claude-sonnet-4-5"] : PRICE_USD_PER_M["claude-haiku-4-5-20251001"]);
  return ((inputTokens * p.in + outputTokens * p.out) / 1_000_000) * INR_PER_USD;
}
