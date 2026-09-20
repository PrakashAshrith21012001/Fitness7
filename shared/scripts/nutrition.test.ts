/**
 * Tiny assertion script for shared/nutrition.ts — no test runner needed.
 *   npx tsx shared/scripts/nutrition.test.ts
 */
import { mifflinStJeor, activityFactor, dailyTarget } from "../nutrition";

let failed = 0;
function eq(name: string, got: unknown, want: unknown) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`${ok ? "ok  " : "FAIL"} ${name}${ok ? "" : ` — got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`}`);
  if (!ok) failed++;
}

// Textbook Mifflin-St Jeor values
eq("BMR male 70 kg 175 cm 30 y", mifflinStJeor({ kg: 70, heightCm: 175, age: 30, sex: "male" }), 1649);   // 700+1093.75-150+5
eq("BMR female 60 kg 160 cm 28 y", mifflinStJeor({ kg: 60, heightCm: 160, age: 28, sex: "female" }), 1299); // 600+1000-140-161

eq("activity factors", [activityFactor("gym3"), activityFactor("gym5"), activityFactor("trek")], [1.375, 1.55, 1.725]);

const base = { kg: 70, heightCm: 175, age: 30, sex: "male" as const, activity: "gym5" as const };
const general = dailyTarget({ ...base, goal: "general" })!;
eq("general kcal = bmr × 1.55, rounded to 10", general.kcal, Math.round((1649 * 1.55) / 10) * 10); // 2560
eq("general protein 1.6 g/kg", general.proteinG, 112);

const fatLoss = dailyTarget({ ...base, goal: "fat-loss" })!;
eq("fat-loss is −15 %", fatLoss.kcal, Math.round((1649 * 1.55 * 0.85) / 10) * 10); // 2170
eq("fat-loss protein 1.8 g/kg", fatLoss.proteinG, 126);

const strength = dailyTarget({ ...base, goal: "strength" })!;
eq("strength is +10 %", strength.kcal, Math.round((1649 * 1.55 * 1.1) / 10) * 10); // 2810
eq("strength protein 2.0 g/kg", strength.proteinG, 140);

// macros add back up to the kcal (within rounding)
const sum = strength.proteinG * 4 + strength.carbsG * 4 + strength.fatG * 9;
eq("macros ≈ kcal", Math.abs(sum - strength.kcal) <= 12, true);
eq("fat is 25 % of kcal", strength.fatG, Math.round((strength.kcal * 0.25) / 9));

// missing numbers → null, out of range → null, floor at 1200
eq("no height → null", dailyTarget({ kg: 70, age: 30, sex: "male" }), null);
eq("age out of range → null", dailyTarget({ ...base, age: 12 }), null);
eq("floor 1200", dailyTarget({ kg: 40, heightCm: 145, age: 80, sex: "female", activity: "gym3", goal: "fat-loss" })!.kcal, 1200);

console.log(failed ? `\n${failed} failed` : "\nall passed");
process.exit(failed ? 1 : 0);
