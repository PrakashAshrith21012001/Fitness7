/**
 * Daily energy and macro targets.
 *
 * Mifflin-St Jeor (1990) for resting energy, a standard activity factor,
 * then the member's goal shifts the total. Protein is set per kilogram of
 * body weight (the number that actually matters for someone training), fat
 * is 25 % of energy, carbohydrate is the remainder.
 *
 * Nothing here is medical advice; it is the same arithmetic every fitness
 * app uses and the app shows the working under "How this is calculated".
 */

export type Sex = "male" | "female";
export type Activity = "gym3" | "gym5" | "trek";
export type Goal = "strength" | "fat-loss" | "trek" | "general";

export type MemberNumbers = {
  kg?: number;
  heightCm?: number;
  age?: number;
  sex?: Sex;
  activity?: Activity;
  goal?: Goal;
};

export type DailyTarget = {
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  /** The working, for the "How this is calculated" expander */
  basis: { bmr: number; activityFactor: number; goalFactor: number; proteinPerKg: number };
};

/** Resting energy, kcal/day. */
export function mifflinStJeor(p: { kg: number; heightCm: number; age: number; sex: Sex }): number {
  const base = 10 * p.kg + 6.25 * p.heightCm - 5 * p.age;
  return Math.round(p.sex === "male" ? base + 5 : base - 161);
}

export const ACTIVITY: Record<Activity, { label: string; hint: string; factor: number }> = {
  gym3: { label: "Gym 3× a week", hint: "Lightly active", factor: 1.375 },
  gym5: { label: "Gym 5× a week", hint: "Moderately active", factor: 1.55 },
  trek: { label: "Gym 5× + trek training", hint: "Very active", factor: 1.725 },
};

export function activityFactor(a: Activity): number {
  return ACTIVITY[a].factor;
}

export const GOAL_FACTOR: Record<Goal, number> = {
  "fat-loss": 0.85, // −15 %: a steady deficit, not a crash
  strength: 1.1, // +10 %: a small surplus to build on
  trek: 1.0,
  general: 1.0,
};

export const PROTEIN_PER_KG: Record<Goal, number> = {
  general: 1.6,
  trek: 1.6,
  "fat-loss": 1.8,
  strength: 2.0,
};

const FAT_SHARE = 0.25;

/**
 * Daily target, or null when a number is missing (the UI then asks for it).
 * Ranges are the same as the database checks: height 120–230, age 13–90, kg 30–250.
 */
export function dailyTarget(m: MemberNumbers): DailyTarget | null {
  if (!m.kg || !m.heightCm || !m.age || !m.sex) return null;
  if (m.kg < 30 || m.kg > 250 || m.heightCm < 120 || m.heightCm > 230 || m.age < 13 || m.age > 90) return null;
  const goal: Goal = m.goal ?? "general";
  const activity: Activity = m.activity ?? "gym3";
  const bmr = mifflinStJeor({ kg: m.kg, heightCm: m.heightCm, age: m.age, sex: m.sex });
  const af = activityFactor(activity);
  const gf = GOAL_FACTOR[goal];
  const kcal = Math.max(1200, Math.round((bmr * af * gf) / 10) * 10);
  const ppk = PROTEIN_PER_KG[goal];
  const proteinG = Math.round(m.kg * ppk);
  const fatG = Math.round((kcal * FAT_SHARE) / 9);
  const carbsG = Math.max(0, Math.round((kcal - proteinG * 4 - fatG * 9) / 4));
  return { kcal, proteinG, carbsG, fatG, basis: { bmr, activityFactor: af, goalFactor: gf, proteinPerKg: ppk } };
}

/** "1,240" style grouping for kcal (Indian grouping is only for money). */
export function fmtKcal(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
