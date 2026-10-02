/**
 * v5 screens: Home weekly-activity bar + pull-up sheet, Weeks Active / goal / Fitness Devices sheets, squad leaderboard.
 *
 *   cd mobile && npx expo export --platform web
 *   node web/scripts/screens-v5.mjs   # writes web/screens/v5/*.png
 */
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile, stat, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const dist = path.resolve(here, "../../mobile/dist");
const out = path.resolve(here, "../screens/v5");
await mkdir(out, { recursive: true });

const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".jpg": "image/jpeg", ".mp4": "video/mp4", ".json": "application/json", ".ttf": "font/ttf", ".woff2": "font/woff2" };
const server = createServer(async (req, res) => {
  const url = decodeURIComponent((req.url ?? "/").split("?")[0]);
  const tries = [path.join(dist, url), path.join(dist, url + ".html"), path.join(dist, url, "index.html"), path.join(dist, "index.html")];
  for (const p of tries) {
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
await new Promise((r) => server.listen(4175, r));

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const dayMinus = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return iso(d); };

const member = {
  id: "local-demo", name: "Praki Ashrith", phone: "+919620273116", provider: "phone", goal: "fat-loss", slot: "evening",
  plan: { id: "quarterly", name: "Quarterly", renewsOn: dayMinus(-40) }, joinedOn: dayMinus(120), onboarded: true, treksDone: 2, streakWeeks: 3,
  notifications: { classes: true, treks: true, renewals: true, meals: true, water: true },
  checkins: [dayMinus(0), dayMinus(2), dayMinus(4), dayMinus(7), dayMinus(9), dayMinus(14)],
  weights: [{ date: dayMinus(21), kg: 78 }, { date: dayMinus(14), kg: 77.4 }, { date: dayMinus(7), kg: 76.9 }, { date: dayMinus(0), kg: 76.2 }],
  followed: ["strength"], reserved: [], heightCm: 172, age: 28, sex: "male", activity: "gym5", hideCalories: false, glassMl: 250,
};
const cart = { lines: [{ productId: "shaker", qty: 1 }, { productId: "protein-bar", qty: 2 }, { productId: "creatine", qty: 1 }], coupon: null, tipINR: 0, instructions: [], noBag: true, orders: [] };
const planAnswers = { gender: "male", age: "28", goal: "fat-loss", experience: "some", days: "4", focus: ["arms", "core"], equipment: "gym" };

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const errors = [];
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: "dark" });
await ctx.addInitScript(({ member, cart, planAnswers }) => {
  localStorage.setItem("f7-session", JSON.stringify(member));
  localStorage.setItem("f7-cart", JSON.stringify(cart));
  localStorage.setItem("f7-plan-answers", JSON.stringify(planAnswers));
  localStorage.setItem("f7-theme", "dark");
}, { member, cart, planAnswers });
const page = await ctx.newPage();
page.on("pageerror", (e) => errors.push(String(e.message).slice(0, 300)));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 300)); });
const shot = (n) => page.screenshot({ path: path.join(out, `${n}.png`) });
const wait = (ms = 900) => page.waitForTimeout(ms);
const sheetScroll = async (y) => {
  await page.evaluate((y) => {
    const els = [...document.querySelectorAll("div")].filter((d) => { const s = getComputedStyle(d); return (s.overflowY === "auto" || s.overflowY === "scroll") && d.scrollHeight > d.clientHeight + 50; });
    const el = els[els.length - 1]; if (el) el.scrollTop = y;
  }, y);
  await wait(500);
};

await page.goto("http://localhost:4175/", { waitUntil: "networkidle" }); await wait(1500);
await shot("01-home");
await page.getByLabel(/this week activity\. Open weekly activity/).click(); await wait(1200);
await shot("02-sheet-top");
for (const [i, y] of [[3, 700], [4, 1400], [5, 2100], [6, 2800], [7, 3500], [8, 4200]]) { await sheetScroll(y); await shot(`0${i}-sheet-${y}`); }
await sheetScroll(0);
await page.getByLabel(/Weeks Active$/).first().click(); await wait(900);
await shot("09-weeks-active");
await page.mouse.click(195, 120); await wait(700);
await page.getByLabel("Edit weekly goal").click(); await wait(900);
await shot("10-goal");
await page.mouse.click(195, 120); await wait(700);
await sheetScroll(1100);
await page.getByLabel(/Connect a fitness device/).first().click(); await wait(900);
await shot("11-devices");
await page.getByLabel("Enter sleep info manually").click(); await wait(500);
await shot("12-devices-sleep");
await page.mouse.click(195, 120); await wait(700);
await sheetScroll(0);
await page.getByLabel(/Squad leaderboard/).first().click(); await wait(1500);
await shot("13-squad");
for (const [i, y] of [[14, 750], [15, 1500], [16, 2300], [17, 3100]]) {
  await page.evaluate((y) => window.scrollTo(0, y), y);
  await page.evaluate((y) => { const els = [...document.querySelectorAll("div")].filter((d) => { const s = getComputedStyle(d); return (s.overflowY === "auto" || s.overflowY === "scroll") && d.scrollHeight > d.clientHeight + 50; }); const el = els[els.length - 1]; if (el) el.scrollTop = y; }, y);
  await wait(500); await shot(`${i}-squad-${y}`);
}
await page.goto("http://localhost:4175/squad", { waitUntil: "networkidle" }); await wait(1200);
await page.getByRole("tab", { name: "Hari's Squad" }).click(); await wait(500);
await shot("18-squad-tab");
await page.getByLabel("Previous week").click(); await wait(500);
await shot("19-squad-prev-week");
await page.goto("http://localhost:4175/", { waitUntil: "networkidle" }); await wait(1200);
await page.getByRole("button", { name: "See more" }).click(); await wait(400);
await page.evaluate(() => { const els = [...document.querySelectorAll("div")].filter((d) => { const s = getComputedStyle(d); return (s.overflowY === "auto" || s.overflowY === "scroll") && d.scrollHeight > d.clientHeight + 50; }); const el = els[0]; if (el) el.scrollTop = 450; }); await wait(600);
await shot("20-home-whats-new");
await page.goto("http://localhost:4175/fitness?tab=profile", { waitUntil: "networkidle" }); await wait(1500);
await shot("21-fitness-profile");
await browser.close();
server.close();
console.log(JSON.stringify(errors, null, 2));
