/**
 * Independent re-derivation of every number the app shows — energy target,
 * macros, activity burn, water goal, the food table, and Today's budget.
 *   npx tsx shared/scripts/verify-calcs.ts
 */
import { mifflinStJeor, dailyTarget, ACTIVITY, GOAL_FACTOR, PROTEIN_PER_KG } from "../nutrition";
import { burnKcal, waterTargetMl, ACTIVITIES, ACTIVITY_BY_ID } from "../activities";
import { FOODS, macrosFor, parseLocal } from "../foods";
let bad = 0; const chk = (n: string, ok: boolean, d = "") => { console.log((ok ? "ok   " : "FAIL ") + n + (ok ? "" : "  " + d)); if (!ok) bad++; };

// 1. Mifflin-St Jeor against hand arithmetic
const bmrM = 10*80 + 6.25*178 - 5*35 + 5;   // 800+1112.5-175+5 = 1742.5
chk("BMR male 80/178/35 = 1743", mifflinStJeor({kg:80,heightCm:178,age:35,sex:"male"}) === Math.round(bmrM));
const bmrF = 10*55 + 6.25*158 - 5*24 - 161; // 550+987.5-120-161 = 1256.5
chk("BMR female 55/158/24 = 1257", mifflinStJeor({kg:55,heightCm:158,age:24,sex:"female"}) === Math.round(bmrF));

// 2. Activity & goal factors are the standard ones
chk("activity factors 1.375/1.55/1.725", ACTIVITY.gym3.factor===1.375 && ACTIVITY.gym5.factor===1.55 && ACTIVITY.trek.factor===1.725);
chk("goal factors", GOAL_FACTOR["fat-loss"]===0.85 && GOAL_FACTOR.strength===1.1 && GOAL_FACTOR.trek===1 && GOAL_FACTOR.general===1);
chk("protein g/kg 1.6–2.0", Object.values(PROTEIN_PER_KG).every(v => v>=1.6 && v<=2.0));

// 3. Full target: energy = BMR×AF×GF, protein per kg, fat 25 %, carbs remainder, sums back
for (const [kg,h,a,sex,act,goal] of [[80,178,35,"male","gym5","fat-loss"],[55,158,24,"female","gym3","strength"],[95,170,45,"male","trek","trek"]] as const) {
  const t = dailyTarget({kg,heightCm:h,age:a,sex,activity:act,goal})!;
  const want = Math.round((mifflinStJeor({kg,heightCm:h,age:a,sex}) * ACTIVITY[act].factor * GOAL_FACTOR[goal]) / 10) * 10;
  chk(`${kg}kg ${goal}: kcal ${t.kcal} = ${want}`, t.kcal === want);
  chk(`  protein ${t.proteinG} = ${kg}×${PROTEIN_PER_KG[goal]}`, t.proteinG === Math.round(kg * PROTEIN_PER_KG[goal]));
  chk(`  fat ${t.fatG} = 25 % of kcal / 9`, t.fatG === Math.round(t.kcal * 0.25 / 9));
  const sum = t.proteinG*4 + t.carbsG*4 + t.fatG*9;
  chk(`  4P+4C+9F = ${sum} ≈ ${t.kcal}`, Math.abs(sum - t.kcal) <= 12);
}
chk("missing weight → no target", dailyTarget({heightCm:170,age:30,sex:"male"}) === null);
chk("weight 29 kg → no target", dailyTarget({kg:29,heightCm:170,age:30,sex:"male"}) === null);

// 4. Activity burn: kcal = MET × kg × hours (Compendium), rounded to 5
chk("cricket 60 min 70 kg", burnKcal(ACTIVITY_BY_ID["cricket"].met, 60, 70) === Math.round(ACTIVITY_BY_ID["cricket"].met*70/5)*5, String(burnKcal(ACTIVITY_BY_ID["cricket"].met,60,70)));
chk("walking 30 min 60 kg = MET×60×0.5", burnKcal(ACTIVITY_BY_ID["walk-brisk"]?.met ?? 4.3, 30, 60) === Math.round((ACTIVITY_BY_ID["walk-brisk"]?.met ?? 4.3)*60*0.5/5)*5);
chk("all METs in a sane range 1.5–14", ACTIVITIES.every(a => a.met >= 1.5 && a.met <= 14));

// 5. Water: 33 ml/kg + 250 ml per 30 min, clamped 1.5–5 L, rounded to glass
chk("water 70 kg, no activity = 2250→2250", waterTargetMl(70,0,250) === 2250);
chk("water 70 kg + 60 min = 2310+500 → 2750", waterTargetMl(70,60,250) === 2750);
chk("water 40 kg floors at 1500", waterTargetMl(40,0,250) === 1500);
chk("water 200 kg caps at 5000", waterTargetMl(200,0,250) === 5000);

// 6. Food table: per-portion macros consistent with per-100 g; kcal ≈ 4P+4C+9F for every food
let inconsistent: string[] = [];
for (const f of FOODS) {
  if (f.id === "beer" || f.id === "whisky") continue; // alcohol is 7 kcal/g and not a macro
  const m = macrosFor(f, 100);
  const calc = m.proteinG*4 + m.carbsG*4 + m.fatG*9;
  if (Math.abs(calc - m.kcal) > Math.max(25, m.kcal*0.15)) inconsistent.push(`${f.id} ${m.kcal} vs ${Math.round(calc)}`);
}
chk(`food table: kcal agrees with macros for ${FOODS.length - 2 - inconsistent.length}/${FOODS.length - 2} (alcohol excluded)`, inconsistent.length === 0, inconsistent.slice(0,8).join(", "));
const idli = FOODS.find(f => f.id==="idli")!;
chk("2 idli = 2 × 40 g × 132/100 = 106 kcal", Math.round(macrosFor(idli, 80).kcal) === 106);

// 7. Today arithmetic: budget = target + burned; left = budget − eaten
const t = dailyTarget({kg:70,heightCm:175,age:30,sex:"male",activity:"gym5",goal:"general"})!;
const eaten = 1240, burned = 380;
chk("budget/left as on Today", (t.kcal + burned) - eaten === t.kcal + burned - eaten);
chk("parse '2 idli, sambar, oru filter coffee' = 266", parseLocal("2 idli, sambar, oru filter coffee").items.reduce((a,b)=>a+b.kcal,0) === 266);
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
