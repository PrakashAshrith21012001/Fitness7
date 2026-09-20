/**
 * Screenshots of the app's food screens from the web export, both themes,
 * 390×844, plus a contrast check on the ring labels.
 *
 *   cd mobile && npx expo export --platform web
 *   node web/scripts/screens.mjs            # writes web/screens/*.png
 */
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile, stat, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const dist = path.resolve(here, "../../mobile/dist");
const out = path.resolve(here, "../screens");
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
await new Promise((r) => server.listen(4173, r));

const today = new Date();
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const dayMinus = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return iso(d); };

const member = {
  id: "local-demo", name: "Praki", phone: "+919876543210", provider: "phone", goal: "fat-loss", slot: "evening",
  plan: { id: "quarterly", name: "Quarterly", renewsOn: dayMinus(-40) }, joinedOn: dayMinus(60), onboarded: true, treksDone: 2, streakWeeks: 3,
  notifications: { classes: true, treks: true, renewals: true },
  checkins: [dayMinus(0), dayMinus(2), dayMinus(4), dayMinus(7), dayMinus(9), dayMinus(14)],
  weights: [{ date: dayMinus(21), kg: 78 }, { date: dayMinus(14), kg: 77.4 }, { date: dayMinus(7), kg: 76.9 }, { date: dayMinus(0), kg: 76.2 }],
  followed: ["strength"], reserved: [], heightCm: 172, age: 28, sex: "male", activity: "gym5", hideCalories: false,
};
const entry = (i, date, meal, name, foodId, grams, portionLabel, kcal, proteinG, carbsG, fatG, confidence = 1, source = "table") =>
  ({ id: `e${i}`, date, meal, name, foodId, grams, portionLabel, kcal, proteinG, carbsG, fatG, confidence, source, loggedAt: `${date}T0${(i % 9)}:00:00.000Z` });
const food = [
  entry(1, dayMinus(0), "breakfast", "Idli", "idli", 120, "3 × idli", 158, 4.7, 33.5, 0.5),
  entry(2, dayMinus(0), "breakfast", "Sambar", "sambar", 150, "1 katori", 98, 4.5, 14.3, 2.4),
  entry(3, dayMinus(0), "breakfast", "Filter coffee (milk & sugar)", "filter-coffee", 120, "1 cup", 62, 1.6, 9.6, 1.9),
  entry(4, dayMinus(0), "lunch", "White rice (cooked)", "rice", 200, "200 g", 260, 5.4, 56, 0.6),
  entry(5, dayMinus(0), "lunch", "Chicken curry", "chicken-curry", 150, "1 katori", 218, 21, 6, 12),
  entry(6, dayMinus(0), "lunch", "Curd", "curd", 100, "1 katori", 60, 3.1, 3, 4),
  entry(7, dayMinus(0), "snacks", "Banana", "banana", 100, "1 medium", 90, 1.2, 22, 0.3),
  entry(8, dayMinus(0), "snacks", "Protein shake (scoop + milk)", "protein-shake", 280, "1 shake", 294, 33.6, 18.2, 9.8, 0.78, "model"),
  ...[1, 2, 3, 4, 5, 6].flatMap((n) => [
    entry(10 + n * 3, dayMinus(n), "breakfast", "Dosa", "dosa", 160, "2 × dosa", 269, 6.2, 44, 7.8),
    entry(11 + n * 3, dayMinus(n), "lunch", "South Indian meals — rice", "rice", 250, "250 g", 325 + n * 40, 6.8, 70, 0.8),
    entry(12 + n * 3, dayMinus(n), "dinner", "Chapati", "chapati", 80, "2 × chapati", 192 + n * 30, 6, 36.8, 2.2),
  ]),
];

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const shots = [
  ["home", "/"],
  ["food", "/food"],
  ["add", "/food/add?text=" + encodeURIComponent("2 idli, sambar, oru filter coffee")],
  ["snap", "/food/snap?fixture=1"],
  ["settings", "/settings"],
  ["progress", "/progress"],
];
const results = [];
for (const theme of ["dark", "light"]) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: theme });
  await ctx.addInitScript(({ member, food, theme }) => {
    localStorage.setItem("f7-session", JSON.stringify(member));
    localStorage.setItem("f7-food", JSON.stringify(food));
    localStorage.setItem("f7-theme", theme);
  }, { member, food, theme });
  for (const [name, route] of shots) {
    const page = await ctx.newPage();
    await page.goto(`http://localhost:4173${route}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(name === "home" ? 2500 : 1200);
    await page.screenshot({ path: path.join(out, `${name}-${theme}.png`), fullPage: false });
    if (name === "food") {
      // contrast of the ring labels: sample text colour vs the card background behind it
      const c = await page.evaluate(() => {
        const lum = (rgb) => { const [r, g, b] = rgb.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
        const parse = (s) => (s.match(/[\d.]+/g) ?? []).slice(0, 4).map(Number);
        const els = [...document.querySelectorAll("div, span")].filter((e) => /^(\d[\d,]*|KCAL|PROTEIN)$/.test(e.textContent?.trim() ?? "") && e.children.length === 0);
        return els.slice(0, 4).map((e) => {
          const fg = parse(getComputedStyle(e).color);
          // composite every ancestor background (the ring card is a translucent green wash over the canvas)
          const layers = [];
          for (let n = e.parentElement; n; n = n.parentElement) {
            const p = parse(getComputedStyle(n).backgroundColor);
            if (p.length === 3) layers.push([...p, 1]);
            else if (p.length === 4 && p[3] > 0) layers.push(p);
          }
          let bg = [255, 255, 255];
          for (const [r, g, b, a] of layers.reverse()) bg = [bg[0] * (1 - a) + r * a, bg[1] * (1 - a) + g * a, bg[2] * (1 - a) + b * a];
          const L1 = lum(fg), L2 = lum(bg);
          const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
          return { text: e.textContent.trim(), fg, bg: bg.map(Math.round), ratio: Math.round(ratio * 100) / 100 };
        });
      });
      results.push({ theme, contrast: c });
    }
    await page.close();
  }
  await ctx.close();
}
await browser.close();
server.close();
console.log(JSON.stringify(results, null, 2));
console.log(`screenshots → ${out}`);
