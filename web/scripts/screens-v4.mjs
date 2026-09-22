/**
 * Full-page screenshots of every v4 (cult.fit-style) route from the web export.
 *
 *   cd mobile && npx expo export --platform web
 *   node web/scripts/screens-v4.mjs [dark|light|both]   # writes web/screens/v4/*.png
 */
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile, stat, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const dist = path.resolve(here, "../../mobile/dist");
const out = path.resolve(here, "../screens/v4");
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
await new Promise((r) => server.listen(4174, r));

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

const which = process.argv[2] ?? "dark";
const themes = which === "both" ? ["dark", "light"] : [which];
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const heights = [844, 3400];
const shots = [
  ["home", "/"],
  ["fitness-center", "/fitness"],
  ["fitness-home", "/fitness?tab=home"],
  ["fitness-profile", "/fitness?tab=profile"],
  ["treks", "/treks"],
  ["store", "/store"],
  ["transform", "/transform"],
  ["booking", "/booking/seed-up-0"],
  ["class", "/class/strength"],
  ["exercise", "/exercise/bb-curl"],
  ["activities", "/activities"],
  ["memories", "/activities/memories"],
  ["memory", "/activities/memory?id=seed-5-0"],
  ["plan", "/plan"],
  ["plan-result", "/plan/result"],
  ["store-category", "/store/category/nutrition"],
  ["store-product", "/store/product/whey-1kg"],
  ["store-cart", "/store/cart"],
  ["store-pay", "/store/pay?mode=upi"],
  ["store-account", "/store/account"],
  ["store-orders", "/store/orders"],
  ["store-menu", "/store/menu"],
  ["store-express", "/store/express"],
  ["profile", "/profile"],
  ["membership", "/membership"],
  ["classes", "/classes"],
  ["trek-detail", "/trek/yercaud-oct-2026"],
  ["food", "/food"],
  ["progress", "/progress"],
  ["settings", "/settings"],
  ["checkin", "/checkin"],
];
const errors = [];
for (const theme of themes) for (const height of heights) {
  const ctx = await browser.newContext({ viewport: { width: 390, height }, deviceScaleFactor: height > 1000 ? 1 : 2, colorScheme: theme });
  await ctx.addInitScript(({ member, cart, planAnswers, theme }) => {
    localStorage.setItem("f7-session", JSON.stringify(member));
    localStorage.setItem("f7-cart", JSON.stringify(cart));
    localStorage.setItem("f7-plan-answers", JSON.stringify(planAnswers));
    localStorage.setItem("f7-theme", theme);
  }, { member, cart, planAnswers, theme });
  for (const [name, route] of shots) {
    const page = await ctx.newPage();
    page.on("pageerror", (e) => errors.push({ name, theme, error: String(e.message).slice(0, 300) }));
    page.on("console", (m) => { if (m.type() === "error") errors.push({ name, theme, console: m.text().slice(0, 300) }); });
    try {
      await page.goto(`http://localhost:4174${route}`, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(name === "store-express" || name === "store-pay" ? 3200 : 1500);
      await page.screenshot({ path: path.join(out, `${name}-${theme}${height > 1000 ? "-tall" : ""}.png`), fullPage: false });
    } catch (e) {
      errors.push({ name, theme, error: String(e.message).slice(0, 200) });
    }
    await page.close();
  }
  await ctx.close();
}
await browser.close();
server.close();
console.log(JSON.stringify(errors, null, 2));
console.log(`screenshots → ${out}`);
