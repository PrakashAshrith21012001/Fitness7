import { NextResponse } from "next/server";
import { parseLocal, slotForHour, type MealSlot } from "@f7/content";
import { userFromRequest } from "@/server/supabase";
import { LIMITS, LIMIT_MESSAGE, bump, usedToday } from "@/server/food-limits";
import { LOG_ITEMS_TOOL, textSystem } from "@/server/food-prompts";
import { HANDOFF_NOTE, callTool, sanitise, slotFrom, type FoodItem } from "@/server/food";

export const runtime = "nodejs";

const MODEL = process.env.FOOD_TEXT_MODEL ?? "claude-haiku-4-5-20251001";

type Body = { text?: string; memberContext?: { goal?: string; targetKcal?: number; hour?: number } };
type ToolOut = { items: unknown; mealSlot?: string; handoff?: boolean; notes?: string };

/**
 * POST /api/food/parse  { text, memberContext? }
 * → { items, mealSlot, notes, handoff, usage }
 *
 * The table (shared/foods.ts) resolves what it can; only unmatched fragments
 * go to Claude, grounded on the matched items. Requires the app's JWT.
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
  const text = String(body.text ?? "").trim().slice(0, 400);
  if (text.length < 2) return NextResponse.json({ error: "Type what you ate first." }, { status: 400 });

  const hour = typeof body.memberContext?.hour === "number" ? body.memberContext.hour : new Date().getUTCHours() + 5.5;
  const defaultSlot: MealSlot = slotForHour(Math.floor(hour) % 24);

  const local = parseLocal(text);
  const items: FoodItem[] = local.items.map((i) => ({ ...i, source: "table" as const }));
  let mealSlot: MealSlot = local.mealSlot ?? defaultSlot;
  let notes: string | null = null;
  let handoff = false;
  const usage = { modelCalled: false, inputTokens: 0, outputTokens: 0, remainingToday: 0 };

  const used = await usedToday(auth.user.id, "food_text");
  usage.remainingToday = Math.max(0, LIMITS.food_text - used);

  if (local.unmatched.length) {
    if (used >= LIMITS.food_text) {
      // Still return what the table found; only the model part is limited.
      if (!items.length) return NextResponse.json({ error: LIMIT_MESSAGE.food_text }, { status: 429 });
      notes = `Couldn't read "${local.unmatched.join(", ")}" — daily limit for the analyser reached.`;
    } else {
      const matchedJson = JSON.stringify(items.map((i) => ({ name: i.name, grams: i.grams, kcal: i.kcal })));
      const res = await callTool<ToolOut>({
        model: MODEL,
        system: textSystem(matchedJson, local.unmatched.join(", "), mealSlot),
        content: [{ type: "text", text }],
        tool: LOG_ITEMS_TOOL,
        maxTokens: 400,
      });
      if ("error" in res) {
        if (!items.length) return NextResponse.json({ error: res.error }, { status: res.status });
        notes = `Couldn't read "${local.unmatched.join(", ")}" right now.`;
      } else {
        usage.modelCalled = true;
        usage.inputTokens = res.inputTokens;
        usage.outputTokens = res.outputTokens;
        const count = await bump(auth.user.id, "food_text", res.inputTokens, res.outputTokens);
        usage.remainingToday = Math.max(0, LIMITS.food_text - count);
        handoff = !!res.input.handoff;
        if (handoff) notes = HANDOFF_NOTE;
        else {
          items.push(...sanitise(res.input.items, "model"));
          if (!local.mealSlot) mealSlot = slotFrom(res.input.mealSlot, mealSlot);
          if (res.input.notes) notes = String(res.input.notes).slice(0, 160);
        }
      }
    }
  }

  return NextResponse.json({ items, mealSlot, notes, handoff, usage });
}
