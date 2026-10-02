/**
 * v14 calorie tracker — end-to-end test on the web build + screenshots.
 *
 *   cd mobile && npx expo export --platform web
 *   node web/scripts/tracker-e2e.mjs            # writes web/screens/v14/*.png, exits 1 on any failure
 *
 * Seeds a signed-in local member with no tracker state, then walks the
 * whole HealthifyMe-style flow: setup questions (with the range errors),
 * tracker home, meal sheet, log screen, search, food page, undo, diet day
 * (edit / move / delete / save as meal), insights, recipes, weight, sleep,
 * water, steps, and a reload to prove everything persisted.
 */
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile, stat, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const dist = path.resolve(here, "../../mobile/dist");
const out = path.resolve(here, "../screens/v14");
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
const PORT = 4190;

const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".jpg": "image/jpeg", ".json": "application/json", ".ttf": "font/ttf", ".woff2": "font/woff2" };
const server = createServer(async (req, res) => {
  const url = decodeURIComponent((req.url ?? "/").split("?")[0]);
  for (const p of [path.join(dist, url), path.join(dist, url + ".html"), path.join(dist, url, "index.html"), path.join(dist, "index.html")]) {
    try {
      const s = await stat(p);
      if (s.isFile()) {
        res.writeHead(200, { "content-type": types[path.extname(p)] ?? "application/octet-stream" });
        res.end(await readFile(p));
        return;
      }
    } catch {}
  }
  res.writeHead(404).end();
});
await new Promise((r) => server.listen(PORT, r));

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const dayMinus = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return iso(d); };
const TODAY = dayMinus(0);

// No height/sex → setup must ask for them too.
const member = {
  id: "local-demo", name: "Ashrith Prakash", phone: "+919620273116", provider: "phone", goal: "fat-loss", slot: "evening",
  plan: { id: "quarterly", name: "Quarterly", renewsOn: dayMinus(-40) }, joinedOn: dayMinus(120), onboarded: true, treksDone: 0, streakWeeks: 1,
  notifications: { classes: true, treks: true, renewals: true, meals: true, water: true },
  checkins: [dayMinus(0)], weights: [{ date: dayMinus(400), kg: 76.4 }, { date: dayMinus(300), kg: 75.5 }, { date: dayMinus(200), kg: 68.5 }, { date: dayMinus(90), kg: 74.0 }, { date: dayMinus(30), kg: 73.0 }],
  followed: [], reserved: [], activity: "gym5", hideCalories: false, glassMl: 250,
};
// A few earlier days of food so weekly trends and "frequently tracked" have data.
const pastFood = [1, 2, 4].flatMap((n) => [
  { id: `p${n}a`, date: dayMinus(n), meal: "breakfast", name: "Idli", foodId: "idli", grams: 120, portionLabel: "3 × idli", kcal: 158, proteinG: 4.7, carbsG: 33.5, fatG: 0.5, confidence: 1, source: "table", loggedAt: `${dayMinus(n)}T03:00:00.000Z` },
  { id: `p${n}b`, date: dayMinus(n), meal: "lunch", name: "Rice", foodId: "rice", grams: 200, portionLabel: "1 cup", kcal: 260, proteinG: 5.4, carbsG: 56, fatG: 0.6, confidence: 1, source: "table", loggedAt: `${dayMinus(n)}T07:30:00.000Z` },
]);

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: "dark" });
await ctx.addInitScript(({ member, pastFood }) => {
  if (sessionStorage.getItem("seeded")) return; // keep state across reloads
  sessionStorage.setItem("seeded", "1");
  localStorage.clear();
  localStorage.setItem("f7-session", JSON.stringify(member));
  localStorage.setItem("f7-food", JSON.stringify(pastFood));
  localStorage.setItem("f7-theme", "dark");
}, { member, pastFood });
// The app talks to the API / Google; none of that is reachable (or needed) here.
await ctx.route(/onrender\.com|googleapis|google\.com|supabase\.co/, (r) => r.abort());
const page = await ctx.newPage();
page.setDefaultTimeout(8000);
const errors = [];
page.on("pageerror", (e) => errors.push(`pageerror: ${String(e.message).slice(0, 300)}`));
page.on("console", (m) => { if (m.type() === "error" && !/favicon|Download the React DevTools|net::ERR_FAILED/.test(m.text())) errors.push(`console: ${m.text().slice(0, 300)}`); });

let n = 0;
const results = [];
const shot = async (name) => { n++; await page.screenshot({ path: path.join(out, `${String(n).padStart(2, "0")}-${name}.png`) }); };
const wait = (ms = 600) => page.waitForTimeout(ms);
const label = (re) => page.getByLabel(re).filter({ visible: true }).first();
const text = (t) => page.getByText(t, { exact: false }).filter({ visible: true }).first();
async function step(name, fn) {
  const t0 = Date.now();
  try {
    await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error("step timed out (40 s)")), 40000))]);
    results.push(["ok", name]);
    console.log("  ok  ", name, `${Date.now() - t0} ms`);
  } catch (e) {
    results.push(["FAIL", name, String(e.message).split("\n")[0].slice(0, 240)]);
    console.log("  FAIL", name, String(e.message).split("\n")[0].slice(0, 240));
    await shot(`FAIL-${name.replace(/\W+/g, "-").slice(0, 40)}`);
  }
}
async function expectVisible(locator, what) {
  await locator.waitFor({ state: "visible", timeout: 6000 }).catch(() => { throw new Error(`not visible: ${what}`); });
}
async function expectHidden(locator, what) {
  if (await locator.isVisible().catch(() => false)) throw new Error(`should not be visible: ${what}`);
}
const store = (k) => page.evaluate((k) => JSON.parse(localStorage.getItem(k) || "null"), k);
const typeInto = async (re, value) => { const el = label(re); await el.click(); await el.fill(""); await el.type(value, { delay: 15 }); await wait(250); };

/* ---------------- setup ---------------- */
await page.goto(`http://localhost:${PORT}/food`, { waitUntil: "load" });
await wait(1800);

await step("setup opens on first visit", async () => {
  await expectVisible(text("What are you looking for?"), "goals question");
  await shot("setup-goals");
});
await step("goals multi-select", async () => {
  await label(/^Weight Loss$/).click();
  await label(/^Muscle Gain$/).click();
  if ((await label(/^Weight Loss$/).getAttribute("aria-checked")) !== "true") throw new Error("Weight Loss not checked");
  await label(/^Muscle Gain$/).click(); // untick
  await label(/^Next$/).click();
  await wait();
});
await step("age validation 13–100", async () => {
  await expectVisible(text("What's your Age?"), "age");
  await typeInto(/^Years$/, "232");
  await expectVisible(text("Age must be within 13-100 Years range."), "age error");
  if ((await label(/^Next$/).getAttribute("aria-disabled")) !== "true") throw new Error("Next should be disabled for 232");
  await shot("setup-age-error");
  await typeInto(/^Years$/, "23");
  await expectHidden(text("Age must be within"), "age error after fix");
  await label(/^Next$/).click();
  await wait();
});
await step("gender", async () => {
  await expectVisible(text("What's your gender?"), "gender");
  await label(/^Male$/).click();
  await label(/^Next$/).click();
  await wait();
});
await step("height", async () => {
  await typeInto(/^cm$/, "175");
  await label(/^Next$/).click();
  await wait();
});
await step("city + language", async () => {
  await expectVisible(text("Where are you from?"), "city");
  await shot("setup-city");
  await label(/^Dharmapuri$/).click();
  await wait(300);
  await expectVisible(text("What language do you prefer to speak in?"), "language");
  await label(/^English$/).click();
  await shot("setup-language");
  await label(/^Next$/).click();
  await wait();
});
await step("current weight with range error + lb toggle", async () => {
  await expectVisible(text("What's your current weight?"), "weight");
  await typeInto(/^Kg$/, "7");
  await expectVisible(text("Weight must be within 30-250 Kg range."), "weight error");
  await typeInto(/^Kg$/, "72.5");
  await label(/^Lb$/).click();
  await wait(300);
  const v = await label(/^Lb$/).first().inputValue().catch(() => null);
  await shot("setup-weight-lb");
  await label(/^Kg$/).nth(0).click().catch(() => {});
  await label(/^Next$/).click();
  await wait();
});
await step("target weight shows BMI ideal range", async () => {
  await expectVisible(text("What's your target weight?"), "target");
  await expectVisible(text("Ideal Weight range is"), "BMI hint");
  await shot("setup-target");
  const unitInput = page.getByRole("textbox").filter({ visible: true }).first();
  await unitInput.fill("65");
  await wait(300);
  await expectVisible(text("perfectly aligned with your ideal weight range"), "aligned message");
  await label(/^Next$/).click();
  await wait();
});
await step("medical conditions", async () => {
  await expectVisible(text("Any Medical Condition"), "medical");
  await label(/^Thyroid$/).click();
  if ((await label(/^None$/).getAttribute("aria-checked")) === "true") throw new Error("None should clear when a condition is picked");
  await shot("setup-medical");
  await label(/^Next$/).click();
  await wait();
});
await step("health sync → finish", async () => {
  await expectVisible(text("Let's Auto-Track with"), "health sync");
  await shot("setup-health");
  await label(/No, I'll track everything manually/).click();
  await wait(1500);
  const s = await store("f7-session");
  const t = await store("f7-tracker");
  if (s.age !== 23 || s.heightCm !== 175 || s.sex !== "male") throw new Error(`profile not saved: ${JSON.stringify({ age: s.age, h: s.heightCm, sex: s.sex })}`);
  if (s.weights[s.weights.length - 1].kg !== 72.5) throw new Error("weight not logged");
  if (t.targetKg !== 65 || !t.setupDone || t.city !== "Dharmapuri" || !t.conditions.includes("Thyroid")) throw new Error(`tracker not saved: ${JSON.stringify(t).slice(0, 200)}`);
});

/* ---------------- tracker home ---------------- */
await step("tracker home renders", async () => {
  await expectVisible(text("Your Trackers"), "Your Trackers");
  await expectVisible(text("Welcome to your"), "welcome card");
  await expectVisible(text("Track Food"), "Track Food");
  await shot("home-top");
  await page.mouse.wheel(0, 700);
  await wait(500);
  await shot("home-trackers");
  await page.mouse.wheel(0, -2000);
  await wait(300);
});
await step("daily goals sheet", async () => {
  await label(/^View My Daily Goals$/).click();
  await wait(600);
  await expectVisible(text("Your Daily Goals"), "goals sheet");
  await shot("home-daily-goals");
  await label(/^Got it$/).click();
  await wait(500);
});

/* ---------------- meal sheet → log ---------------- */
await step("+ opens Select a Meal with 5 meals and budgets", async () => {
  await label(/^Track a meal$/).first().click();
  await wait(700);
  await expectVisible(text("Select a Meal You Would Like to Track"), "meal sheet");
  for (const m of ["Breakfast", "Morning Snack", "Lunch", "Evening Snack", "Dinner"]) await expectVisible(label(new RegExp(`^Track ${m},`)), m);
  await shot("meal-sheet");
  await label(/^Track Breakfast,/).click();
  await wait(900);
});
await step("log screen layout", async () => {
  await expectVisible(text("Track with Images"), "track with images");
  await expectVisible(text("Frequently Tracked Foods"), "frequent");
  await expectVisible(label(/^Track For Breakfast$/), "footer button");
  await shot("log-empty");
});
await step("add Tea with + shows added bar and also-had", async () => {
  await label(/^Add Tea \(milk & sugar\) to Breakfast$/).click();
  await wait(800);
  await expectVisible(text("added"), "added bar");
  await expectVisible(text("Did you also have..."), "also had");
  await shot("log-added");
});
await step("undo removes the add", async () => {
  await label(/^Undo$/).click();
  await wait(700);
  const f = await store("f7-food");
  if (f.some((e) => e.date === TODAY && e.name.startsWith("Tea"))) throw new Error("tea still logged after undo");
});

/* ---------------- search → item ---------------- */
await step("search finds ven pongal", async () => {
  await label(/^Search by food name or dish$/).click();
  await wait(700);
  await page.keyboard.type("Ven pongal", { delay: 30 });
  await wait(600);
  await expectVisible(label(/^Ven pongal/i), "result");
  await expectVisible(text("Can't find your food?"), "cant find");
  await shot("search-results");
  await label(/^Ven pongal/i).click();
  await wait(900);
});
await step("food page: quantity × measure changes macros", async () => {
  await expectVisible(text("Macronutrients Breakdown"), "macros");
  await expectVisible(text("Micronutrients Breakdown"), "micros");
  const before = await page.getByText(/^\d[\d,]* Cal$/).filter({ visible: true }).first().innerText();
  await shot("item-default");
  await label(/^Quantity .* Change$/).click();
  await wait(500);
  await page.getByRole("radio", { name: "2", exact: true }).filter({ visible: true }).click();
  await wait(500);
  const after = await page.getByText(/^\d[\d,]* Cal$/).filter({ visible: true }).first().innerText();
  if (parseInt(after.replace(/\D/g, "")) <= parseInt(before.replace(/\D/g, ""))) throw new Error(`calories didn't grow: ${before} → ${after}`);
  await label(/^Measure .* Change$/).click();
  await wait(500);
  await shot("item-measure-sheet");
  await page.getByRole("radio").filter({ visible: true }).nth(1).click();
  await wait(400);
  await shot("item-2x");
  await label(/^Add$/).click();
  await wait(900);
});
await step("back on log: pongal added, idli/sambar suggested", async () => {
  await expectVisible(text("Did you also have..."), "also had");
  await expectVisible(text("added"), "added bar");
  const f = await store("f7-food");
  if (!f.some((e) => e.date === TODAY && e.meal === "breakfast" && e.foodId === "pongal")) throw new Error("pongal not in breakfast");
  await shot("log-after-pongal");
});
await step("add two suggestions", async () => {
  const plus = page.getByLabel(/^Add .* to Breakfast$/).filter({ visible: true });
  await plus.nth(0).click();
  await wait(500);
  await page.getByLabel(/^Add .* to Breakfast$/).filter({ visible: true }).nth(0).click();
  await wait(600);
  await expectVisible(text("more food"), "x + n more");
  await shot("log-more-added");
  await label(/^Track For Breakfast$/).click();
  await wait(1100);
});

/* ---------------- diet day ---------------- */
await step("diet day shows breakfast with items and budgets", async () => {
  await expectVisible(text("Save as Meal"), "save as meal");
  await expectVisible(text("Morning Snack"), "morning snack header");
  await expectVisible(text("Healthy Snack Suggestions"), "snack suggestions");
  await shot("diet-day");
});
await step("item menu: move to lunch then back, edit, delete", async () => {
  const f0 = (await store("f7-food")).filter((e) => e.date === TODAY);
  const first = f0.find((e) => e.meal === "breakfast" && e.foodId !== "pongal");
  await page.getByLabel(new RegExp(`^${first.name.replace(/[()]/g, ".")},.*Options$`)).first().click();
  await wait(600);
  await shot("diet-item-menu");
  await label(/^Move to another meal$/).click();
  await wait(500);
  await label(/^Lunch$/).click();
  await wait(700);
  let f = (await store("f7-food")).filter((e) => e.date === TODAY);
  if (!f.some((e) => e.meal === "lunch" && e.name === first.name)) throw new Error("move failed");
  await page.getByLabel(new RegExp(`^${first.name.replace(/[()]/g, ".")},.*Options$`)).first().click();
  await wait(500);
  await label(/^Delete$/).click();
  await wait(700);
  f = (await store("f7-food")).filter((e) => e.date === TODAY);
  if (f.some((e) => e.name === first.name)) throw new Error("delete failed");
});
await step("edit quantity updates the entry", async () => {
  const before = (await store("f7-food")).find((e) => e.date === TODAY && e.foodId === "pongal");
  await page.getByLabel(/^Ven pongal,.*Options$/i).filter({ visible: true }).first().click();
  await wait(500);
  await label(/^Edit quantity$/).click();
  await wait(900);
  await label(/^Quantity .* Change$/).click();
  await wait(400);
  await page.getByRole("radio", { name: "0.5", exact: true }).filter({ visible: true }).click();
  await wait(300);
  await label(/^Update$/).click();
  await wait(900);
  const after = (await store("f7-food")).find((e) => e.date === TODAY && e.foodId === "pongal");
  if (!after || after.grams >= before.grams) throw new Error(`edit didn't shrink: ${before.grams} → ${after?.grams}`);
});
await step("save as meal → My Meals", async () => {
  await label(/^Save Breakfast as a meal$/).click();
  await wait(500);
  await label(/^Meal name$/).fill("My Breakfast Pongal");
  await shot("diet-save-meal");
  await label(/^Save$/).click();
  await wait(700);
  const t = await store("f7-tracker");
  if (!t.savedMeals.some((m) => m.name === "My Breakfast Pongal")) throw new Error("meal not saved");
});
await step("snack idea adds in one tap", async () => {
  await page.getByLabel(/^Add .* to Morning Snack$/).filter({ visible: true }).nth(1).click();
  await wait(700);
  const f = (await store("f7-food")).filter((e) => e.date === TODAY && e.meal === "morning_snack");
  if (!f.length) throw new Error("no morning snack added");
  await shot("diet-after-snack");
});

/* ---------------- insights ---------------- */
await step("insights all meals", async () => {
  await label(/^Insights$/).first().click();
  await wait(1000);
  await expectVisible(text("Your Calorie Budget"), "budget");
  await expectVisible(text("Macronutrients Breakup"), "macros");
  await shot("insights-top");
  await label(/^View top contributors$/).click();
  await wait(400);
  await shot("insights-contributors");
  await page.mouse.wheel(0, 900);
  await wait(400);
  await shot("insights-analysis");
  await page.mouse.wheel(0, 1200);
  await wait(400);
  await expectVisible(text("Weekly Trends"), "weekly");
  await shot("insights-weekly");
});
await step("insights breakfast tab: high carb + swaps + suggestion", async () => {
  await page.mouse.wheel(0, -4000);
  await page.getByRole("tab", { name: "Breakfast" }).filter({ visible: true }).click();
  await wait(600);
  await expectVisible(text("Breakfast Suggestion"), "suggestion");
  const carb = page.getByLabel(/gram(s)? carbs\. Healthier alternatives$/).filter({ visible: true }).first();
  if (await carb.isVisible().catch(() => false)) {
    await carb.click();
    await wait(400);
    await expectVisible(text("Healthier alternatives for this food"), "swaps");
  }
  await shot("insights-breakfast");
  await page.getByRole("tab", { name: "Dinner" }).filter({ visible: true }).click();
  await wait(400);
  await expectVisible(text("You haven't tracked this meal yet."), "empty dinner");
  await shot("insights-dinner-empty");
  await label(/^Back$/).click();
  await wait(800);
});

/* ---------------- recipes ---------------- */
await step("recipes list + detail", async () => {
  await label(/^Recipes$/).first().click();
  await wait(900);
  await expectVisible(text("Rice Based Dishes"), "rice section");
  await shot("recipes");
  await label(/^Masala Bhat,/).click();
  await wait(900);
  await expectVisible(text("Nutritional Information (per 100g)"), "nutrition");
  await label(/^Ingredients$/).click();
  await wait(300);
  await shot("recipe-detail");
  await label(/^Back$/).click();
  await wait(500);
  await label(/^Back$/).click();
  await wait(700);
});

/* ---------------- home: trackers ---------------- */
await step("home shows today's logs", async () => {
  await page.goto(`http://localhost:${PORT}/food`, { waitUntil: "load" });
  await wait(1500);
  await expectVisible(text("Cal Eaten"), "eaten line");
  await page.mouse.wheel(0, 1300);
  await wait(500);
  await expectVisible(text("Today's Logs"), "logs");
  await shot("home-logs");
  await page.mouse.wheel(0, -3000);
});
await step("water + on home", async () => {
  await label(/^Add a glass of water$/).click();
  await wait(300);
  await label(/^Add a glass of water$/).click();
  await wait(500);
  await expectVisible(text("2 of"), "2 glasses");
});
await step("steps sheet validates and saves", async () => {
  await label(/^Update steps$/).click();
  await wait(500);
  await label(/^Steps$/).fill("6543");
  await shot("steps-sheet");
  await label(/^Save 6,543 steps$/).click();
  await wait(500);
  await expectVisible(text("6,543 of 10,000 steps"), "steps row");
});

/* ---------------- weight ---------------- */
await step("weight tracker", async () => {
  await label(/^Weight\. /).click();
  await wait(900);
  await expectVisible(text("Lose 7.5 kg"), "goal");
  await expectVisible(text("15 weeks remaining"), "weeks");
  await expectVisible(text("Timeline"), "timeline");
  await shot("weight-top");
  await label(/^Track weight$/).click();
  await wait(500);
  await shot("weight-track-sheet");
  await label(/^Track manually$/).click();
  await wait(500);
  await label(/^Weight in kg$/).fill("300");
  await expectVisible(text("Weight must be within 30-250 Kg range."), "range");
  await label(/^Weight in kg$/).fill("72.1");
  await label(/^Save$/).click();
  await wait(700);
  await expectVisible(text("Lose 7.1 kg"), "updated goal");
  await page.mouse.wheel(0, 900);
  await wait(400);
  await shot("weight-timeline");
  await label(/^Back$/).click();
  await wait(700);
});

/* ---------------- sleep ---------------- */
await step("sleep tracker welcome → yes", async () => {
  await label(/^Sleep\. /).click();
  await wait(900);
  await expectVisible(text("Welcome to"), "sleep welcome");
  await shot("sleep-welcome");
  await label(/^Get Started$/).click();
  await wait(700);
  await expectVisible(text("Did you sleep at"), "check-in");
  await shot("sleep-checkin");
  await label(/^Yes, slept/).click();
  await wait(600);
  await expectVisible(text("8h"), "8h logged");
  await page.mouse.wheel(0, 900);
  await wait(400);
  await shot("sleep-analysis");
  await label(/^Back$/).click();
  await wait(700);
});

/* ---------------- persistence ---------------- */
await step("reload keeps everything", async () => {
  await page.reload({ waitUntil: "load" });
  await wait(1800);
  await expectVisible(text("Your Trackers"), "home after reload");
  await expectHidden(text("What are you looking for?"), "setup should not reopen");
  await expectVisible(text("6,543 of 10,000 steps"), "steps persisted");
  await expectVisible(text("8h of 8hr"), "sleep persisted");
  await shot("home-after-reload");
});
await step("past day via date chip", async () => {
  await label(/^Date: Today\. Change$/).click();
  await wait(500);
  await label(/^Yesterday$/).click();
  await wait(900);
  await expectVisible(text("418 of"), "yesterday kcal 158+260");
  await shot("home-yesterday");
});

/* ---------------- light theme ---------------- */
await step("tracker keeps its white look in light theme", async () => {
  await page.evaluate(() => localStorage.setItem("f7-theme", "light"));
  await page.goto(`http://localhost:${PORT}/food/day`, { waitUntil: "load" });
  await wait(1500);
  await expectVisible(text("Save as Meal"), "day in light");
  await shot("diet-day-light");
});

await browser.close();
server.close();

const fails = results.filter((r) => r[0] === "FAIL");
for (const r of results) console.log(r[0] === "ok" ? "  ok  " : "  FAIL", r[1], r[2] ? `— ${r[2]}` : "");
console.log(`\n${results.length - fails.length}/${results.length} steps passed · ${n} screenshots in web/screens/v14`);
if (errors.length) {
  console.log(`\n${errors.length} console/page errors:`);
  for (const e of [...new Set(errors)].slice(0, 20)) console.log("  ", e);
}
process.exit(fails.length || errors.length ? 1 : 0);
