import { NextResponse } from "next/server";
import { appendLead, type Lead } from "@/server/leads";
import { notifyOwner } from "@/server/whatsapp";

export const runtime = "nodejs";

/** Crude per-IP throttle. Replace with Upstash/Redis when this goes live. */
const hits = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

/**
 * Idempotency: the form sends one key per enquiry (header + body). A retry,
 * double tap or flaky-network resend with the same key gets the same "ok"
 * without a second lead. Kept 10 minutes in memory; the key is also the lead
 * id, so the database rejects a duplicate even across restarts.
 */
const seen = new Map<string, number>();
const KEY_TTL_MS = 10 * 60_000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function alreadyHandled(key: string | null) {
  if (!key) return false;
  const now = Date.now();
  for (const [k, t] of seen) if (now - t > KEY_TTL_MS) seen.delete(k);
  return seen.has(key);
}

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many messages. Please try again in a minute." },
      { status: 429 },
    );
  }

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const keyRaw = request.headers.get("idempotency-key") ?? String(payload.idempotencyKey ?? "");
  const key = UUID.test(keyRaw) ? keyRaw : null;
  if (alreadyHandled(key)) return NextResponse.json({ ok: true, duplicate: true });

  // Honeypot: bots fill the hidden field, so accept and silently drop.
  if (typeof payload.company === "string" && payload.company.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const name = String(payload.name ?? "").trim();
  const phone = String(payload.phone ?? "").trim();

  if (name.length < 2) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }
  // Be liberal in what we accept (Postel): spaces, dashes, brackets, +91 or a leading 0.
  if (!/^[0-9+()\s-]{10,18}$/.test(phone) || phone.replace(/\D/g, "").length < 10) {
    return NextResponse.json(
      { error: "Please enter a valid phone number." },
      { status: 400 },
    );
  }

  const lead: Lead = {
    id: key ?? crypto.randomUUID(),
    name,
    phone,
    interest: payload.interest ? String(payload.interest).slice(0, 80) : undefined,
    message: payload.message ? String(payload.message).slice(0, 1000) : undefined,
    source: payload.source === "app" ? "app" : "website",
    createdAt: new Date().toISOString(),
  };

  if (key) seen.set(key, Date.now());
  const inserted = await appendLead(lead);
  if (inserted) await notifyOwner(lead);

  return NextResponse.json({ ok: true });
}
