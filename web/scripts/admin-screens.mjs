/**
 * Screenshots of /admin in owner mode against a running `next start`.
 *   OWNER_PASSWORD=… npx next start -p 3056 &   then   ADMIN_URL=http://localhost:3056 OWNER_PASSWORD=… node scripts/admin-screens.mjs
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
const base = process.env.ADMIN_URL ?? "http://localhost:3056";
const pw = process.env.OWNER_PASSWORD ?? "frontdesk-2026";
await mkdir("screens/admin", { recursive: true });
const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
for (const [name, vp] of [["desktop", { width: 1280, height: 800 }], ["mobile", { width: 390, height: 844 }]]) {
  const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto(`${base}/admin/login?mode=owner`);
  await page.screenshot({ path: `screens/admin/login-${name}.png` });
  await page.fill("input[name=password]", pw);
  await page.click("button[type=submit]");
  await page.waitForURL(/\/admin$/);
  for (const [n, path] of [["overview", "/admin"], ["treks", "/admin/treks"], ["trek-new", "/admin/treks/new"], ["members", "/admin/members"], ["leads", "/admin/leads"], ["announcements", "/admin/announcements"], ["staff", "/admin/staff"]]) {
    await page.goto(`${base}${path}`, { waitUntil: "networkidle" });
    await page.screenshot({ path: `screens/admin/${n}-${name}.png`, fullPage: n === "trek-new" });
    const err = await page.locator("text=Application error").count();
    if (err) console.log("ERROR on", path);
  }
  await ctx.close();
}
await b.close();
console.log("done");
