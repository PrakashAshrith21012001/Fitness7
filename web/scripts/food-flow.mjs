// End-to-end check of the food flow on the web export: add from a chip, save, toast, reload, undo, back-with-plate guard.
// cd mobile && EXPO_PUBLIC_ALLOW_FIXTURES=1 npx expo export --platform web; cd ../web && node scripts/food-flow.mjs
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
const dist = "/home/claude/f7/mobile/dist";
const server = createServer(async (req, res) => {
  const url = decodeURIComponent(req.url.split("?")[0]);
  for (const t of [path.join(dist, url), path.join(dist, url + ".html"), path.join(dist, url, "index.html"), path.join(dist, "index.html")]) { try { if ((await stat(t)).isFile()) { res.end(await readFile(t)); return; } } catch {} }
  res.statusCode = 404; res.end();
});
await new Promise((r) => server.listen(4174, r));
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: "dark" });
await ctx.addInitScript(() => {
  if (sessionStorage.getItem("seeded")) return; sessionStorage.setItem("seeded", "1");
  localStorage.setItem("f7-session", JSON.stringify({ id: "local-1", name: "Praki", phone: "+919876543210", onboarded: true, checkins: [], weights: [{ date: "2026-09-21", kg: 76 }], followed: [], reserved: [], treksDone: 0, streakWeeks: 0, heightCm: 172, age: 28, sex: "male", activity: "gym5", goal: "general", hideCalories: false, glassMl: 250, notifications: { meals: false, water: false } }));
  localStorage.removeItem("f7-food");
});
const page = await ctx.newPage();
page.on("pageerror", (e) => console.log("PAGEERROR", e.message));
const ok = (n, c) => console.log((c ? "ok   " : "FAIL ") + n);
await page.goto("http://localhost:4174/food", { waitUntil: "networkidle" }); await page.waitForTimeout(1200);
await page.getByRole("button", { name: "Add to Dinner" }).first().click(); await page.waitForTimeout(1200);
ok("add opened with Dinner", (await page.getByText(/^Dinner \d/).count()) > 0);
await page.getByLabel(/Add Chapati with dal/).first().click(); await page.waitForTimeout(400);
await page.getByLabel(/Add Chapati with dal/).first().click(); await page.waitForTimeout(400);
ok("plate shows chapati + dal", (await page.getByText(/Your plate · 2/).count()) > 0);
await page.screenshot({ path: "/tmp/flow-plate.png" });
await page.getByRole("button", { name: /Add to dinner ·/ }).first().click(); await page.waitForTimeout(900);
ok("back on Today", page.url().endsWith("/food"));
ok("toast shown", (await page.getByText(/Added to dinner/).count()) > 0);
await page.screenshot({ path: "/tmp/flow-toast.png" });
const stored = JSON.parse(await page.evaluate(() => localStorage.getItem("f7-food")) || "[]");
ok(`stored ${stored.length} entries, dinner kcal ${stored.filter(e=>e.meal==="dinner").reduce((a,b)=>a+b.kcal,0)}`, stored.length >= 2);
await page.reload({ waitUntil: "networkidle" }); await page.waitForTimeout(1200);
ok("survives reload", (await page.getByText(/Chapati/).count()) > 0);
// undo path
await page.getByRole("button", { name: "Add to Snacks" }).first().click(); await page.waitForTimeout(1000);
await page.getByLabel(/Add Banana/).first().click(); await page.waitForTimeout(300);
await page.getByRole("button", { name: /Add to snacks ·/ }).first().click(); await page.waitForTimeout(700);
await page.getByRole("button", { name: "Undo" }).first().click(); await page.waitForTimeout(500);
const after = JSON.parse(await page.evaluate(() => localStorage.getItem("f7-food")) || "[]");
ok("undo removed banana", !after.some((e) => e.name.startsWith("Banana")));
// back-with-plate guard
await page.getByRole("button", { name: "Add to Lunch" }).first().click(); await page.waitForTimeout(1000);
await page.getByLabel(/Add Curd rice/).first().click(); await page.waitForTimeout(300);
page.once("dialog", (d) => d.accept());
await page.getByRole("button", { name: "Back" }).first().click(); await page.waitForTimeout(900);
const g = JSON.parse(await page.evaluate(() => localStorage.getItem("f7-food")) || "[]");
ok("back with plate → saved after confirm", g.some((e) => e.meal === "lunch"));
await browser.close(); server.close();
