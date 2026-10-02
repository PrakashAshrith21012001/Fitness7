/**
 * Search bench.  node shared/scripts/run-ts.js shared/scripts/search.test.ts ["query" …]
 * Each case: query → the id that must come first (or be in the top 3 with "~").
 */
import { searchFood } from "../food-search";
import { parseLocal } from "../foods";

const cases: [string, string][] = [
  ["idli", "idli"], ["idl", "idli"], ["idly", "idli"], ["dosa", "dosa"], ["dossa", "dosa"], ["thosai", "dosa"], ["masala dosa", "masala-dosa"], ["masal dosa", "masala-dosa"],
  ["chiken biriyani", "chicken-biryani"], ["chicken briyani", "chicken-biryani"], ["biryani", "chicken-biryani"], ["ambur biryani", "~ambur"], ["mutton biriyani", "mutton-biryani"],
  ["panner butter masala", "paneer-butter-masala"], ["paneer", "paneer"], ["kadai paneer", "kadai-paneer"], ["pbm", "~"],
  ["parota", "parotta"], ["porotta", "parotta"], ["chapathi", "chapati"], ["chappathi", "chapati"], ["roti", "chapati"],
  ["sambar", "sambar"], ["sambhar", "sambar"], ["rasam", "rasam"], ["curd rice", "curd-rice"], ["thayir sadam", "curd-rice"], ["paruppu sadam", "dal-rice"],
  ["aloo paratha", "aloo-paratha"], ["urulai fry", "~potato"], ["gobi manchurian", "~manchurian"], ["chilli chicken", "chilli-chicken-dry"],
  ["chicken 65", "chicken-65"], ["c65", "chicken-65"], ["tandoori", "~tandoori"], ["shawarma", "~shawarma"], ["al faham", "al-faham"], ["alfaham", "al-faham"],
  ["mcaloo", "mcd-mcaloo-tikki"], ["mc aloo tikki", "mcd-mcaloo-tikki"], ["zinger", "kfc-zinger"], ["dominos farmhouse", "~dom-farmhouse"], ["starbucks latte", "~sb-"],
  ["parle g", "parle-g"], ["parleg", "parle-g"], ["good day", "britannia-good-day-cashew"], ["dairy milk", "cadbury-dairy-milk"], ["maggi", "maggi"],
  ["coffee", "filter-coffee"], ["filter kaapi", "filter-coffee"], ["tea", "tea"], ["chai", "tea"], ["boost", "~boost"], ["horlicks", "~horlicks"],
  ["egg", "egg"], ["muttai", "egg"], ["omlet", "omelette"], ["boiled egg", "egg"], ["egg white", "egg-white"],
  ["banana", "banana"], ["kela", "banana"], ["nendran", "nendran-banana"], ["apple", "apple"], ["watermelon juice", "juice-watermelon"],
  ["chicken breast", "chicken-breast"], ["whey", "whey"], ["protein shake", "protein-shake"], ["oats", "oats"], ["peanut butter", "peanut-butter"],
  ["jalebi", "jalebi"], ["gulab jamun", "gulab-jamun"], ["kulfi", "kulfi"], ["mysore pak", "mysore-pak"], ["jigarthanda", "madurai-jigarthanda"],
  ["idli sambar", "idli-sambar"], ["rajma chawal", "rajma-chawal"], ["meals", "rice-sambar-plate"], ["biryani raita", "~"],
  ["kuzhambu", "~kuzhambu"], ["kulambu", "~kuzhambu"], ["vatha kulambu", "sundakkai-vathal-kuzhambu"], ["meen kulambu", "~fish"], ["nethili fry", "nethili-fry"],
  ["ragi", "~ragi"], ["kambu koozh", "kambu-koozh"], ["pongal", "pongal"], ["ven pongal", "pongal"], ["sakkarai pongal", "sakkarai-pongal"],
  ["puttu", "puttu"], ["appam", "appam"], ["idiyappam", "idiyappam"], ["kerala parotta", "~kerala"], ["beef fry", "~beef"],
  ["2 idli", "idli"], ["idli 3", "idli"], ["half plate biryani", "chicken-biryani"], ["150g chicken breast", "chicken-breast"],
  ["high protein", "~"], ["low carb snacks", "~"], ["protein bar", "protein-bar"], ["veg biryani", "veg-biryani"],
  ["gobi manchurian", "manchurian"], ["chicken", "chicken-curry"], ["prawns", "prawn-masala"], ["basmati", "basmati-cooked"], ["fish", "fish-curry"], ["milk", "milk"],
  ["chilli chicken", "chilli-chicken-dry"], ["toor dal", "dal"], ["cucumber", "cucumber"], ["atta", "atta"], ["amul butter", "~amul"], ["aavin milk", "~aavin"],
  ["thalappakatti", "~thalappakatti"], ["kfc", "kfc-hot-crispy"], ["subway", "~sub-"], ["frooti", "~frooti"], ["bournvita", "~bournvita"], ["muscleblaze", "~mb-"],
  ["lassi", "lassi"], ["mango lassi", "mango-lassi-glass"], ["butter chicken", "butter-chicken"], ["dal makhani", "dal-makhani"], ["pav bhaji", "pav-bhaji"], ["misal", "~misal"],
  ["kothu", "~kothu"], ["kari dosa", "~kari-dosa"], ["nattu kozhi", "~nattu"], ["pallipalayam", "~pallipalayam"], ["kozhukattai", "~kozhukattai"], ["thatte idli", "~thatte"],
  ["sundal", "sundal"], ["murukku", "murukku"], ["badam milk", "badam-milk"], ["rose milk", "juice-rose-milk"], ["nungu", "~nungu"], ["sabja", "sabja-seeds"],
  ["green tea", "black-tea"], ["black coffee", "black-coffee"], ["cold coffee", "chocolate-shake"], ["oats with milk", "oats"], ["overnight oats", "~overnight"], ["muesli", "~muesli"],
  ["egg white omelette", "egg-white-omelette"], ["2 eggs", "egg"], ["3 boiled eggs", "egg"], ["1 cup rice", "rice"], ["200 ml milk", "milk"], ["1 scoop whey", "whey"],
];

const extra = process.argv.slice(2);
let pass = 0;
const fails: string[] = [];
const show = (q: string) => {
  const r = searchFood(q, { slot: "lunch" });
  return `${q}${r.qty !== null ? ` [qty ${r.qty}${r.unitWord ? " " + r.unitWord : ""}]` : ""}${r.intent ? ` [intent ${r.intent.label}]` : ""}${r.didYouMean ? ` [did you mean ${r.didYouMean}]` : ""} → ` + r.hits.slice(0, 5).map((h) => `${h.id}(${h.text.toFixed(2)} ${h.via})`).join(", ");
};
if (extra.length) {
  extra.forEach((q) => console.log(show(q)));
} else {
  const t0 = Date.now();
  for (const [q, want] of cases) {
    const r = searchFood(q, { slot: "lunch" });
    const ids = r.hits.map((h) => h.id);
    const ok = want === "~" ? ids.length > 0 : want.startsWith("~") ? ids.slice(0, 3).some((i) => i.includes(want.slice(1))) : ids[0] === want;
    if (ok) pass++;
    else fails.push(show(q) + `   (want ${want})`);
  }
  const ms = (Date.now() - t0) / cases.length;
  console.log(`search: ${pass}/${cases.length} · ${ms.toFixed(1)} ms per query`);
  fails.forEach((f) => console.log("  ✗ " + f));
  for (const s of ["2 chiken biriyani and raita", "rendu dossa oru kaapi", "panner butter masala with 2 naan", "mcaloo tikki and coke", "parleg 4 and tea"]) {
    const p = parseLocal(s);
    console.log(`parse: ${s} → ${p.items.map((i) => `${i.name} ${i.portionLabel} ${i.kcal}kcal (${i.confidence})`).join(" | ")}${p.unmatched.length ? ` · unmatched: ${p.unmatched.join(", ")}` : ""}`);
  }
}
