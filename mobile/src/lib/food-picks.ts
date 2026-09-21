import type { Ionicons } from "@expo/vector-icons";
import { COMBO_BY_ID, FOOD_BY_ID, FOODS, macrosFor, type Combo, type Food, type FoodCategory, type MealSlot } from "@f7/content";
import type { DraftItem } from "@/state/food";

/**
 * What the Add screen shows before you type: category shelves and the
 * dishes people at the gym actually log at this hour. Everything here points
 * at ids in shared/foods.ts, so the numbers are the table's, never invented.
 */

type Icon = keyof typeof Ionicons.glyphMap;

export type Shelf = { id: string; label: string; categories: FoodCategory[]; icon: Icon };

export const SHELVES: Shelf[] = [
  { id: "tiffin", label: "Tiffin", categories: ["breakfast"], icon: "sunny-outline" },
  { id: "rice", label: "Rice & bread", categories: ["rice", "bread", "north"], icon: "restaurant-outline" },
  { id: "curry", label: "Curries & veg", categories: ["dal", "veg", "condiment"], icon: "leaf-outline" },
  { id: "nonveg", label: "Non-veg & egg", categories: ["nonveg", "egg", "protein"], icon: "flame-outline" },
  { id: "snacks", label: "Snacks & fast food", categories: ["snack", "fastfood"], icon: "fast-food-outline" },
  { id: "sweets", label: "Sweets", categories: ["sweet"], icon: "ice-cream-outline" },
  { id: "drinks", label: "Drinks & dairy", categories: ["drink", "dairy"], icon: "cafe-outline" },
  { id: "fruit", label: "Fruit & nuts", categories: ["fruit", "nuts"], icon: "nutrition-outline" },
];

export const CATEGORY_ICON: Record<FoodCategory, Icon> = {
  breakfast: "sunny-outline",
  rice: "restaurant-outline",
  bread: "layers-outline",
  dal: "water-outline",
  veg: "leaf-outline",
  nonveg: "flame-outline",
  egg: "egg-outline",
  snack: "fast-food-outline",
  sweet: "ice-cream-outline",
  drink: "cafe-outline",
  fruit: "nutrition-outline",
  dairy: "water-outline",
  protein: "barbell-outline",
  nuts: "ellipse-outline",
  fastfood: "pizza-outline",
  north: "restaurant-outline",
  condiment: "color-fill-outline",
};

/** Plates and dishes we surface first for each meal. Ids not in the table are skipped silently. */
const USUAL: Record<MealSlot, string[]> = {
  breakfast: ["idli-sambar", "dosa-sambar", "pongal-vada", "idli-vada", "poori-plate", "upma", "filter-coffee", "tea", "bread-omelette-tea", "oats-fruit", "egg", "banana"],
  lunch: ["rice-sambar-plate", "nonveg-meals", "curd-rice-pickle", "chicken-rice-plate", "rice-rasam-plate", "chapati-kurma", "chicken-biryani", "veg-biryani", "sambar-rice", "lemon-rice", "buttermilk", "salad"],
  snacks: ["tea", "filter-coffee", "sundal", "vada", "samosa", "biscuit", "banana", "apple", "peanuts", "roasted-chana", "protein-shake", "boiled-chana"],
  dinner: ["chapati-dal", "chapati-egg", "chapati-chicken", "dosa-sambar", "idli-sambar", "parotta-salna", "kothu-egg", "chicken-curry", "rice", "curd-rice", "egg-white-omelette", "vegetable-soup"],
};

export type Pick = { kind: "food"; food: Food } | { kind: "combo"; combo: Combo };

export function usualFor(slot: MealSlot): Pick[] {
  const out: Pick[] = [];
  for (const id of USUAL[slot]) {
    if (COMBO_BY_ID[id]) out.push({ kind: "combo", combo: COMBO_BY_ID[id] });
    else if (FOOD_BY_ID[id]) out.push({ kind: "food", food: FOOD_BY_ID[id] });
  }
  return out;
}

export function shelfFoods(shelf: Shelf): Food[] {
  const rank = new Map(shelf.categories.map((c, i) => [c, i]));
  return FOODS.filter((f) => rank.has(f.category)).sort((a, b) => (rank.get(a.category)! - rank.get(b.category)!) || a.name.localeCompare(b.name));
}

/** One default portion of a table food as a draft line. */
export function draftFromFood(food: Food, portions = 1): DraftItem {
  const grams = Math.round(food.portion.grams * portions);
  return {
    name: food.name,
    foodId: food.id,
    grams,
    portionLabel: portionLabel(food, grams),
    ...macrosFor(food, grams),
    confidence: 1,
    source: "table",
    needsConfirm: false,
    estimate: !!food.estimate,
  };
}

export function draftsFromCombo(combo: Combo): DraftItem[] {
  return combo.parts.flatMap((p) => {
    const f = FOOD_BY_ID[p.id];
    if (!f) return [];
    return [{ ...draftFromFood(f, 1), grams: p.grams, portionLabel: portionLabel(f, p.grams), ...macrosFor(f, p.grams) }];
  });
}

export function portionLabel(f: Food, grams: number): string {
  const n = Math.round((grams / f.portion.grams) * 10) / 10;
  if (f.unit === "piece") return `${n} × ${f.portion.label.replace(/^1 /, "")}`;
  if (n === 1) return f.portion.label;
  return `${grams} ${f.category === "drink" ? "ml" : "g"}`;
}

/** Portions of the food's own unit (idli → count; rice → cups). Used by the stepper. */
export function portionsOf(item: DraftItem): number {
  const f = item.foodId ? FOOD_BY_ID[item.foodId] : undefined;
  if (!f) return 1;
  return Math.round((item.grams / f.portion.grams) * 2) / 2;
}

/** Step size in portions: whole pieces, half of anything else. */
export function portionStep(item: DraftItem): number {
  const f = item.foodId ? FOOD_BY_ID[item.foodId] : undefined;
  return f?.unit === "piece" ? 1 : 0.5;
}

export function kcalLabel(n: number): string {
  return `${Math.round(n)} kcal`;
}

/** "2 idli, sambar" looks like a sentence; "idl" is a search. */
export function looksLikeSentence(q: string): boolean {
  const s = q.trim();
  return /[,+\n]|\band\b|\bwith\b/i.test(s) || (/^\d/.test(s) && s.split(/\s+/).length >= 2) || s.split(/\s+/).length >= 4;
}
