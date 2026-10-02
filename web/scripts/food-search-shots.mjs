// Screenshots of the Add food screen for a few queries.  node web/scripts/food-search-shots.mjs
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile, stat, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url));
const dist = path.resolve(here, "../../mobile/dist");
const out = path.resolve(here, "../screens/food-search");
await mkdir(out, { recursive: true });
const server = createServer(async (req, res) => {
  const url = decodeURIComponent((req.url ?? "/").split("?")[0]);
  for (const p of [path.join(dist, url), path.join(dist, url + ".html"), path.join(dist, url, "index.html"), path.join(dist, "index.html")]) {
    try { if ((await stat(p)).isFile()) { res.writeHead(200, { "content-type": p.endsWith(".js") ? "text/javascript" : p.endsWith(".html") ? "text/html" : p.endsWith(".png") ? "image/png" : "application/octet-stream" }); res.end(await readFile(p)); return; } } catch {}
  }
  res.writeHead(404).end();
});
await new Promise((r) => server.listen(4177, r));
const member = { id: "local-demo", name: "Praki Ashrith", phone: "+919620273116", provider: "phone", goal: "fat-loss", slot: "evening", plan: null, joinedOn: "2026-05-25", onboarded: true, treksDone: 0, streakWeeks: 0, notifications: { classes: true, treks: true, renewals: true, meals: true, water: true }, checkins: [], weights: [{ date: "2026-10-01", kg: 76 }], followed: [], reserved: [], heightCm: 172, age: 28, sex: "male", activity: "gym5", glassMl: 250 };
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: "dark" });
await ctx.addInitScript((m) => { localStorage.setItem("f7-session", JSON.stringify(m)); localStorage.setItem("f7-theme", "dark"); }, member);
const qs = (process.argv.slice(2).length ? process.argv.slice(2) : ["chiken biriyani", "panner", "mcaloo", "high protein snacks", "dossa", "parleg", "kulambu", "veg biryani"]);
const errs = [];
for (const q of qs) {
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errs.push(`${q}: ${e.message}`));
  await page.goto(`http://localhost:4177/food/add?text=${encodeURIComponent(q)}&meal=lunch`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(out, `${q.replace(/\W+/g, "-")}.png`) });
  await page.close();
}
// tap the first result twice, then open the plate row
const page = await ctx.newPage();
await page.goto(`http://localhost:4177/food/add?text=${encodeURIComponent("2 chapati")}&meal=dinner`, { waitUntil: "networkidle" });
await page.waitForTimeout(800);
await page.goto(`http://localhost:4177/food/add?meal=lunch`, { waitUntil: "networkidle" });
await page.waitForTimeout(800);
await page.locator("input").first().fill("curd rice");
await page.waitForTimeout(600);
await page.locator('[aria-label^="Add Curd rice"]').first().click();
await page.waitForTimeout(500);
await page.locator('[aria-label^="Curd rice,"]').first().click();
await page.waitForTimeout(500);
await page.screenshot({ path: path.join(out, "plate-servings.png") });
console.log(errs.join("\n") || "no page errors");
await browser.close(); server.close();
