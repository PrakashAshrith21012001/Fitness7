/**
 * Runs the on-device parser over typical Tamil breakfast / lunch strings and
 * prints item → grams → kcal → source.   npx tsx shared/scripts/parse.test.ts
 */
import { FOODS, parseLocal } from "../foods";

const strings = process.argv.slice(2).length
  ? process.argv.slice(2)
  : [
      "2 idli, sambar, coffee",
      "3 idly with sambar and chutney",
      "rendu dosai, thengai chutney, oru filter kaapi",
      "masala dosa and a coffee",
      "pongal vada sambar",
      "ven pongal 1 cup, medu vadai 2",
      "upma 1 cup and tea with sugar",
      "2 poori with potato masala",
      "kal dosa 3 egg curry",
      "idiyappam 4 with coconut milk",
      "1 cup rice, sambar, rasam, poriyal, curd",
      "rice with chicken curry and a boiled egg",
      "meals",
      "curd rice with pickle and appalam",
      "chicken biryani full plate with raita",
      "2 parotta salna",
      "kothu parotta half plate",
      "3 chapati with dal and beans poriyal",
      "lemon rice and papad",
      "sambar sadam 2 cups, mor 1 glass",
      "fish curry with rice and keerai",
      "mutton kuzhambu, rice, egg fry",
      "banana, protein shake with milk after gym",
      "oru cup tea sugar illama, 4 marie biscuit",
      "groundnut chikki 2 pieces and buttermilk",
    ];

console.log(`table: ${FOODS.length} foods, ${FOODS.filter((f) => f.estimate).length} marked estimate\n`);
const pad = (s: string, n: number) => (s.length >= n ? s.slice(0, n) : s + " ".repeat(n - s.length));
let totalItems = 0;
let unmatched = 0;
for (const s of strings) {
  const r = parseLocal(s);
  console.log(`▶ "${s}"${r.mealSlot ? `  [${r.mealSlot}]` : ""}`);
  console.log(`  ${pad("item", 40)} ${pad("grams", 8)} ${pad("kcal", 6)} ${pad("prot", 6)} ${pad("conf", 5)} source`);
  for (const it of r.items) {
    totalItems++;
    console.log(`  ${pad(`${it.name} (${it.portionLabel})`, 40)} ${pad(String(it.grams), 8)} ${pad(String(it.kcal), 6)} ${pad(String(it.proteinG), 6)} ${pad(String(it.confidence), 5)} table${it.estimate ? "*" : ""}${it.needsConfirm ? " ?" : ""}`);
  }
  for (const u of r.unmatched) {
    unmatched++;
    console.log(`  ${pad(`UNMATCHED → model: "${u}"`, 40)}`);
  }
  const kcal = r.items.reduce((a, b) => a + b.kcal, 0);
  console.log(`  = ${kcal} kcal\n`);
}
console.log(`${totalItems} items matched on-device, ${unmatched} fragments would go to the model. * = recipe estimate, ? = confidence < 0.85`);
