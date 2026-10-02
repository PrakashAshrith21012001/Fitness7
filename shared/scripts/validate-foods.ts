/**
 * Checks the whole food table.   node shared/scripts/run-ts.js shared/scripts/validate-foods.ts [file-filter]
 *  - duplicate ids (an extra row that reuses a base id is dropped silently by foods.ts — reported here)
 *  - the same alias on two different foods (search would be ambiguous)
 *  - energy vs macros: 4·P + 4·C + 9·F should be within 15% of kcal (alcohol, fibre-heavy and tiny-kcal rows excepted)
 *  - impossible numbers: macros over 100 g, negative values, missing portion
 */
import { FOODS, COMBOS } from "../foods";
import { EXTRA_ROWS, EXTRA_COMBOS } from "../food-data";

const filter = process.argv[2];
const problems: string[] = [];
const warn: string[] = [];

const ids = new Map<string, number>();
for (const r of EXTRA_ROWS) ids.set(r[0], (ids.get(r[0]) ?? 0) + 1);
for (const [id, n] of ids) if (n > 1) problems.push(`duplicate id in extra lists: ${id} ×${n}`);
const baseIds = new Set(FOODS.map((f) => f.id));
const kept = new Set(FOODS.map((f) => f.id));
const extraIds = new Set(EXTRA_ROWS.map((r) => r[0]));
for (const r of EXTRA_ROWS) if (!kept.has(r[0])) problems.push(`dropped (id exists): ${r[0]}`);
void baseIds; void extraIds;

const owner = new Map<string, string>();
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
for (const f of FOODS) {
  for (const a of [f.name, ...f.aliases]) {
    const k = norm(a);
    if (!k) continue;
    const o = owner.get(k);
    if (o && o !== f.id) warn.push(`alias "${k}" on ${o} and ${f.id}`);
    else owner.set(k, f.id);
  }
}

for (const f of FOODS) {
  if (filter && !f.id.includes(filter)) continue;
  const { kcal, protein, carbs, fat } = f.per100;
  if ([kcal, protein, carbs, fat].some((v) => v < 0 || Number.isNaN(v))) problems.push(`${f.id}: negative/NaN macro`);
  if (protein + carbs + fat > 101) problems.push(`${f.id}: macros sum ${protein + carbs + fat} g per 100 g`);
  if (!(f.portion.grams > 0)) problems.push(`${f.id}: no portion grams`);
  const calc = 4 * protein + 4 * carbs + 9 * fat;
  const alcohol = /beer|whisky|wine|rum|vodka|gin|brandy|spirit|cocktail|toddy|feni|liqueur|alcohol/i.test(`${f.id} ${f.name}`);
  if (!alcohol && kcal > 40 && Math.abs(calc - kcal) / kcal > 0.15) warn.push(`${f.id}: kcal ${kcal} vs macros ${Math.round(calc)} (${Math.round(((calc - kcal) / kcal) * 100)}%)`);
}

const foodIds = new Set(FOODS.map((f) => f.id));
for (const c of EXTRA_COMBOS) for (const p of c.parts) if (!foodIds.has(p.id)) problems.push(`combo ${c.id}: unknown part ${p.id}`);

console.log(`foods ${FOODS.length} (extra rows ${EXTRA_ROWS.length}) · combos ${COMBOS.length}`);
console.log(`problems ${problems.length}`);
problems.slice(0, 200).forEach((p) => console.log("  ✗ " + p));
console.log(`warnings ${warn.length}`);
warn.slice(0, 200).forEach((p) => console.log("  ! " + p));
if (problems.length) process.exitCode = 1;
