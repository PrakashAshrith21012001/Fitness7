/**
 * Assertions for shared/tracker.ts and shared/recipes.ts.
 *   node shared/scripts/run-ts.js shared/scripts/tracker.test.ts
 */
import { FOOD_BY_ID, slotForHour } from "../foods";
import { searchFood } from "../food-search";
import {
  TRACKER_MEALS, mealBudget, defaultTargets, mealTargets, fibreFor, totalsOf, budgetVerdict, macroBand, topContributors, highCarbItems,
  healthierSwaps, mealIdeas, bestIdea, alsoHad, USUAL_BY_SLOT, weekTrend, last7, addDays, sleepMinutes, fmtClock, fmtDuration,
  weeklySleepDeficit, bmi, idealRange, weeksToGoal, goalLabel, kgToLb, lbToKg, workoutGoalKcal, pctLabel, isMealSlot, type LogItem,
} from "../tracker";
import { RECIPES, RECIPE_CATEGORIES, recipeNutrition, recipesIn, searchRecipes, similarRecipes } from "../recipes";
import { fibrePer100 } from "../tracker";

let failed = 0;
let passed = 0;
function eq(name: string, got: unknown, want: unknown) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (ok) passed++;
  else {
    failed++;
    console.log(`FAIL ${name} — got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);
  }
}
function ok(name: string, cond: boolean, detail = "") {
  eq(name + (detail ? ` (${detail})` : ""), cond, true);
}

/* meals & budgets — the video's 1,500 day: 375 / 188 / 375 / 188 / 375 */
eq("five meals in order", TRACKER_MEALS.map((m) => m.label), ["Breakfast", "Morning Snack", "Lunch", "Evening Snack", "Dinner"]);
eq("shares add to 1", Math.round(TRACKER_MEALS.reduce((a, m) => a + m.share, 0) * 1000) / 1000, 1);
eq("1500 split", TRACKER_MEALS.map((m) => mealBudget(1500, m.id)), [375, 188, 375, 188, 375]);
eq("default targets 1500 → 75/50/188/30", defaultTargets(1500), { kcal: 1500, proteinG: 75, fatG: 50, carbsG: 188, fibreG: 30 });
eq("breakfast share of targets", mealTargets(defaultTargets(1500), "breakfast"), { kcal: 375, proteinG: 19, fatG: 13, carbsG: 47, fibreG: 8 });
ok("isMealSlot", isMealSlot("morning_snack") && !isMealSlot("brunch"));
eq("slotForHour", [7, 10, 13, 17, 21, 2].map(slotForHour), ["breakfast", "morning_snack", "lunch", "snacks", "dinner", "dinner"]);

/* every id the tracker and recipes reference exists */
const ideaIds = (["breakfast", "morning_snack", "lunch", "snacks", "dinner"] as const).flatMap((s) => mealIdeas(s).flatMap((i) => i.items.map((x) => x.food.id)));
ok("meal ideas resolve", ideaIds.length >= 30, `${ideaIds.length} items`);
for (const s of ["breakfast", "morning_snack", "lunch", "snacks", "dinner"] as const) {
  for (const id of USUAL_BY_SLOT[s]) ok(`usual food exists: ${s}/${id}`, !!FOOD_BY_ID[id]);
  for (const idea of mealIdeas(s)) ok(`idea complete: ${idea.title}`, idea.items.length > 0 && idea.kcal > 0);
}
for (const r of RECIPES) ok(`recipe food exists: ${r.id} → ${r.foodId}`, !!FOOD_BY_ID[r.foodId]);
ok("every recipe category has recipes", RECIPE_CATEGORIES.every((c) => recipesIn(c.id).length >= 2));
ok("recipe ids unique", new Set(RECIPES.map((r) => r.id)).size === RECIPES.length);

/* the video's pongal: 1 katori ven pongal without ghee ~114 Cal → food detail numbers come from macrosFor */
const pongal = searchFood("ven pongal", { limit: 1 }).hits[0];
ok("ven pongal found", pongal?.id === "pongal", pongal?.id);

/* fibre */
eq("fibre idli 120 g", fibreFor({ foodId: "idli", grams: 120, carbsG: 33 }), 1.8);
eq("fibre unknown capped by grams", fibreFor({ grams: 50, carbsG: 60 }), 1.5);
ok("fibre per 100 g ≥ 0 for all foods", Object.values(FOOD_BY_ID).every((f) => fibrePer100(f) >= 0));

/* a day like the video's breakfast */
const T = "2026-10-02";
const mk = (id: string, meal: LogItem["meal"], name: string, foodId: string | undefined, grams: number, kcal: number, p: number, c: number, f: number, date = T): LogItem => ({ id, date, meal, name, foodId, grams, kcal, proteinG: p, carbsG: c, fatG: f, loggedAt: `${date}T08:00:00Z` });
const day: LogItem[] = [
  mk("a", "breakfast", "Coconut Water", "tender-coconut", 300, 32, 0.6, 7, 0.3),
  mk("b", "breakfast", "Pongal", "pongal", 100, 134, 4, 22, 4.2),
  mk("c", "breakfast", "Idli (Plain)", "idli", 55, 73, 2.1, 15.3, 0.2),
  mk("d", "breakfast", "Ven Pongal without Ghee", "pongal", 120, 114, 3.7, 23.7, 0.5),
];
const t = totalsOf(day);
eq("day kcal 353", t.kcal, 353);
eq("day count", t.count, 4);
ok("fibre summed", t.fibreG > 3 && t.fibreG < 8, String(t.fibreG));
eq("day verdict 24 % with meals left → low", budgetVerdict(353, 1500, "day", false).mood, "low");
eq("day pct label", pctLabel(353, 1500), "24%");
eq("breakfast verdict 94 % → balanced", budgetVerdict(353, 375, "breakfast", true).mood, "balanced");
ok("breakfast line names the meal", budgetVerdict(353, 375, "breakfast", true).line.includes("Breakfast"));
eq("over", budgetVerdict(500, 375, "breakfast", true).mood, "over");
eq("empty", budgetVerdict(0, 375, "lunch", false).mood, "empty");
eq("macro bands", [macroBand(10, 75), macroBand(70, 75), macroBand(69, 47)], ["under", "on", "over"]);
eq("top contributor first", topContributors(day, 2).map((c) => c.name), ["Pongal", "Ven Pongal without Ghee"]);
ok("contributor shares sum ≤ 1", topContributors(day).reduce((a, c) => a + c.share, 0) <= 1.0001);
eq("high carb flags pongal & idli, not coconut water", highCarbItems(day).map((e) => e.id).sort(), ["b", "c", "d"]);

/* swaps are lower-calorie, same category */
const swaps = healthierSwaps("parotta");
ok("parotta has swaps", swaps.length > 0, String(swaps.length));
ok("swaps are lighter", swaps.every((s) => s.kcal < 297), swaps.map((s) => `${s.food.id}:${s.kcal}`).join(","));
eq("no swaps for unknown", healthierSwaps(undefined), []);

/* ideas */
const idea = bestIdea("breakfast", 375)!;
ok("best breakfast idea near 375", Math.abs(idea.kcal - 375) < 150, `${idea.title} ${idea.kcal}`);

/* also had */
const also = alsoHad(["idli"], "breakfast", ["tender-coconut"]);
ok("idli → sambar or chutney suggested", also.includes("sambar") || also.includes("chutney"), also.join(","));
ok("a drink alone pulls no plate partners", alsoHad(["tea"], "breakfast", []).slice(0, 3).every((id) => USUAL_BY_SLOT.breakfast.includes(id)), alsoHad(["tea"], "breakfast", []).join(","));
ok("never suggests what was added", !also.includes("idli") && !also.includes("tender-coconut"));

/* week */
eq("last7 oldest first", last7(T), ["2026-09-26", "2026-09-27", "2026-09-28", "2026-09-29", "2026-09-30", "2026-10-01", "2026-10-02"]);
eq("addDays across month", addDays("2026-10-01", -1), "2026-09-30");
const wk = weekTrend([...day, mk("e", "lunch", "Rice", "rice", 150, 195, 4, 42, 0.4, "2026-09-30")], T, "kcal");
eq("week total", wk.total, 548);
eq("week avg per day /7", wk.avg, 78);
eq("logged days", wk.loggedDays, 2);

/* sleep */
eq("sleep across midnight", sleepMinutes("23:30", "07:30"), 480);
eq("sleep same day nap", sleepMinutes("14:00", "15:30"), 90);
eq("clock", [fmtClock("23:30"), fmtClock("07:30"), fmtClock("00:05"), fmtClock("12:00")], ["11:30 PM", "07:30 AM", "12:05 AM", "12:00 PM"]);
eq("duration", [fmtDuration(480), fmtDuration(445)], ["8h", "7h 25m"]);
eq("weekly deficit only counts logged nights", weeklySleepDeficit({ "2026-10-01": 420, "2026-10-02": 480, "2026-09-20": 0 }, T, 8), 1);

/* weight — the video: 73 kg, 175 cm → BMI 23.84, range 56.7–76.3 */
eq("bmi", bmi(73, 175), 23.84);
eq("ideal range 175 cm", idealRange(175), { min: 56.7, max: 76.3 });
eq("weeks to lose 7.5 kg", weeksToGoal(72.5, 65), 15);
eq("weeks to goal at goal", weeksToGoal(65, 65), 0);
eq("goal label kg", goalLabel(72.5, 65), "Lose 7.5 kg");
eq("goal label lb", goalLabel(72.5, 65, "lb"), "Lose 16.5 lbs");
eq("goal label gain", goalLabel(60, 64), "Gain 4 kg");
eq("kg↔lb", [kgToLb(72.5), lbToKg(159.83)], [159.83, 72.5]);
eq("workout goal 73 kg ≈ 290", workoutGoalKcal(73), 290);

/* recipes */
const mb = recipeNutrition(RECIPES.find((r) => r.id === "masale-bhat")!, fibrePer100)!;
eq("masala bhat per 100 g from table", mb.per100.kcal, FOOD_BY_ID["masale-bhat"].per100.kcal);
eq("search recipes by ingredient", searchRecipes("ragi").map((r) => r.id).sort(), ["ragi-dosa", "ragi-kanji"]);
ok("similar recipes same category first", similarRecipes(RECIPES[0]).slice(0, 2).every((r) => r.category === RECIPES[0].category));

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
