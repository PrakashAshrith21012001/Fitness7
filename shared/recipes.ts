/**
 * Healthy recipes for the tracker's Recipes tab.
 *
 * Nutrition per 100 g comes from the matching cooked dish in the food table
 * (`foodId`), so a recipe and the food you log from it always agree. Method
 * and ingredients are written for a home kitchen in Tamil Nadu: oil kept to
 * a teaspoon or two per serving, no ready-mix powders.
 */
import { FOOD_BY_ID, macrosFor, type Food } from "./foods";

export type RecipeCategory = "sabzi" | "roti" | "rice" | "salad" | "juice" | "breakfast" | "protein";

export const RECIPE_CATEGORIES: { id: RecipeCategory; label: string; tint: string }[] = [
  { id: "sabzi", label: "Sabzis, Dals and Curries", tint: "#c2410c" },
  { id: "roti", label: "Rotis & Parathas", tint: "#a16207" },
  { id: "rice", label: "Rice Based Dishes", tint: "#0f766e" },
  { id: "salad", label: "Salads", tint: "#4d7c0f" },
  { id: "juice", label: "Fruits and Juices", tint: "#be185d" },
  { id: "breakfast", label: "South Indian Breakfast", tint: "#7c3aed" },
  { id: "protein", label: "High Protein", tint: "#1d4ed8" },
];

export type HealthyRecipe = {
  id: string;
  name: string;
  category: RecipeCategory;
  foodId: string;
  minutes: number;
  serves: number;
  /** grams in one serving, for "Cal per serving" */
  servingG: number;
  ingredients: string[];
  steps: string[];
  tags?: string[];
};

export const RECIPES: HealthyRecipe[] = [
  // Rice
  { id: "masale-bhat", name: "Masala Bhat", category: "rice", foodId: "masale-bhat", minutes: 25, serves: 3, servingG: 200, ingredients: ["1 cup rice (washed, soaked 15 min)", "1 cup mixed vegetables — beans, carrot, peas, brinjal", "1 onion, sliced", "2 tsp goda masala", "1 tsp oil", "½ tsp mustard, ½ tsp cumin, a pinch of hing", "Curry leaves, coriander, salt", "2 cups water"], steps: ["Heat oil, add mustard and cumin. When they splutter, add hing, curry leaves and onion; cook till soft.", "Add the vegetables and goda masala; stir 2 minutes.", "Add rice, salt and water. Bring to a boil, cover and cook on low for 12 minutes (or 2 whistles).", "Rest 5 minutes, fluff, finish with coriander."] },
  { id: "matar-pulao", name: "Peas Corn Pulao", category: "rice", foodId: "matar-pulao", minutes: 30, serves: 3, servingG: 180, ingredients: ["1 cup basmati rice, soaked 20 min", "½ cup green peas", "½ cup sweet corn", "1 onion, sliced", "1 bay leaf, 2 cloves, 1 small cinnamon", "1 tsp ghee", "Salt, 1¾ cups water"], steps: ["Warm ghee, add the whole spices and onion; cook till golden.", "Add peas and corn, then the drained rice; stir gently for a minute.", "Add water and salt, cover and cook on low 12 minutes.", "Rest covered 5 minutes before serving."] },
  { id: "pudina-rice", name: "Mint Rice", category: "rice", foodId: "pudina-rice", minutes: 25, serves: 3, servingG: 180, ingredients: ["2 cups cooked rice, cooled", "1 cup mint leaves, ½ cup coriander", "2 green chillies, 1 inch ginger, 3 garlic", "1 onion, sliced", "1 tsp oil", "Lemon juice, salt"], steps: ["Grind mint, coriander, chillies, ginger and garlic to a paste with a splash of water.", "Heat oil, cook the onion till soft, add the paste and cook 3 minutes till the raw smell goes.", "Fold in rice and salt; finish with lemon juice."] },
  { id: "lemon-rice", name: "Lemon Rice", category: "rice", foodId: "lemon-rice", minutes: 15, serves: 2, servingG: 180, ingredients: ["2 cups cooked rice", "1 lemon", "1 tbsp peanuts", "½ tsp mustard, 1 tsp chana dal, 1 tsp urad dal", "2 green chillies, curry leaves", "¼ tsp turmeric", "1 tsp oil, salt"], steps: ["Heat oil; add mustard, dals and peanuts and roast till golden.", "Add chillies, curry leaves and turmeric; switch off the heat.", "Mix in rice, salt and lemon juice."] },
  { id: "curd-rice", name: "Curd Rice", category: "rice", foodId: "curd-rice", minutes: 10, serves: 2, servingG: 200, ingredients: ["1½ cups cooked rice, mashed", "1 cup curd", "¼ cup milk", "Grated carrot, cucumber", "½ tsp mustard, curry leaves, ginger", "Salt"], steps: ["Mix rice with curd, milk and salt.", "Temper mustard, curry leaves and ginger in ½ tsp oil and pour over.", "Fold in carrot and cucumber."] },
  { id: "thinai-pongal", name: "Millet Pongal", category: "breakfast", foodId: "thinai-pongal", minutes: 30, serves: 3, servingG: 200, ingredients: ["¾ cup foxtail millet (thinai)", "¼ cup moong dal", "1 tsp pepper, 1 tsp cumin", "Ginger, curry leaves, 6 cashews", "2 tsp ghee", "3½ cups water, salt"], steps: ["Dry-roast the moong dal till fragrant; wash with the millet.", "Pressure cook with water and salt for 4 whistles; mash lightly.", "Temper pepper, cumin, ginger, curry leaves and cashews in ghee; mix in."] },
  // Breakfast
  { id: "ragi-dosa", name: "Ragi Dosa", category: "breakfast", foodId: "ragi-dosa", minutes: 20, serves: 3, servingG: 160, ingredients: ["1 cup ragi flour", "¼ cup rice flour", "¼ cup curd", "1 onion, chopped; green chilli; coriander", "Salt, water to a thin batter"], steps: ["Whisk everything into a thin, pourable batter; rest 10 minutes.", "Pour from the edge of a hot tawa inwards like rava dosa.", "Drizzle a few drops of oil, cook till crisp; no need to flip."] },
  { id: "pesarattu", name: "Pesarattu", category: "breakfast", foodId: "pesarattu", minutes: 20, serves: 3, servingG: 180, ingredients: ["1 cup whole green moong, soaked 6 hours", "1 inch ginger, 2 green chillies", "¼ tsp cumin, salt", "Chopped onion to top"], steps: ["Grind the moong with ginger, chillies, cumin and salt to a smooth batter.", "Spread thin on a hot tawa, sprinkle onion, a few drops of oil.", "Cook till golden, fold and serve with ginger chutney."] },
  { id: "moong-dal-chilla", name: "Moong Dal Chilla", category: "breakfast", foodId: "moong-dal-chilla", minutes: 20, serves: 2, servingG: 160, ingredients: ["1 cup yellow moong dal, soaked 3 hours", "Ginger, green chilli", "Grated paneer or chopped vegetables (optional)", "Salt"], steps: ["Grind dal with ginger, chilli and salt to a thick batter.", "Spread on a hot pan, top with vegetables or paneer.", "Cook both sides with a few drops of oil."] },
  { id: "idli-sambar", name: "Idli with Sambar", category: "breakfast", foodId: "idli", minutes: 20, serves: 3, servingG: 120, ingredients: ["Idli batter (2:1 idli rice : urad dal, fermented)", "Sambar: ½ cup toor dal, vegetables, tamarind, sambar powder"], steps: ["Fill greased idli plates ¾ full; steam 10–12 minutes.", "Rest 2 minutes before unmoulding.", "Serve 3 idli with a katori of sambar for a ~300 Cal breakfast."] },
  // Sabzi / dal
  { id: "dal-tadka", name: "Dal Tadka", category: "sabzi", foodId: "dal-tadka", minutes: 30, serves: 4, servingG: 150, ingredients: ["1 cup toor dal", "1 tomato, 1 onion", "Ginger-garlic, green chilli", "1 tsp cumin, ½ tsp turmeric, red chilli", "2 tsp ghee", "Coriander, salt"], steps: ["Pressure cook dal with turmeric for 3 whistles; whisk.", "Cook onion, ginger-garlic and tomato till soft; add the dal and simmer.", "Temper cumin and red chilli in ghee; pour over, garnish with coriander."] },
  { id: "palak-paneer", name: "Palak Paneer", category: "sabzi", foodId: "palak-paneer", minutes: 30, serves: 3, servingG: 150, ingredients: ["2 bunches spinach, blanched", "150 g paneer, cubed", "1 onion, 1 tomato", "Ginger, garlic, green chilli", "½ tsp garam masala", "1 tsp oil, salt"], steps: ["Blanch spinach 2 minutes, cool in cold water, purée.", "Cook onion, ginger, garlic and tomato; add purée and garam masala.", "Simmer 5 minutes, add paneer and warm through."] },
  { id: "chole", name: "Chana Masala", category: "sabzi", foodId: "chole", minutes: 40, serves: 4, servingG: 150, ingredients: ["1 cup kabuli chana, soaked overnight", "2 onions, 2 tomatoes, puréed", "Ginger-garlic paste", "2 tsp chana masala", "1 tsp oil, salt"], steps: ["Pressure cook chana for 5 whistles.", "Cook onion, ginger-garlic and tomato purée till oil separates.", "Add masala and chana with some cooking water; simmer 10 minutes."] },
  { id: "avial", name: "Avial", category: "sabzi", foodId: "avial", minutes: 30, serves: 4, servingG: 150, ingredients: ["3 cups mixed vegetables — drumstick, carrot, beans, raw banana, ash gourd", "½ cup grated coconut, 2 green chillies, ½ tsp cumin", "½ cup curd", "Curry leaves, 1 tsp coconut oil"], steps: ["Cook vegetables with turmeric and salt till just tender.", "Add the coarse coconut-chilli-cumin paste; cook 3 minutes.", "Switch off, stir in curd, finish with coconut oil and curry leaves."] },
  { id: "keerai", name: "Keerai Poriyal", category: "sabzi", foodId: "keerai", minutes: 15, serves: 3, servingG: 100, ingredients: ["1 bunch keerai (arai / siru keerai), chopped", "1 onion, 1 dry red chilli", "½ tsp mustard, 1 tsp urad dal", "2 tbsp grated coconut", "1 tsp oil, salt"], steps: ["Temper mustard, urad dal and red chilli; add onion.", "Add keerai and salt; cook uncovered 5 minutes.", "Finish with coconut."] },
  // Roti
  { id: "chapati", name: "Phulka", category: "roti", foodId: "chapati", minutes: 25, serves: 4, servingG: 80, ingredients: ["2 cups whole wheat atta", "Water, a pinch of salt"], steps: ["Knead a soft dough; rest 20 minutes.", "Roll thin, cook on a tawa till spots appear on both sides.", "Puff directly on the flame; skip the ghee to keep it ~100 Cal a phulka."] },
  { id: "methi-thepla", name: "Methi Thepla", category: "roti", foodId: "methi-thepla", minutes: 30, serves: 4, servingG: 80, ingredients: ["1½ cups atta, ¼ cup besan", "1 cup methi leaves, chopped", "2 tbsp curd, ½ tsp turmeric, chilli, ajwain", "1 tsp oil, salt"], steps: ["Knead everything into a firm dough with a little water.", "Roll thin and cook on a tawa with a few drops of oil each side."] },
  { id: "aloo-paratha", name: "Aloo Paratha", category: "roti", foodId: "aloo-paratha", minutes: 35, serves: 4, servingG: 120, ingredients: ["2 cups atta", "2 potatoes, boiled and mashed", "Green chilli, coriander, ajwain, amchur, salt", "1 tsp ghee per paratha"], steps: ["Knead a soft dough; rest 20 minutes.", "Season the potato; stuff a ball of dough, seal and roll out gently.", "Cook on a tawa with a little ghee till golden on both sides. Pair with curd for protein."] },
  // Salads
  { id: "sprouts-chaat", name: "Sprouts Cucumber Tomato Salad", category: "salad", foodId: "sprouts-chaat", minutes: 10, serves: 2, servingG: 150, ingredients: ["1 cup moong sprouts, steamed 3 minutes", "1 cucumber, 1 tomato, ½ onion, chopped", "Lemon, chaat masala, coriander, salt"], steps: ["Toss everything together just before eating."] },
  { id: "hesarubele-kosambari", name: "Kosambari", category: "salad", foodId: "hesarubele-kosambari", minutes: 10, serves: 3, servingG: 100, ingredients: ["½ cup moong dal, soaked 2 hours", "1 cucumber, 1 carrot, grated", "2 tbsp grated coconut, green chilli", "Lemon, mustard tempering, salt"], steps: ["Drain the dal; mix with cucumber, carrot, coconut and chilli.", "Add salt and lemon; pour over a mustard tempering."] },
  { id: "grilled-chicken-salad", name: "Grilled Chicken Salad", category: "salad", foodId: "grilled-chicken-salad", minutes: 20, serves: 1, servingG: 300, ingredients: ["150 g chicken breast", "Lettuce, cucumber, tomato, onion", "Lemon, pepper, 1 tsp olive oil, salt"], steps: ["Season chicken with salt, pepper and lemon; grill 6 minutes a side.", "Slice and toss with the vegetables, lemon and olive oil."] },
  { id: "quinoa-salad", name: "Quinoa Salad", category: "salad", foodId: "quinoa-salad", minutes: 20, serves: 2, servingG: 200, ingredients: ["½ cup quinoa, rinsed", "Cucumber, tomato, capsicum, onion", "Lemon, mint, 1 tsp olive oil, salt"], steps: ["Cook quinoa in 1 cup water for 12 minutes; cool.", "Toss with the vegetables, lemon, mint and oil."] },
  // Juice / fruit
  { id: "juice-watermelon", name: "Watermelon Juice", category: "juice", foodId: "juice-watermelon", minutes: 5, serves: 2, servingG: 300, ingredients: ["3 cups watermelon, seeded", "Mint, a squeeze of lemon"], steps: ["Blend and serve over ice — no sugar needed."] },
  { id: "buttermilk", name: "Spiced Buttermilk", category: "juice", foodId: "buttermilk", minutes: 5, serves: 2, servingG: 250, ingredients: ["½ cup curd, 1½ cups water", "Ginger, green chilli, curry leaves, coriander", "Salt, a pinch of hing"], steps: ["Blend curd with water, ginger, chilli and salt.", "Add chopped curry leaves and coriander."] },
  { id: "ragi-kanji", name: "Ragi Malt", category: "juice", foodId: "ragi-kanji", minutes: 10, serves: 1, servingG: 250, ingredients: ["2 tbsp ragi flour", "1 cup water", "½ cup milk or buttermilk", "Salt or a little jaggery"], steps: ["Whisk ragi into cold water, cook 5 minutes stirring till glossy.", "Add milk (sweet) or buttermilk and salt (savoury)."] },
  // Protein
  { id: "egg-bhurji", name: "Egg Podimas", category: "protein", foodId: "egg-bhurji", minutes: 10, serves: 1, servingG: 120, ingredients: ["3 eggs", "1 onion, green chilli, curry leaves", "Pepper, turmeric, salt, 1 tsp oil"], steps: ["Cook onion and chilli in oil; add beaten eggs.", "Scramble on low; finish with pepper and coriander."] },
  { id: "paneer-bhurji", name: "Paneer Bhurji", category: "protein", foodId: "paneer-bhurji", minutes: 15, serves: 2, servingG: 100, ingredients: ["200 g paneer, crumbled", "1 onion, 1 tomato, capsicum", "Turmeric, chilli, garam masala, salt, 1 tsp oil"], steps: ["Cook onion, tomato and capsicum with the spices.", "Add paneer and toss 2 minutes; don't overcook."] },
  { id: "sundal", name: "Chickpea Sundal", category: "protein", foodId: "sundal", minutes: 15, serves: 3, servingG: 100, ingredients: ["1 cup chickpeas, soaked and boiled", "Mustard, urad dal, red chilli, curry leaves, hing", "2 tbsp grated coconut, salt"], steps: ["Temper mustard, dal, chilli, curry leaves and hing in 1 tsp oil.", "Add chickpeas and salt; toss with coconut."] },
  { id: "chicken-breast", name: "Pepper Grilled Chicken", category: "protein", foodId: "chicken-breast", minutes: 25, serves: 2, servingG: 150, ingredients: ["2 chicken breasts", "1 tsp crushed pepper, ginger-garlic paste, lemon, salt", "1 tsp oil"], steps: ["Marinate 15 minutes.", "Grill or pan-sear 6–7 minutes a side till cooked through; rest 3 minutes."] },
];

export const RECIPE_BY_ID: Record<string, HealthyRecipe> = Object.fromEntries(RECIPES.map((r) => [r.id, r]));

export type RecipeNutrition = { per100: { kcal: number; protein: number; fats: number; carbs: number; fibre: number }; perServing: { kcal: number; grams: number } };

export function recipeFood(r: HealthyRecipe): Food | undefined {
  return FOOD_BY_ID[r.foodId];
}

/** Per 100 g from the dish in the food table, and one serving. */
export function recipeNutrition(r: HealthyRecipe, fibrePer100: (f: Food) => number): RecipeNutrition | null {
  const f = recipeFood(r);
  if (!f) return null;
  const s = macrosFor(f, r.servingG);
  return {
    per100: { kcal: f.per100.kcal, protein: f.per100.protein, fats: f.per100.fat, carbs: f.per100.carbs, fibre: fibrePer100(f) },
    perServing: { kcal: s.kcal, grams: r.servingG },
  };
}

export function recipesIn(cat: RecipeCategory): HealthyRecipe[] {
  return RECIPES.filter((r) => r.category === cat);
}

export function searchRecipes(q: string): HealthyRecipe[] {
  const k = q.trim().toLowerCase();
  if (!k) return RECIPES;
  return RECIPES.filter((r) => r.name.toLowerCase().includes(k) || r.ingredients.some((i) => i.toLowerCase().includes(k)));
}

/** Same category first, then anything else with similar calories. */
export function similarRecipes(r: HealthyRecipe, n = 6): HealthyRecipe[] {
  const kcal = FOOD_BY_ID[r.foodId]?.per100.kcal ?? 0;
  return RECIPES.filter((x) => x.id !== r.id)
    .sort((a, b) => Number(b.category === r.category) - Number(a.category === r.category) || Math.abs((FOOD_BY_ID[a.foodId]?.per100.kcal ?? 0) - kcal) - Math.abs((FOOD_BY_ID[b.foodId]?.per100.kcal ?? 0) - kcal))
    .slice(0, n);
}
