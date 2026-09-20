import { NextResponse } from "next/server";
import { SYSTEM_PROMPT, localAnswer, fallbackAnswer, greeting, CHIPS, type Reply } from "@/server/assistant";

export const runtime = "nodejs";

type Msg = { role: "user" | "assistant"; content: string };

/** Crude per-IP throttle; swap for Upstash when live. */
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 20;
}

const MODEL = process.env.ASSISTANT_MODEL ?? "claude-haiku-4-5-20251001";

async function askClaude(messages: Msg[]): Promise<string | null> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages: messages.slice(-10),
      }),
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) {
      console.error("assistant: upstream", res.status, await res.text());
      return null;
    }
    const json = (await res.json()) as { content?: { type: string; text?: string }[] };
    const text = json.content?.find((c) => c.type === "text")?.text?.trim();
    return text || null;
  } catch (err) {
    console.error("assistant: fetch failed", err);
    return null;
  }
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (limited(ip)) {
    return NextResponse.json({ error: "Slow down a little — try again in a minute." }, { status: 429 });
  }

  let body: { messages?: Msg[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const messages = (body.messages ?? [])
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map((m) => ({ role: m.role, content: m.content.slice(0, 1000) }));

  const last = [...messages].reverse().find((m) => m.role === "user");
  if (!last) return NextResponse.json<Reply>(greeting());

  // 1. The common questions are answered deterministically, key or no key.
  //    Chips always land here, so the owner's numbers come out verbatim.
  const local = localAnswer(last.content);
  const isChip = (CHIPS.home as readonly string[]).includes(last.content) || last.content.length < 28;
  if (local && isChip) return NextResponse.json<Reply>(local);

  // 2. Free text goes to Claude, grounded on the same facts.
  const ai = await askClaude(messages);
  if (ai) return NextResponse.json<Reply>({ reply: ai, chips: [...CHIPS.home].slice(0, 4), source: "claude" });

  // 3. No key or upstream down: best local match, else a warm handoff.
  return NextResponse.json<Reply>(local ?? fallbackAnswer());
}
