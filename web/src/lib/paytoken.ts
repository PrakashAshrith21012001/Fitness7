import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Renewal pay-link tokens: /pay/<token>.
 *
 * Stateless — the token is the member id + the end date it was sent for,
 * signed with a server secret. No table needed, nothing to expire by hand:
 * once the member renews, their end date moves on and the old link simply
 * says "already renewed".
 *
 * Layout (56 chars): 32 hex (member uuid without dashes) · 8 digits (yyyymmdd) · 16 hex signature.
 */

const sig = (body: string, secret: string) => createHmac("sha256", secret).update(`pay:${body}`).digest("hex").slice(0, 16);

export function signPayToken(memberId: string, endsOn: string, secret: string): string | null {
  const hex = memberId.replace(/-/g, "").toLowerCase();
  const day = endsOn.replace(/-/g, "");
  if (!/^[0-9a-f]{32}$/.test(hex) || !/^\d{8}$/.test(day) || !secret) return null;
  const body = hex + day;
  return body + sig(body, secret);
}

export function verifyPayToken(token: string, secret: string): { memberId: string; endsOn: string } | null {
  if (!secret || !/^[0-9a-f]{32}\d{8}[0-9a-f]{16}$/.test(token)) return null;
  const body = token.slice(0, 40);
  const want = sig(body, secret);
  const got = token.slice(40);
  if (!timingSafeEqual(Buffer.from(got), Buffer.from(want))) return null;
  const h = body.slice(0, 32);
  const d = body.slice(32);
  return {
    memberId: `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`,
    endsOn: `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6)}`,
  };
}
