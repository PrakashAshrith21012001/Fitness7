import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
const dist = "/home/claude/Fitness7/mobile/dist";
const server = createServer(async (req, res) => {
  const url = decodeURIComponent((req.url ?? "/").split("?")[0]);
  for (const p of [path.join(dist, url), path.join(dist, url + ".html"), path.join(dist, url, "index.html"), path.join(dist, "index.html")]) {
    try { if ((await stat(p)).isFile()) { res.writeHead(200, { "content-type": p.endsWith(".js") ? "text/javascript" : p.endsWith(".html") ? "text/html" : "application/octet-stream" }); res.end(await readFile(p)); return; } } catch {}
  }
  res.writeHead(404).end();
});
await new Promise((r) => server.listen(4176, r));
const member = { id: "local-demo", name: "Praki Ashrith", phone: "+919620273116", provider: "phone", plan: { id: "quarterly", name: "Quarterly", renewsOn: "2026-11-01" }, joinedOn: "2026-05-25", onboarded: true, treksDone: 2, streakWeeks: 3, notifications: { classes: true, treks: true, renewals: true, meals: true, water: true }, checkins: [], weights: [], followed: [], reserved: [], glassMl: 250 };
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: "dark" });
await ctx.addInitScript((m) => { localStorage.setItem("f7-session", JSON.stringify(m)); localStorage.setItem("f7-theme", "dark"); }, member);
const page = await ctx.newPage();
const errs = [];
page.on("pageerror", (e) => errs.push("PAGEERROR " + e.message));
const out = "/tmp/claude-0/-home-claude/a11507e9-82c1-51ad-9a4b-1cfc1e237a82/scratchpad/flow2";
await (await import("node:fs/promises")).mkdir(out, { recursive: true });
const shot = async (n) => { await page.waitForTimeout(900); await page.screenshot({ path: `${out}/${n}.png` }); console.log(n, page.url()); };
const click = async (label) => { const l = page.locator(`[aria-label="${label}"], [role=button]:has-text("${label}")`).first(); await l.click({ timeout: 8000 }); };
await page.goto("http://localhost:4176/fitness", { waitUntil: "networkidle" }); await page.waitForTimeout(1500);
// find a slot chip (aria-label contains a time) and click it
const chips = page.locator('[role=button][aria-label*="M"]').filter({ hasText: /\d:\d\d/ });
console.log("slot chips", await chips.count());
for (let i = 0; i < await chips.count(); i++) { const t = await chips.nth(i).getAttribute("aria-label"); if (!/wait|booked/i.test(t ?? "")) { await chips.nth(i).click(); break; } }
await shot("a-booking");
try { await click("Other"); } catch (e) { errs.push("other: " + e.message.slice(0, 80)); }
await shot("b-reminder-other");
try { await page.locator('[role=button]:has-text("Mark attendance"), [role=button]:has-text("MARK ATTENDANCE")').first().click({ timeout: 8000 }); } catch (e) { errs.push("mark: " + e.message.slice(0, 80)); }
await shot("c-attended");
await page.goto("http://localhost:4176/fitness?tab=profile", { waitUntil: "networkidle" }); await shot("d-profile");
await page.goto("http://localhost:4176/plan", { waitUntil: "networkidle" }); await page.waitForTimeout(1200);
const next = async () => { await page.locator('[role=button]:has-text("Next"), [role=button]:has-text("Build my plan")').first().click({ timeout: 8000 }); await page.waitForTimeout(500); };
await next(); await shot("e-q1");
await page.locator('[role=radio], [role=button]').filter({ hasText: /^Male$/ }).first().click(); await next(); await shot("f-q2");
await page.locator("input").first().fill("28"); await next(); await shot("g-q3");
for (const t of [/Lose weight/, /Just starting/, /4 days/, /^Arms$/, /At Fitness 7/]) { await page.locator('[role=radio], [role=button], [role=checkbox]').filter({ hasText: t }).first().click(); await next(); }
await shot("h-plan-result");
console.log(errs.join("\n") || "NO ERRORS");
await browser.close(); server.close();
