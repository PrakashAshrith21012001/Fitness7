import "server-only";
import { matchFood, macrosFor, type MealSlot, type FoodSource } from "@f7/content";

/**
 * Shared plumbing for /api/food/parse and /api/food/photo:
 * one tool-use call to Claude, then a sanitiser that refuses to pass on
 * numbers that don't add up.
 */

export type FoodItem = {
  name: string;
  foodId?: string;
  grams: number;
  portionLabel: string;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  confidence: number;
  source: FoodSource;
  needsConfirm: boolean;
  estimate?: boolean;
};

export type ModelItem = {
  name: string;
  grams: number;
  portionLabel: string;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  confidence: number;
  needsConfirm: boolean;
};

export type ToolResult<T> = { input: T; inputTokens: number; outputTokens: number };

type ContentBlock = { type: "text"; text: string } | { type: "image"; source: { type: "base64"; media_type: "image/jpeg"; data: string } };

export async function callTool<T>(opts: {
  model: string;
  system: string;
  content: ContentBlock[];
  tool: { name: string; description: string; input_schema: unknown };
  maxTokens: number;
  timeoutMs?: number;
}): Promise<ToolResult<T> | { error: string; status: number }> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return { error: "Food logging isn't switched on yet — ask the gym.", status: 503 };
  let res: Response;
  try {
    res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model: opts.model,
        max_tokens: opts.maxTokens,
        temperature: 0,
        system: opts.system,
        tools: [opts.tool],
        tool_choice: { type: "tool", name: opts.tool.name },
        messages: [{ role: "user", content: opts.content }],
      }),
      signal: AbortSignal.timeout(opts.timeoutMs ?? 30_000),
    });
  } catch (e) {
    console.error("food: upstream fetch failed", e);
    return { error: "Couldn't reach the analyser. Check your connection and try again.", status: 502 };
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("food: upstream", res.status, text.slice(0, 300));
    return { error: res.status === 429 ? "The analyser is busy — try again in a minute." : "The analyser had a problem. Try again.", status: 502 };
  }
  const json = (await res.json()) as {
    content?: { type: string; name?: string; input?: unknown }[];
    usage?: { input_tokens?: number; output_tokens?: number };
  };
  const block = json.content?.find((c) => c.type === "tool_use" && c.name === opts.tool.name);
  if (!block?.input) return { error: "The analyser returned nothing usable. Try again.", status: 502 };
  return { input: block.input as T, inputTokens: json.usage?.input_tokens ?? 0, outputTokens: json.usage?.output_tokens ?? 0 };
}

const num = (v: unknown, min: number, max: number, dflt = 0) => {
  const n = typeof v === "number" && Number.isFinite(v) ? v : Number(v);
  if (!Number.isFinite(n)) return dflt;
  return Math.min(max, Math.max(min, n));
};

/**
 * Never trust the model blindly:
 *  - drop empty / impossible items
 *  - if kcal disagrees with the macros by >35 %, recompute from the macros and lower confidence
 *  - if the name matches our table well (≥0.9), swap in the table's numbers for those grams
 *  - photo confidence is capped at 0.85; anything <0.75 needs confirmation
 */
export function sanitise(items: unknown, source: "model" | "photo"): FoodItem[] {
  if (!Array.isArray(items)) return [];
  const out: FoodItem[] = [];
  for (const raw of items.slice(0, 12)) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as Partial<ModelItem>;
    const name = String(r.name ?? "").trim().slice(0, 60);
    const grams = Math.round(num(r.grams, 1, 2000));
    if (!name || grams <= 0) continue;
    let kcal = Math.round(num(r.kcal, 0, 3000));
    let proteinG = Math.round(num(r.proteinG, 0, 300) * 10) / 10;
    let carbsG = Math.round(num(r.carbsG, 0, 500) * 10) / 10;
    let fatG = Math.round(num(r.fatG, 0, 300) * 10) / 10;
    let confidence = num(r.confidence, 0, 1, 0.5);
    let foodId: string | undefined;
    let estimate: boolean | undefined;
    let src: FoodSource = source;

    const m = matchFood(name);
    if (m && m.kind === "food" && m.food && m.score >= 0.9) {
      const mac = macrosFor(m.food, grams);
      kcal = mac.kcal;
      proteinG = mac.proteinG;
      carbsG = mac.carbsG;
      fatG = mac.fatG;
      foodId = m.food.id;
      estimate = !!m.food.estimate;
      src = source === "photo" ? "photo" : "table"; // photo keeps its origin (the portion is still a guess)
    } else {
      const fromMacros = proteinG * 4 + carbsG * 4 + fatG * 9;
      if (kcal > 0 && Math.abs(fromMacros - kcal) > 0.35 * kcal) {
        kcal = Math.round(fromMacros);
        confidence = Math.max(0, confidence - 0.1);
      } else if (kcal === 0 && fromMacros > 0) {
        kcal = Math.round(fromMacros);
      }
    }
    if (source === "photo") confidence = Math.min(confidence, 0.85);
    confidence = Math.round(confidence * 100) / 100;
    out.push({
      name,
      foodId,
      grams,
      portionLabel: String(r.portionLabel ?? `${grams} g`).slice(0, 40),
      kcal,
      proteinG,
      carbsG,
      fatG,
      confidence,
      source: src,
      needsConfirm: !!r.needsConfirm || confidence < 0.75,
      estimate,
    });
  }
  return out;
}

export function slotFrom(v: unknown, fallback: MealSlot): MealSlot {
  return v === "breakfast" || v === "lunch" || v === "snacks" || v === "dinner" ? v : fallback;
}

export const HANDOFF_NOTE = "That's one for a coach, not an app — message us on WhatsApp and a Fitness 7 coach will talk it through with you.";
