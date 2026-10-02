/** Lists aliases the ownership rules took off rows.  node shared/scripts/run-ts.js shared/scripts/alias-moves.ts */
import { FOODS } from "../foods";
import { EXTRA_ROWS } from "../food-data";
const src = require("fs").readFileSync(require("path").join(__dirname, "../foods.js"), "utf8") as string;
void src;
const final = new Map(FOODS.map((f) => [f.id, new Set(f.aliases)]));
for (const r of EXTRA_ROWS) {
  const lost = r[9].filter((a) => !final.get(r[0])?.has(a));
  if (lost.length) console.log(`extra ${r[0]} lost: ${lost.join(", ")}`);
}
