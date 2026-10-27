import { NextResponse } from "next/server";
import { FOOD_BY_ID, FOODS, gramsFor, macrosFor, searchFood, type Food, type Macros } from "@f7/content";

export const runtime = "nodejs";

/**
 * GET /api/food/search?q=2 idli
 * → { total, hits: [{ id, name, serving, kcal, protein, carbs, fat, veg, brand? }] }
 *
 * The same search engine the app uses, open to the public website so visitors
 * can try the calorie tracker before joining. Read-only, no sign-in, small.
 */
type Hit = { id: string; name: string; serving: string; kcal: number; protein: number; carbs: number; fat: number; veg: boolean; brand?: string };

const r1 = (n: number) => Math.round(n * 10) / 10;
const add = (a: Macros, b: Macros): Macros => ({ kcal: a.kcal + b.kcal, proteinG: a.proteinG + b.proteinG, carbsG: a.carbsG + b.carbsG, fatG: a.fatG + b.fatG });

export async function GET(request: Request) {
  const q = (new URL(request.url).searchParams.get("q") ?? "").slice(0, 60);
  if (!q.trim()) return NextResponse.json({ total: FOODS.length, hits: [] });

  const res = searchFood(q, { limit: 6 });
  const hits: Hit[] = [];
  for (const h of res.hits) {
    if (h.kind === "food" && h.food) {
      const f: Food = h.food;
      const { grams, label } = gramsFor(f, res.qty, res.unit);
      const m = macrosFor(f, grams);
      hits.push({ id: f.id, name: f.name, serving: label, kcal: Math.round(m.kcal), protein: r1(m.proteinG), carbs: r1(m.carbsG), fat: r1(m.fatG), veg: f.veg, brand: f.brand });
    } else if (h.kind === "combo" && h.combo) {
      const c = h.combo;
      const n = res.qty ?? 1;
      let m: Macros = { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0 };
      let veg = true;
      for (const p of c.parts) {
        const f = FOOD_BY_ID[p.id];
        if (!f) continue;
        veg &&= f.veg;
        m = add(m, macrosFor(f, p.id === c.countable ? p.grams * n : p.grams));
      }
      hits.push({ id: c.id, name: c.name, serving: n !== 1 && c.countable ? `${n} × ${FOOD_BY_ID[c.countable]?.name.toLowerCase() ?? ""} plate` : "1 plate", kcal: Math.round(m.kcal), protein: r1(m.proteinG), carbs: r1(m.carbsG), fat: r1(m.fatG), veg });
    }
    if (hits.length >= 5) break;
  }
  return NextResponse.json(
    { total: FOODS.length, hits, didYouMean: res.didYouMean },
    { headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" } },
  );
}
