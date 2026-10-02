/** node shared/scripts/run-ts.js shared/scripts/find-food.ts "word" ["word"…] — ids/names containing each word */
import { FOODS } from "../foods";
for (const q of process.argv.slice(2)) {
  const k = q.toLowerCase();
  const hits = FOODS.filter((f) => f.id.includes(k.replace(/ /g, "-")) || f.name.toLowerCase().includes(k) || f.aliases.some((a) => a === k));
  console.log(`## ${q}: ` + hits.slice(0, 12).map((f) => `${f.id} [${f.name}]`).join(" | "));
}
