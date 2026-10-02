/**
 * Calorie tracker maths — the HealthifyMe-style tracker (v14).
 *
 * Pure functions only: the app's state lives in mobile/src/state, this file
 * turns a day's log into what the screens show (meal budgets, the calorie
 * budget face, macro bars, top contributors, high-carb flags, healthier
 * swaps, weekly trends, sleep and weight numbers). Everything is tested in
 * shared/scripts/tracker.test.ts.
 */
import { COMBOS, FOODS, FOOD_BY_ID, macrosFor, type Food, type FoodCategory } from "./foods";
import type { MealSlot } from "./supabase-types";

/* ------------------------------------------------------------------ */
/* Meals                                                              */
/* ------------------------------------------------------------------ */

export const TRACKER_MEALS: { id: MealSlot; label: string; share: number; icon: string }[] = [
  { id: "breakfast", label: "Breakfast", share: 0.25, icon: "cafe-outline" },
  { id: "morning_snack", label: "Morning Snack", share: 0.125, icon: "nutrition-outline" },
  { id: "lunch", label: "Lunch", share: 0.25, icon: "restaurant-outline" },
  { id: "snacks", label: "Evening Snack", share: 0.125, icon: "pizza-outline" },
  { id: "dinner", label: "Dinner", share: 0.25, icon: "moon-outline" },
];

export const MEAL_LABEL: Record<MealSlot, string> = Object.fromEntries(TRACKER_MEALS.map((m) => [m.id, m.label])) as Record<MealSlot, string>;

export function isMealSlot(v: unknown): v is MealSlot {
  return typeof v === "string" && TRACKER_MEALS.some((m) => m.id === v);
}

/** Calories for one meal out of the day's budget: 1,500 → 375 / 188 / 375 / 188 / 375. */
export function mealBudget(dayKcal: number, slot: MealSlot): number {
  const m = TRACKER_MEALS.find((x) => x.id === slot)!;
  return Math.round(dayKcal * m.share);
}

/* ------------------------------------------------------------------ */
/* Targets                                                            */
/* ------------------------------------------------------------------ */

export type MacroTargets = { kcal: number; proteinG: number; fatG: number; carbsG: number; fibreG: number };

/** Default split when the member has no numbers yet: 20 % protein · 30 % fat · 50 % carbs, 30 g fibre (1,500 → 75 / 50 / 188). */
export function defaultTargets(kcal = 1500): MacroTargets {
  return {
    kcal,
    proteinG: Math.round((kcal * 0.2) / 4),
    fatG: Math.round((kcal * 0.3) / 9),
    carbsG: Math.round((kcal * 0.5) / 4),
    fibreG: kcal >= 2000 ? 35 : 30,
  };
}

/** Targets for one meal (share of the day). */
export function mealTargets(day: MacroTargets, slot: MealSlot): MacroTargets {
  const share = TRACKER_MEALS.find((m) => m.id === slot)!.share;
  return {
    kcal: Math.round(day.kcal * share),
    proteinG: Math.round(day.proteinG * share),
    fatG: Math.round(day.fatG * share),
    carbsG: Math.round(day.carbsG * share),
    fibreG: Math.round(day.fibreG * share),
  };
}

/* ------------------------------------------------------------------ */
/* Fibre                                                              */
/* ------------------------------------------------------------------ */

/**
 * The food table carries energy, protein, carbs and fat but not fibre.
 * Fibre here is an estimate per 100 g: a value for the common foods (IFCT
 * 2017 / USDA where the dish is close to one ingredient) and a category
 * average for everything else. The UI labels it "est.".
 */
const FIBRE_BY_ID: Record<string, number> = {
  idli: 1.5, "mini-idli": 1.5, dosa: 1.4, "masala-dosa": 1.8, uthappam: 1.6, pesarattu: 3.5, adai: 3.8, appam: 0.8, idiyappam: 0.9, puttu: 2.4,
  pongal: 1.5, upma: 1.6, poha: 1.4, poori: 2.7, chapati: 4.9, parotta: 1.8, rice: 0.4, "brown-rice": 1.8, "curd-rice": 0.5, "lemon-rice": 0.8,
  sambar: 2.3, rasam: 0.6, chutney: 4.5, dal: 2.9, "dal-tadka": 3.0, rajma: 5.4, chole: 5.0, sundal: 6.0, sprouts: 1.8, "sprouts-chaat": 3.5,
  avial: 2.6, poriyal: 3.0, keerai: 2.5, kootu: 2.8, "mixed-veg-curry": 2.4, salad: 1.6, "vegetable-soup": 1.0, "palak-paneer": 1.9,
  egg: 0, milk: 0, curd: 0, paneer: 0, "chicken-breast": 0, banana: 2.6, apple: 2.4, papaya: 1.7, guava: 5.4, orange: 2.4, watermelon: 0.4,
  almonds: 12.5, peanuts: 8.5, walnuts: 6.7, cashews: 3.3, oats: 10.1, "oats-water": 1.7, vada: 3.0, "ragi-dosa": 3.6, "ragi-kanji": 1.2, quinoa: 2.8,
  "tender-coconut": 1.1, buttermilk: 0, tea: 0, "filter-coffee": 0, "thinai-pongal": 2.6, "masale-bhat": 1.6, "matar-pulao": 2.2, "pudina-rice": 1.2,
};

const FIBRE_BY_CATEGORY: Record<FoodCategory, number> = {
  breakfast: 1.6, rice: 0.8, bread: 3.0, dal: 4.0, veg: 2.5, nonveg: 0.4, egg: 0, snack: 2.2, sweet: 0.8, drink: 0.3, fruit: 2.2,
  dairy: 0, protein: 1.0, nuts: 8.0, fastfood: 1.8, north: 2.2, condiment: 1.0,
};

export function fibrePer100(food: Food): number {
  return FIBRE_BY_ID[food.id] ?? FIBRE_BY_CATEGORY[food.category] ?? 1;
}

/** Fibre in grams for a logged item; unknown foods (typed / photo) use 1.5 g per 100 kcal of carbs-heavy food, capped. */
export function fibreFor(item: { foodId?: string; grams: number; carbsG: number }): number {
  const f = item.foodId ? FOOD_BY_ID[item.foodId] : undefined;
  if (f) return Math.round(fibrePer100(f) * item.grams) / 100;
  return Math.round(Math.min(item.carbsG * 0.06, item.grams * 0.03) * 10) / 10;
}

/* ------------------------------------------------------------------ */
/* Day maths                                                          */
/* ------------------------------------------------------------------ */

export type LogItem = {
  id: string;
  date: string;
  meal: MealSlot;
  name: string;
  foodId?: string;
  grams: number;
  portionLabel?: string;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  loggedAt: string;
};

export type DayTotals = { kcal: number; proteinG: number; carbsG: number; fatG: number; fibreG: number; count: number };

export function totalsOf(items: LogItem[]): DayTotals {
  const t = items.reduce(
    (a, e) => ({ kcal: a.kcal + e.kcal, proteinG: a.proteinG + e.proteinG, carbsG: a.carbsG + e.carbsG, fatG: a.fatG + e.fatG, fibreG: a.fibreG + fibreFor(e), count: a.count + 1 }),
    { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0, fibreG: 0, count: 0 },
  );
  return { kcal: Math.round(t.kcal), proteinG: round1(t.proteinG), carbsG: round1(t.carbsG), fatG: round1(t.fatG), fibreG: round1(t.fibreG), count: t.count };
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

/** 0–∞ share; the screens show it as a whole percent. */
export function pct(value: number, target: number): number {
  if (!target || target <= 0) return 0;
  return value / target;
}

export function pctLabel(value: number, target: number): string {
  return `${Math.round(pct(value, target) * 100)}%`;
}

export type BudgetMood = "empty" | "low" | "balanced" | "over";

export type BudgetVerdict = { mood: BudgetMood; pct: number; title: string; line: string };

/**
 * The calorie-budget face.
 *  - nothing logged → empty
 *  - 85–110 % → balanced (green smile)
 *  - over 110 % → over (red)
 *  - under 85 % → low (yellow, "you haven't tracked all meals")
 */
export function budgetVerdict(eaten: number, budget: number, scope: "day" | MealSlot, allMealsLogged: boolean): BudgetVerdict {
  const p = pct(eaten, budget);
  const what = scope === "day" ? "today" : MEAL_LABEL[scope];
  if (eaten <= 0) {
    return { mood: "empty", pct: 0, title: "Nothing tracked yet", line: scope === "day" ? "Track your meals to see how today adds up." : `You haven't tracked your ${what} yet.` };
  }
  if (p > 1.1) {
    return { mood: "over", pct: p, title: "Over budget", line: scope === "day" ? `You're ${Math.round(eaten - budget)} Cal over today's budget. A lighter dinner or a walk evens it out.` : `Your ${what} went ${Math.round(eaten - budget)} Cal over its share. Go lighter at the next meal.` };
  }
  if (p >= 0.85) {
    return { mood: "balanced", pct: p, title: "Nicely balanced", line: scope === "day" ? "Nice work! You stayed inside today's calorie budget." : `Nice work! You had a calorie balanced ${what}!` };
  }
  if (scope === "day" && !allMealsLogged) {
    return { mood: "low", pct: p, title: "Keep tracking", line: "You haven't tracked all meals today. Continue tracking the rest of your meals and stick to your calorie budget for the day." };
  }
  return { mood: "low", pct: p, title: "Under budget", line: scope === "day" ? "You ate well under your budget today. Under-eating slows recovery — add a protein snack." : `Your ${what} was light. Add some protein so you don't snack later.` };
}

/** Bar colour band for a macro: under / on / over. */
export function macroBand(value: number, target: number): "under" | "on" | "over" {
  const p = pct(value, target);
  if (p > 1.1) return "over";
  if (p >= 0.85) return "on";
  return "under";
}

export type Contributor = { id: string; name: string; kcal: number; share: number; meal: MealSlot };

/** Foods that gave the most calories, biggest first, with their share of the total. */
export function topContributors(items: LogItem[], n = 5): Contributor[] {
  const total = items.reduce((a, e) => a + e.kcal, 0) || 1;
  return [...items]
    .sort((a, b) => b.kcal - a.kcal)
    .slice(0, n)
    .map((e) => ({ id: e.id, name: e.name, kcal: e.kcal, share: e.kcal / total, meal: e.meal }));
}

/** Items where most of the energy comes from carbs (≥ 65 %) and carbs are ≥ 15 g. */
export function highCarbItems(items: LogItem[]): LogItem[] {
  return items.filter((e) => e.kcal > 0 && e.carbsG >= 15 && (e.carbsG * 4) / e.kcal >= 0.65).sort((a, b) => b.carbsG - a.carbsG);
}

/** Items that give ≥ 25 % of their energy as protein. */
export function proteinRichItems(items: LogItem[]): LogItem[] {
  return items.filter((e) => e.kcal > 0 && (e.proteinG * 4) / e.kcal >= 0.25);
}

export type Swap = { food: Food; kcal: number; proteinG: number; carbsG: number; label: string };

/**
 * Healthier alternatives for a food: same kind of food (category), common,
 * fewer calories per portion and more protein per calorie. Up to `n`.
 */
export function healthierSwaps(foodId: string | undefined, n = 3): Swap[] {
  const f = foodId ? FOOD_BY_ID[foodId] : undefined;
  if (!f) return [];
  const base = macrosFor(f, f.portion.grams);
  const baseDensity = base.kcal ? base.proteinG / base.kcal : 0;
  const out: Swap[] = [];
  for (const c of FOODS) {
    if (c.id === f.id || c.category !== f.category || c.pop < 2 || c.brand) continue;
    const m = macrosFor(c, c.portion.grams);
    if (!m.kcal || m.kcal > base.kcal * 0.9) continue;
    const density = m.proteinG / m.kcal;
    if (density < baseDensity) continue;
    out.push({ food: c, kcal: m.kcal, proteinG: m.proteinG, carbsG: m.carbsG, label: c.portion.label });
  }
  return out.sort((a, b) => b.proteinG / b.kcal - a.proteinG / a.kcal || b.food.pop - a.food.pop).slice(0, n);
}

/* ------------------------------------------------------------------ */
/* Suggestions                                                        */
/* ------------------------------------------------------------------ */

export type Suggestion = { foodId: string; grams: number; label: string };
export type MealIdea = { title: string; items: { food: Food; grams: number; label: string; kcal: number; proteinG: number }[]; kcal: number; proteinG: number };

const IDEAS: Record<MealSlot, { title: string; items: [string, number, string][] }[]> = {
  breakfast: [
    { title: "Idli, sambar & egg", items: [["idli", 120, "3 idli"], ["sambar", 150, "1 katori"], ["egg", 50, "1 egg"]] },
    { title: "Pesarattu with chutney", items: [["pesarattu", 180, "2 pesarattu"], ["chutney", 40, "2 tbsp"]] },
    { title: "Moong chilla & curd", items: [["moong-dal-chilla", 160, "2 chilla"], ["curd", 100, "1 small katori"]] },
    { title: "Ragi dosa & sambar", items: [["ragi-dosa", 160, "2 ragi dosa"], ["sambar", 150, "1 katori"]] },
    { title: "Oats & banana", items: [["oats-water", 250, "1 bowl"], ["banana", 100, "1 medium"], ["almonds", 12, "10 almonds"]] },
  ],
  morning_snack: [
    { title: "Fruit & nuts", items: [["apple", 150, "1 apple"], ["almonds", 12, "10 almonds"]] },
    { title: "Buttermilk & sundal", items: [["buttermilk", 250, "1 glass"], ["sundal", 80, "small cup"]] },
    { title: "Tender coconut & guava", items: [["tender-coconut", 300, "1 coconut"], ["guava", 100, "1 guava"]] },
  ],
  lunch: [
    { title: "Rice, sambar, poriyal & curd", items: [["rice", 150, "1 cup"], ["sambar", 150, "1 katori"], ["poriyal", 100, "1 katori"], ["curd", 100, "1 small katori"]] },
    { title: "Chapati, dal & chicken", items: [["chapati", 80, "2 chapati"], ["dal", 150, "1 katori"], ["chicken-breast", 100, "100 g"]] },
    { title: "Millet rice, rasam & keerai", items: [["foxtail-millet-cooked", 150, "1 cup"], ["rasam", 150, "1 katori"], ["keerai", 100, "1 katori"], ["egg", 50, "1 egg"]] },
  ],
  snacks: [
    { title: "Sundal & tea", items: [["sundal", 100, "1 cup"], ["tea-no-sugar", 120, "1 cup"]] },
    { title: "Sprouts chaat", items: [["sprouts-chaat", 150, "1 katori"]] },
    { title: "Boiled eggs & fruit", items: [["egg", 100, "2 eggs"], ["papaya", 150, "1 bowl"]] },
  ],
  dinner: [
    { title: "Chapati & palak paneer", items: [["chapati", 80, "2 chapati"], ["palak-paneer", 150, "1 katori"]] },
    { title: "Idli & sambar (light)", items: [["idli", 120, "3 idli"], ["sambar", 150, "1 katori"]] },
    { title: "Grilled chicken salad", items: [["grilled-chicken-salad", 300, "1 bowl"]] },
    { title: "Millet pongal & sambar", items: [["thinai-pongal", 200, "1 cup"], ["sambar", 150, "1 katori"]] },
  ],
};

export function mealIdeas(slot: MealSlot): MealIdea[] {
  return IDEAS[slot]
    .map((idea) => {
      const items = idea.items
        .map(([id, grams, label]) => {
          const food = FOOD_BY_ID[id];
          if (!food) return null;
          const m = macrosFor(food, grams);
          return { food, grams, label, kcal: m.kcal, proteinG: m.proteinG };
        })
        .filter((x): x is NonNullable<typeof x> => !!x);
      return { title: idea.title, items, kcal: items.reduce((a, b) => a + b.kcal, 0), proteinG: round1(items.reduce((a, b) => a + b.proteinG, 0)) };
    })
    .filter((i) => i.items.length > 0);
}

/** The idea closest to the meal's budget, highest protein breaking ties. */
export function bestIdea(slot: MealSlot, budget: number): MealIdea | null {
  const ideas = mealIdeas(slot);
  if (!ideas.length) return null;
  return [...ideas].sort((a, b) => Math.abs(a.kcal - budget) - Math.abs(b.kcal - budget) || b.proteinG - a.proteinG)[0];
}

/** Everyday picks per meal, shown under "Frequently Tracked Foods" until the member has their own history. */
export const USUAL_BY_SLOT: Record<MealSlot, string[]> = {
  breakfast: ["tea", "egg", "banana", "chapati", "almonds", "milk", "idli", "dosa", "pongal", "filter-coffee"],
  morning_snack: ["banana", "apple", "almonds", "buttermilk", "tender-coconut", "tea", "guava", "sundal"],
  lunch: ["rice", "sambar", "chapati", "curd", "dal", "poriyal", "rasam", "chicken-breast", "egg", "salad"],
  snacks: ["tea", "filter-coffee", "sundal", "banana", "egg", "almonds", "vada", "buttermilk"],
  dinner: ["chapati", "idli", "dosa", "dal", "egg", "curd", "milk", "rice", "sambar", "palak-paneer"],
};

/**
 * "Did you also have…" — foods eaten together with what was just added,
 * taken from the plates table (idli → sambar, chutney, vada…), then the
 * slot's everyday foods. Never repeats what's already in the meal.
 */
export function alsoHad(addedIds: string[], slot: MealSlot, exclude: string[], n = 8): string[] {
  const out: string[] = [];
  const skip = new Set([...addedIds, ...exclude]);
  const push = (id: string) => {
    if (!skip.has(id) && !out.includes(id) && FOOD_BY_ID[id]) out.push(id);
  };
  // Pair from plates, but only off the main foods: tea or water "goes with" everything.
  const anchors = addedIds.filter((id) => FOOD_BY_ID[id] && FOOD_BY_ID[id].category !== "drink" && FOOD_BY_ID[id].category !== "condiment");
  const score = new Map<string, number>();
  for (const c of COMBOS) {
    const ids = c.parts.map((p) => p.id);
    if (!ids.some((id) => anchors.includes(id))) continue;
    for (const id of ids) score.set(id, (score.get(id) ?? 0) + 1);
  }
  [...score.entries()].sort((a, b) => b[1] - a[1] || (FOOD_BY_ID[b[0]]?.pop ?? 0) - (FOOD_BY_ID[a[0]]?.pop ?? 0)).forEach(([id]) => push(id));
  USUAL_BY_SLOT[slot].forEach(push);
  return out.slice(0, n);
}

/* ------------------------------------------------------------------ */
/* Week                                                               */
/* ------------------------------------------------------------------ */

export type TrendMetric = "kcal" | "proteinG" | "carbsG" | "fatG" | "fibreG";
export const TREND_LABEL: Record<TrendMetric, string> = { kcal: "Calories", proteinG: "Protein", carbsG: "Carbs", fatG: "Fats", fibreG: "Fibre" };

export function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function addDays(date: string, n: number): string {
  const d = new Date(date + "T12:00:00");
  d.setDate(d.getDate() + n);
  return isoDate(d);
}

/** The 7 days ending on `end`, oldest first. */
export function last7(end: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(end, i - 6));
}

export type WeekTrend = { days: { date: string; value: number }[]; total: number; avg: number; loggedDays: number };

export function weekTrend(items: LogItem[], end: string, metric: TrendMetric): WeekTrend {
  const days = last7(end).map((date) => {
    const t = totalsOf(items.filter((e) => e.date === date));
    return { date, value: t[metric] };
  });
  const total = round1(days.reduce((a, d) => a + d.value, 0));
  const loggedDays = days.filter((d) => d.value > 0).length;
  return { days, total, avg: Math.round(total / 7), loggedDays };
}

/* ------------------------------------------------------------------ */
/* Sleep                                                              */
/* ------------------------------------------------------------------ */

/** "23:30" → minutes after midnight */
export function hm(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return ((h || 0) * 60 + (m || 0)) % 1440;
}

export function fmtClock(t: string): string {
  const mins = hm(t);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const ap = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ap}`;
}

/** Minutes asleep from bed time to wake time, across midnight. */
export function sleepMinutes(bed: string, wake: string): number {
  const d = hm(wake) - hm(bed);
  return d <= 0 ? d + 1440 : d;
}

export function fmtDuration(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return m ? `${h}h ${m}m` : `${h}h`;
}

/** Hours short of the goal over the last 7 days (0 when met). */
export function weeklySleepDeficit(minutesByDate: Record<string, number>, end: string, goalHours: number): number {
  const short = last7(end).reduce((a, d) => {
    const got = minutesByDate[d];
    if (got === undefined) return a;
    return a + Math.max(0, goalHours * 60 - got);
  }, 0);
  return round1(short / 60);
}

/* ------------------------------------------------------------------ */
/* Weight                                                             */
/* ------------------------------------------------------------------ */

export function bmi(kg: number, heightCm: number): number {
  const m = heightCm / 100;
  return Math.round((kg / (m * m)) * 100) / 100;
}

/** Healthy BMI 18.5–24.9 as a weight range for this height. */
export function idealRange(heightCm: number): { min: number; max: number } {
  const m2 = (heightCm / 100) ** 2;
  return { min: Math.round(18.5 * m2 * 10) / 10, max: Math.round(24.9 * m2 * 10) / 10 };
}

/** Weeks to a target at a safe 0.5 kg a week (0 when there). */
export function weeksToGoal(currentKg: number, targetKg: number, perWeek = 0.5): number {
  return Math.ceil(Math.abs(currentKg - targetKg) / perWeek - 1e-9);
}

export function goalLabel(currentKg: number, targetKg: number, unit: "kg" | "lb" = "kg"): string {
  const diff = Math.abs(currentKg - targetKg);
  const v = unit === "lb" ? kgToLb(diff) : diff;
  const n = Math.round(v * 10) / 10;
  if (n < 0.1) return "Maintain weight";
  return `${currentKg > targetKg ? "Lose" : "Gain"} ${n} ${unit === "lb" ? "lbs" : "kg"}`;
}

export function kgToLb(kg: number): number {
  return Math.round(kg * 2.20462 * 100) / 100;
}

export function lbToKg(lb: number): number {
  return Math.round((lb / 2.20462) * 100) / 100;
}

/** Workout goal for the tracker row: about 4 kcal per kg body weight, to the nearest 5. */
export function workoutGoalKcal(kg: number): number {
  return Math.round((kg * 4) / 5) * 5;
}

/** Age range accepted by the setup (same as the database check). */
export const AGE_RANGE = { min: 13, max: 100 } as const;
export const WEIGHT_RANGE = { min: 30, max: 250 } as const;
export const HEIGHT_RANGE = { min: 120, max: 230 } as const;
