/**
 * Food search — the type-ahead under "What did you eat?".
 *
 * What it does, in order:
 *  1. Reads a quantity off the query: "2 idli", "idli 2", "half plate biryani",
 *     "150 g chicken" → the hit carries qty/unit so one tap adds the right amount.
 *  2. Understands intents: "high protein", "low carb snacks", "veg breakfast",
 *     "protein drinks" → a ranked list by protein / calories / carbs.
 *  3. Matches every word the member typed against every name and alias:
 *       exact word · word prefix (the word still being typed) · typo
 *       (1 edit for 4–5 letters, 2 for longer) · sound-alike spelling
 *       ("chiken", "biriyani", "panner", "dossa") · glued words ("parleg",
 *       "panipuri") · regional names folded onto one word (aloo/urulai/batata).
 *  4. Ranks: how well the words match (all words, in order, tight name beats a
 *     long one) → then nudges by what this member logs often, how common the
 *     food is, and whether it suits the meal being logged. An exact name
 *     always stays above a fuzzy guess, whatever the history says.
 *  5. "Did you mean …" when nothing matches well.
 *
 * Runs on the phone in a few milliseconds over ~2,000 foods; no network.
 */
import { COMBOS, FOODS, FOOD_BY_ID, STOP, UNITS, readQuantity, registerFuzzy, tokens, type Combo, type Food, type FoodCategory, type Unit } from "./foods";
import type { MealSlot } from "./supabase-types";

export type SearchHit = {
  kind: "food" | "combo";
  id: string;
  food?: Food;
  combo?: Combo;
  /** text match 0–1.2 (≥1.1 exact name/alias) */
  text: number;
  /** final rank score */
  score: number;
  via: "exact" | "words" | "prefix" | "typo" | "intent";
  /** the name or alias that matched */
  matched: string;
};

export type Intent = {
  label: string;
  sort: "protein" | "lowcal" | "lowcarb" | "fibre" | "healthy" | "popular";
  categories?: FoodCategory[];
  veg?: boolean;
};

export type SearchResult = {
  hits: SearchHit[];
  /** quantity typed with the query ("2 idli" → 2) */
  qty: number | null;
  unit: Unit | null;
  unitWord: string | null;
  intent?: Intent;
  /** a close name when nothing matched well */
  didYouMean?: string;
};

export type SearchOptions = {
  limit?: number;
  /** meal being logged — breakfast foods rise in the morning */
  slot?: MealSlot;
  /** food/combo id → times this member logged it */
  history?: Record<string, number>;
  /** ids logged most recently, newest first */
  recent?: string[];
  /** only vegetarian */
  veg?: boolean;
  /** include plates (combos) — default true */
  combos?: boolean;
};

/* ------------------------------------------------------------------ */
/* Index                                                              */
/* ------------------------------------------------------------------ */

type Key = { doc: number; text: string; toks: string[]; joined: string; isName: boolean; stripped: boolean };
type Doc = { kind: "food" | "combo"; id: string; food?: Food; combo?: Combo; pop: number; category?: FoodCategory; veg: boolean };

type Vocab = { all: string[]; sorted: string[]; byLen: Map<number, string[]>; phon: Map<string, string[]> };
let built: { docs: Doc[]; keys: Key[]; vocab: Vocab } | null = null;

const clean = (s: string) => s.replace(/\s*\(.*?\)/g, " ").replace(/\s*\/\s*/g, " ");

/** Fillers only — unlike the sentence reader, search keeps "cold", "hot", "full", "small" because they name foods. */
const FILLER = new Set(["a", "an", "the", "of", "some", "with", "and", "plus", "had", "ate", "eat", "for", "my", "i", "me", "in", "at", "just", "only", "also", "then", "today", "yesterday"]);
function toks(s: string): string[] {
  return tokens(s).filter((t) => t && !FILLER.has(t));
}

/** Rough sound-alike key for Indian-English spellings: dosa/dossa/thosai, paneer/panner, chicken/chiken. */
export function phonetic(w: string): string {
  return w
    .replace(/(.)\1+/g, "$1")
    .replace(/ph/g, "f")
    .replace(/zh/g, "l")
    .replace(/([bcdgjkpt])h/g, "$1")
    .replace(/w/g, "v")
    .replace(/(ee|ea|ie|ii)/g, "i")
    .replace(/(oo|ou|uu)/g, "u")
    .replace(/aa/g, "a")
    .replace(/ck|q/g, "k")
    .replace(/c(?=[aou])/g, "k")
    .replace(/z/g, "s")
    .replace(/y$/g, "i")
    .replace(/e$/g, "i")
    .replace(/(.)\1+/g, "$1");
}

function build() {
  if (built) return built;
  const docs: Doc[] = [];
  const keys: Key[] = [];
  const vocabSet = new Set<string>();
  const addKey = (doc: number, text: string, isName: boolean, vague = false) => {
    const all = tokens(text).filter(Boolean);
    const t = all.filter((w) => !FILLER.has(w));
    if (!t.length) return;
    t.forEach((w) => vocabSet.add(w));
    // "hotel pongal" minus its stop word is just "pongal" — it may match, but never as an exact name
    keys.push({ doc, text, toks: t, joined: t.join(""), isName, stripped: vague || t.length !== all.length });
  };
  for (const f of FOODS) {
    const d = docs.push({ kind: "food", id: f.id, food: f, pop: f.pop, category: f.category, veg: f.veg }) - 1;
    const nameCore = clean(f.name).trim();
    // "Chicken (boiled, with skin)" read as just "chicken" — a match, never an exact name
    const lostParens = nameCore.toLowerCase() !== f.name.toLowerCase().trim() && !/\s/.test(nameCore);
    addKey(d, nameCore, true, lostParens);
    if (f.brand) addKey(d, `${f.brand} ${clean(f.name)}`, false);
    for (const a of f.aliases) addKey(d, a, false);
  }
  for (const c of COMBOS) {
    const veg = c.parts.every((p) => FOOD_BY_ID[p.id]?.veg !== false);
    const d = docs.push({ kind: "combo", id: c.id, combo: c, pop: 2, veg }) - 1;
    addKey(d, clean(c.name), true);
    for (const a of c.aliases) addKey(d, a, false);
  }
  const all = [...vocabSet];
  const phon = new Map<string, string[]>();
  const byLen = new Map<number, string[]>();
  for (const v of all) {
    const p = phonetic(v);
    (phon.get(p) ?? phon.set(p, []).get(p)!).push(v);
    (byLen.get(v.length) ?? byLen.set(v.length, []).get(v.length)!).push(v);
  }
  built = { docs, keys, vocab: { all, sorted: [...all].sort(), byLen, phon } };
  return built;
}

/* ------------------------------------------------------------------ */
/* Word matching                                                      */
/* ------------------------------------------------------------------ */

/** Damerau–Levenshtein (optimal string alignment) with an early exit above `max`. */
function edits(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const n = a.length;
  const m = b.length;
  let prev2: number[] = [];
  let prev: number[] = Array.from({ length: m + 1 }, (_, j) => j);
  for (let i = 1; i <= n; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= m; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, prev2[j - 2] + 1);
      cur.push(v);
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > max) return max + 1;
    prev2 = prev;
    prev = cur;
  }
  return prev[m];
}

const maxEdits = (len: number) => (len <= 3 ? 0 : len <= 5 ? 1 : 2);

type WordHit = { score: number; via: SearchHit["via"] };

/** Every vocabulary word this query word could mean, with a score. Cached per word — typing repeats them. */
const cache = new Map<string, Map<string, WordHit>>();
function wordMatches(q: string, partial: boolean, vocab: Vocab): Map<string, WordHit> {
  const ck = `${partial ? 1 : 0}${q}`;
  const hit = cache.get(ck);
  if (hit) return hit;
  const out = new Map<string, WordHit>();
  const put = (w: string, score: number, via: SearchHit["via"]) => {
    const cur = out.get(w);
    if (!cur || cur.score < score) out.set(w, { score, via });
  };
  const qp = phonetic(q);
  for (const w of vocab.phon.get(qp) ?? []) put(w, w === q ? 1 : 0.9, w === q ? "exact" : "typo");
  // prefixes: a binary search into the sorted vocabulary, then walk while it still starts with q
  if (q.length >= 2) {
    let lo = 0;
    let hi = vocab.sorted.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (vocab.sorted[mid] < q) lo = mid + 1;
      else hi = mid;
    }
    for (let i = lo; i < vocab.sorted.length && vocab.sorted[i].startsWith(q); i++) {
      const v = vocab.sorted[i];
      if (v === q) put(v, 1, "exact");
      else put(v, (partial ? 0.84 : 0.72) + 0.12 * (q.length / v.length), "prefix");
    }
  }
  // typos: only words of a near length can be within the edit budget
  const max = maxEdits(q.length);
  if (max > 0) {
    for (let len = q.length - max; len <= q.length + max; len++) {
      for (const v of vocab.byLen.get(len) ?? []) {
        if (out.has(v)) continue;
        const d = edits(q, v, max);
        if (d <= max) put(v, 0.84 - 0.12 * d, "typo");
      }
    }
    if (q.length >= 5) {
      for (let len = q.length - 1; len <= q.length + 1; len++) {
        for (const v of vocab.byLen.get(len) ?? []) if (!out.has(v) && edits(qp, phonetic(v), 1) <= 1) put(v, 0.7, "typo");
      }
    }
  }
  // the word still being typed, with a slip: "chikc" → chicken
  if (partial && q.length >= 4) {
    for (const [len, list] of vocab.byLen) {
      if (len <= q.length) continue;
      for (const v of list) if (!out.has(v) && v[0] === q[0] && edits(q, v.slice(0, q.length), 1) <= 1) put(v, 0.68, "typo");
    }
  }
  // inside a longer word: "burger" in "vegburger"
  if (q.length >= 5) for (const v of vocab.all) if (!out.has(v) && v.length > q.length && v.includes(q)) put(v, 0.62, "prefix");
  if (cache.size > 400) cache.clear();
  cache.set(ck, out);
  return out;
}

/* ------------------------------------------------------------------ */
/* Intents                                                            */
/* ------------------------------------------------------------------ */

const INTENT_WORDS: Record<string, Partial<Intent> & { kind: "sort" | "veg" | "cat" | "noise" }> = {
  protein: { kind: "sort", sort: "protein", label: "High protein" },
  "high-protein": { kind: "sort", sort: "protein", label: "High protein" },
  lowcal: { kind: "sort", sort: "lowcal", label: "Low calorie" },
  "low-calorie": { kind: "sort", sort: "lowcal", label: "Low calorie" },
  diet: { kind: "sort", sort: "lowcal", label: "Low calorie" },
  light: { kind: "sort", sort: "lowcal", label: "Light" },
  healthy: { kind: "sort", sort: "healthy", label: "Healthy" },
  clean: { kind: "sort", sort: "healthy", label: "Healthy" },
  nutritious: { kind: "sort", sort: "healthy", label: "Healthy" },
  lowcarb: { kind: "sort", sort: "lowcarb", label: "Low carb" },
  "low-carb": { kind: "sort", sort: "lowcarb", label: "Low carb" },
  keto: { kind: "sort", sort: "lowcarb", label: "Keto / low carb" },
  fibre: { kind: "sort", sort: "fibre", label: "High fibre" },
  fiber: { kind: "sort", sort: "fibre", label: "High fibre" },
  veg: { kind: "veg", veg: true },
  vegetarian: { kind: "veg", veg: true },
  "non-veg": { kind: "veg", veg: false },
  nonveg: { kind: "veg", veg: false },
  high: { kind: "noise" },
  low: { kind: "noise" },
  rich: { kind: "noise" },
  food: { kind: "noise" },
  foods: { kind: "noise" },
  option: { kind: "noise" },
  item: { kind: "noise" },
  idea: { kind: "noise" },
};
const INTENT_CATS: Record<string, FoodCategory[]> = {
  snack: ["snack", "nuts", "fruit", "protein", "dairy", "egg"],
  breakfast: ["breakfast", "egg", "dairy"],
  tiffin: ["breakfast"],
  lunch: ["rice", "dal", "veg", "nonveg", "north"],
  dinner: ["bread", "breakfast", "dal", "veg", "nonveg", "north"],
  drink: ["drink", "dairy"],
  beverage: ["drink"],
  sweet: ["sweet"],
  dessert: ["sweet"],
  fruit: ["fruit"],
  nut: ["nuts"],
  curry: ["veg", "nonveg", "north", "dal"],
};

function readIntent(words: string[]): { intent?: Intent; rest: string[] } {
  const joined = words.join(" ").replace(/\blow (carb|calorie|cal|fat)\b/g, (_, w) => `low-${w === "cal" ? "calorie" : w}`).replace(/\bhigh protein\b/g, "high-protein").replace(/\bnon veg\b/g, "non-veg");
  const ws = joined.split(" ").filter(Boolean);
  let intent: Intent | undefined;
  const rest: string[] = [];
  let sawIntent = false;
  for (const w of ws) {
    const iw = INTENT_WORDS[w];
    if (iw) {
      sawIntent = sawIntent || iw.kind !== "noise";
      intent = intent ?? { label: "", sort: "popular" };
      if (iw.kind === "sort") {
        intent.sort = iw.sort!;
        intent.label = iw.label!;
      } else if (iw.kind === "veg") intent.veg = iw.veg;
      continue;
    }
    rest.push(w);
  }
  if (!sawIntent) return { rest: words };
  // the rest may only be category words ("protein snacks") — otherwise it's a dish name ("protein bar", "veg biryani")
  const cats: FoodCategory[] = [];
  const catWords: string[] = [];
  for (const w of rest) {
    const c = INTENT_CATS[w] ?? INTENT_CATS[w.replace(/s$/, "")];
    if (c) {
      cats.push(...c);
      catWords.push(w);
    } else return { rest: words };
  }
  if (cats.length) intent!.categories = Array.from(new Set(cats));
  const vegLabel = intent!.veg === true ? "Veg" : intent!.veg === false ? "Non-veg" : "";
  const catLabel = catWords.length ? catWords.join(" ") : "";
  intent!.label = [intent!.label || (intent!.sort === "popular" ? "" : ""), vegLabel, catLabel].filter(Boolean).join(" · ") || "Popular";
  return { intent, rest: [] };
}

function intentHits(intent: Intent, opts: SearchOptions): SearchHit[] {
  const veg = intent.veg ?? opts.veg;
  const breakfastish = /oat|shake|whey|yogurt|smoothie|sprout|chilla|cheela|pancake|muesli|granola|toast|sandwich|bhurji|omelette|poha|upma/;
  const inCats = (f: Food) => !intent.categories || intent.categories.includes(f.category) || (intent.categories.includes("breakfast") && breakfastish.test(f.id));
  const pool = FOODS.filter((f) => f.pop >= 2 && !f.brand && f.category !== "condiment" && (veg === undefined || f.veg === veg) && inCats(f));
  const per = (f: Food) => {
    const k = f.portion.grams / 100;
    return { kcal: f.per100.kcal * k, p: f.per100.protein * k, c: f.per100.carbs * k, fat: f.per100.fat * k };
  };
  const metric = (f: Food): number => {
    const m = per(f);
    switch (intent.sort) {
      case "protein": {
        // high protein = at least a quarter of the calories from protein, then the most protein per portion
        const share = (4 * f.per100.protein) / Math.max(1, f.per100.kcal);
        // within a meal (breakfast, snacks) Indian food is carb-heavy — a fifth of calories from protein already stands out
        const need = intent.categories ? 0.18 : 0.25;
        return m.p >= 6 && share >= need ? m.p + share * 20 : -1;
      }
      case "lowcal":
        // a real dish under ~300 kcal that still feeds you: everyday first, protein helps, fewer calories helps
        return m.kcal >= 80 && m.kcal <= 300 && !["condiment", "bread", "drink"].includes(f.category) ? f.pop * 12 + m.p * 1.5 + (300 - m.kcal) / 15 : -1;
      case "lowcarb":
        return m.kcal > 30 && f.per100.carbs < 10 ? 100 - f.per100.carbs * 4 + f.per100.protein : -1;
      case "healthy": {
        // whole foods, not fried, not sugary, a sensible portion — sprouts, fruit, curd, idli, grilled, dal
        const text = `${f.id} ${f.name}`.toLowerCase();
        if (/fried|fry|bajji|bonda|samosa|chips|cake|biscuit|pakoda|puff|cream|chocolate|soft drink|cola|sweet|halwa|jamun|burger|pizza|fries/.test(text) || f.category === "sweet") return -1;
        const good = /sprout|makhana|chana|sundal|fruit|apple|guava|papaya|orange|pear|banana|curd|buttermilk|salad|almond|walnut|peanut|egg|oats|ragi|millet|idli|dal|soup|grilled|steamed|boiled|tikka|paneer|yogurt|dahi|poha|upma|kosambari|cucumber|carrot/.test(text);
        return m.kcal >= 40 && m.kcal <= 300 ? (good ? 20 : 0) + f.pop * 6 + Math.min(15, m.p) + (300 - m.kcal) / 30 : -1;
      }
      case "fibre":
        return /dal|sprout|chana|rajma|oats|millet|ragi|keerai|spinach|salad|vegetable|guava|apple|pear|beans/i.test(f.id) ? f.pop * 10 + f.per100.protein : -1;
      default:
        return f.pop * 10;
    }
  };
  const ranked = pool
    // a snack is a snack: nothing over ~350 kcal a portion; raw ingredients aren't suggestions
    .filter((f) => !(intent.categories?.includes("snack") && (f.per100.kcal * f.portion.grams) / 100 > 350) && !RAW.test(f.name))
    .map((f) => ({ f, base: metric(f) }))
    .filter((x) => x.base > 0) // fails the intent itself — popularity can't rescue it
    .map(({ f, base }) => ({ f, m: base + f.pop * 2 + Math.min(6, Math.log2(1 + (opts.history?.[f.id] ?? 0)) * 3) }))
    .sort((a, b) => b.m - a.m);
  // variety: at most three from one category, so "veg protein" isn't five whey shakes
  const perCat: Record<string, number> = {};
  const varied = ranked.filter((x) => (perCat[x.f.category] = (perCat[x.f.category] ?? 0) + 1) <= 3);
  // no veg preference given: alternate non-veg and veg so the list isn't ten chicken dishes
  let ordered = varied;
  if (veg === undefined) {
    const v = varied.filter((x) => x.f.veg);
    const n = varied.filter((x) => !x.f.veg);
    ordered = [];
    for (let i = 0; i < Math.max(v.length, n.length); i++) {
      if (n[i]) ordered.push(n[i]);
      if (v[i]) ordered.push(v[i]);
    }
  }
  return ordered
    .slice(0, opts.limit ?? 12)
    .map(({ f, m }) => ({ kind: "food" as const, id: f.id, food: f, text: 1, score: m, via: "intent" as const, matched: intent.label }));
}

/* ------------------------------------------------------------------ */
/* Ranking                                                            */
/* ------------------------------------------------------------------ */

const SLOT_CATS: Record<MealSlot, FoodCategory[]> = {
  breakfast: ["breakfast", "egg", "bread", "drink", "dairy", "fruit"],
  morning_snack: ["fruit", "nuts", "drink", "snack", "dairy", "protein"],
  lunch: ["rice", "dal", "veg", "nonveg", "north", "bread"],
  snacks: ["snack", "drink", "fruit", "nuts", "sweet", "protein", "fastfood"],
  dinner: ["bread", "breakfast", "dal", "veg", "nonveg", "north", "rice"],
};

/** Bare words that mean the everyday dish ("chicken" → chicken curry). */
const EVERYDAY: Record<string, string> = {
  chicken: "chicken-curry", mutton: "mutton-curry", fish: "fish-curry", prawn: "prawn-masala", egg: "egg", rice: "rice", dal: "dal", milk: "milk", curd: "curd", tea: "tea", coffee: "filter-coffee",
  biryani: "chicken-biryani", roti: "chapati", paratha: "paratha", juice: "fruit-juice", soup: "vegetable-soup", salad: "salad", paneer: "paneer", bread: "bread", banana: "banana", oats: "oats", dosa: "dosa", idli: "idli",
};

/** "Toor dal, raw", "Basmati rice, uncooked" — ingredients rank under dishes unless you ask for raw. */
const RAW = /\braw\b|\buncooked\b/i;

export function searchFood(query: string, opts: SearchOptions = {}): SearchResult {
  const { docs, keys, vocab } = build();
  const limit = opts.limit ?? 12;
  const raw = query.toLowerCase();
  const partial = !/\s$/.test(raw);
  const { qty, unit, unitWord, rest } = readQuantity(raw.trim().replace(/\s+/g, " "));
  const words = toks(rest);
  if (!words.length) return { hits: [], qty, unit, unitWord };

  const { intent, rest: dishWords } = readIntent(rest.split(" ").filter(Boolean));
  if (intent && !dishWords.length) return { hits: intentHits(intent, opts), qty, unit, unitWord, intent };

  const q = words;
  const glued = q.join("");
  const per = q.map((w, i) => wordMatches(w, partial && i === q.length - 1, vocab));

  const bestByDoc = new Map<number, { text: number; via: SearchHit["via"]; matched: string }>();
  for (const k of keys) {
    let text = 0;
    let via: SearchHit["via"] = "words";
    if (k.joined === glued) {
      text = k.stripped ? 0.98 : k.toks.join(" ") === q.join(" ") ? 1.15 : 1.1; // exact, or the same words glued ("parleg")
      via = k.stripped ? "words" : "exact";
    } else {
      let sum = 0;
      let missed = 0;
      let lastPos = -1;
      let inOrder = true;
      let firstHit = false;
      let typo = false;
      let prefix = false;
      const used = new Set<number>();
      for (let i = 0; i < q.length; i++) {
        let best = 0;
        let bestPos = -1;
        let bestVia: SearchHit["via"] = "words";
        for (let j = 0; j < k.toks.length; j++) {
          if (used.has(j)) continue;
          const h = per[i].get(k.toks[j]);
          if (h && h.score > best) {
            best = h.score;
            bestPos = j;
            bestVia = h.via;
          }
        }
        if (best === 0) {
          missed++;
          continue;
        }
        used.add(bestPos);
        if (bestPos < lastPos) inOrder = false;
        lastPos = bestPos;
        if (i === 0 && bestPos === 0) firstHit = true;
        if (bestVia === "typo") typo = true;
        if (bestVia === "prefix") prefix = true;
        sum += best;
      }
      // glued query vs spaced key, or spaced query vs glued key ("pani puri" / "panipuri")
      if (missed && q.length === 1 && k.joined.startsWith(glued) && glued.length >= 4) {
        text = 0.86 * (glued.length / k.joined.length) + 0.1;
        via = "prefix";
      } else {
        const allowMiss = q.length >= 3 ? 1 : 0;
        if (missed > allowMiss) continue;
        const matched = q.length - missed;
        const avg = sum / q.length;
        const coverage = used.size / k.toks.length; // "dosa" fits Dosa better than Dosa batter
        text = avg * (0.62 + 0.38 * coverage) + (inOrder ? 0.03 : 0) + (firstHit ? 0.04 : 0) - (missed ? 0.12 : 0);
        if (matched === q.length && used.size === k.toks.length && !typo && !prefix) text = Math.max(text, 1.05); // same words, any order
        via = typo ? "typo" : prefix ? "prefix" : "words";
      }
    }
    if (text < 0.5) continue;
    if (k.isName) text += 0.02;
    const cur = bestByDoc.get(k.doc);
    if (!cur || text > cur.text) bestByDoc.set(k.doc, { text, via, matched: k.text });
  }

  const everyday = q.length === 1 ? EVERYDAY[q[0]] : undefined;
  const recentRank = new Map((opts.recent ?? []).map((id, i) => [id, i]));
  const slotCats = opts.slot ? SLOT_CATS[opts.slot] : undefined;
  const hits: SearchHit[] = [];
  for (const [di, m] of bestByDoc) {
    const d = docs[di];
    if (opts.combos === false && d.kind === "combo") continue;
    if (opts.veg !== undefined && d.veg !== opts.veg) continue;
    const times = opts.history?.[d.id] ?? 0;
    let boost = 0.06 * (d.pop / 3);
    boost += 0.14 * Math.min(1, Math.log2(1 + times) / 4);
    const r = recentRank.get(d.id);
    if (r !== undefined) boost += 0.05 * (1 - r / Math.max(8, recentRank.size));
    if (slotCats && d.category && slotCats.includes(d.category)) boost += 0.025;
    if (everyday === d.id) boost += 0.12;
    if (d.kind === "combo" && q.length >= 2) boost += 0.03; // "idli sambar" is the plate, not just idli
    if (d.food?.brand && !q.some((w) => d.food!.brand!.toLowerCase().includes(w))) boost -= 0.03; // generic first unless the brand was typed
    // an exact name stays above any fuzzy guess, whatever the boosts
    // raw rice, dal, flour, meat — things you cook, not eat; raw cucumber or fruit is food as it is
    const raw = !!d.food && RAW.test(d.food.name) && !["fruit", "veg", "nuts", "dairy"].includes(d.food.category) && !q.some((w) => w === "raw" || w === "uncooked" || w === "dry");
    if (raw) m.text = Math.min(m.text, 0.8) - 0.1; // ingredients sit under the cooked dish unless "raw" was typed
    const tier = m.text >= 1.05 ? 2 : m.via === "typo" ? 0 : 1;
    hits.push({ kind: d.kind, id: d.id, food: d.food, combo: d.combo, text: m.text, score: tier * 10 + m.text + boost, via: m.via, matched: m.matched });
  }
  hits.sort((a, b) => b.score - a.score || (a.food?.name.length ?? 99) - (b.food?.name.length ?? 99));
  const top = hits.slice(0, limit);

  let didYouMean: string | undefined;
  if (!top.length || top[0].text < 0.72) {
    const near = top[0] ?? null;
    if (near) didYouMean = near.food?.name ?? near.combo?.name;
  }
  return { hits: intent?.veg !== undefined ? top.filter((h) => docs.find((d) => d.id === h.id)?.veg === intent.veg) : top, qty, unit, unitWord, didYouMean };
}

/** Best single match for a phrase (sentence parser fallback). */
export function bestFuzzy(phrase: string): { kind: "food" | "combo"; id: string; score: number } | null {
  const r = searchFood(phrase + " ", { limit: 1 });
  const h = r.hits[0];
  if (!h) return null;
  // every word matched (exactly, or a sound-alike spelling) counts as a full match for the sentence reader
  const full = h.via === "exact" || h.text >= 0.95;
  return { kind: h.kind, id: h.id, score: full ? 1 : Math.min(0.97, h.text) };
}

registerFuzzy(bestFuzzy);

/** Unit words the search box understands, for the hint line. */
export const UNIT_WORDS = Object.keys(UNITS);

/** Build the index ahead of the first keystroke (Add screen calls this on open). */
export function warmFoodSearch() {
  build();
}
