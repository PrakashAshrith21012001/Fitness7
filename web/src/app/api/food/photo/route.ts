import { NextResponse } from "next/server";
import { slotForHour, type MealSlot } from "@f7/content";
import { userFromRequest } from "@/server/supabase";
import { LIMITS, LIMIT_MESSAGE, bump, usedToday } from "@/server/food-limits";
import { LOG_PHOTO_TOOL, photoSystem } from "@/server/food-prompts";
import { HANDOFF_NOTE, callTool, sanitise, slotFrom } from "@/server/food";

export const runtime = "nodejs";

const MODEL = process.env.FOOD_PHOTO_MODEL ?? "claude-sonnet-4-5";
const MAX_BYTES = 600 * 1024;

type Body = { imageBase64?: string; hint?: string; hour?: number };
type ToolOut = { items: unknown; mealSlot?: string; handoff?: boolean; notFood?: boolean; plateDescription?: string; notes?: string };

/**
 * POST /api/food/photo  { imageBase64 (jpeg, ≤1024 px, ≤600 KB), hint?, hour? }
 * → { items, mealSlot, plateDescription, notFood, notes, handoff, usage }
 *
 * The photo is forwarded to Claude in the request and never stored anywhere.
 */
export async function POST(request: Request) {
  const auth = await userFromRequest(request);
  if (!auth.user) return NextResponse.json({ error: auth.reason === "unconfigured" ? "Backend not configured." : "Please sign in again." }, { status: auth.reason === "unconfigured" ? 503 : 401 });

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const b64 = String(body.imageBase64 ?? "").replace(/^data:image\/\w+;base64,/, "");
  if (!b64 || !/^[A-Za-z0-9+/=\s]+$/.test(b64.slice(0, 200))) return NextResponse.json({ error: "No photo received." }, { status: 400 });
  const bytes = Math.floor((b64.length * 3) / 4);
  if (bytes > MAX_BYTES) return NextResponse.json({ error: "That photo is too big — the app should resize it. Try again." }, { status: 413 });
  // JPEG magic: /9j/
  if (!b64.startsWith("/9j/")) return NextResponse.json({ error: "Please send a JPEG photo." }, { status: 400 });

  const used = await usedToday(auth.user.id, "food_photo");
  if (used >= LIMITS.food_photo) return NextResponse.json({ error: LIMIT_MESSAGE.food_photo }, { status: 429 });

  const hour = typeof body.hour === "number" ? body.hour : new Date().getUTCHours() + 5.5;
  const defaultSlot: MealSlot = slotForHour(Math.floor(hour) % 24);
  const hint = String(body.hint ?? "").trim().slice(0, 120);

  const res = await callTool<ToolOut>({
    model: MODEL,
    system: photoSystem(hint, defaultSlot),
    content: [
      { type: "image", source: { type: "base64", media_type: "image/jpeg", data: b64 } },
      { type: "text", text: "Log this." },
    ],
    tool: LOG_PHOTO_TOOL,
    maxTokens: 700,
    timeoutMs: 45_000,
  });
  if ("error" in res) return NextResponse.json({ error: res.error }, { status: res.status });

  const count = await bump(auth.user.id, "food_photo", res.inputTokens, res.outputTokens);
  const usage = { modelCalled: true, inputTokens: res.inputTokens, outputTokens: res.outputTokens, remainingToday: Math.max(0, LIMITS.food_photo - count) };

  const notFood = !!res.input.notFood;
  const handoff = !!res.input.handoff;
  const plateDescription = String(res.input.plateDescription ?? "").slice(0, 200);
  const items = notFood || handoff ? [] : sanitise(res.input.items, "photo");
  const notes = handoff ? HANDOFF_NOTE : notFood ? "That doesn't look like a meal — try a photo of the plate." : res.input.notes ? String(res.input.notes).slice(0, 160) : null;

  return NextResponse.json({ items, mealSlot: slotFrom(res.input.mealSlot, defaultSlot), plateDescription, notFood, notes, handoff, usage });
}
