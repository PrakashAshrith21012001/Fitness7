import type { Row } from "../foods";

/**
 * Dishes the regional lists each left to the other — added once, here.
 */
export const rows: Row[] = [
  /* ---------------- shawarma & grill shop ---------------- */
  ["al-faham", "Al faham chicken (quarter)", "nonveg", 190, 22.0, 3.0, 10.0, "1 quarter", 200, ["al faham", "alfaham", "al faham quarter", "al faham chicken", "alfaham chicken", "arabian grill chicken", "al faham half"], true, "plate", { pop: 2, servings: [["½ chicken", 400], ["full chicken", 800], ["100 g", 100]], src: "recipe" }],
  ["shawarma-plate", "Chicken shawarma plate", "fastfood", 210, 11.0, 18.0, 10.5, "1 plate", 400, ["shawarma plate", "chicken shawarma plate", "plate shawarma", "shawarma platter", "open shawarma", "shawarma with fries"], true, "plate", { pop: 2, servings: [["½ plate", 200], ["100 g", 100]], src: "recipe" }],
  ["tandoori-chicken", "Tandoori chicken", "nonveg", 150, 25.0, 3.0, 4.5, "1 quarter", 180, ["tandoori chicken", "tandoori chicken quarter", "tandoori quarter", "tandoori leg", "tandoori chicken half", "tandoori murgh", "chicken tandoori full"], true, "plate", { pop: 3, servings: [["1 leg piece", 120], ["½ chicken", 360], ["full chicken", 720], ["100 g", 100]], src: "recipe" }],
  ["chicken-65", "Chicken 65", "nonveg", 245, 18.0, 10.0, 15.0, "1 plate", 150, ["chicken 65", "chicken sixty five", "chiken 65", "chicken 65 dry", "chicken 65 boneless", "c65"], true, "plate", { pop: 3, servings: [["½ plate", 75], ["6 pieces", 120], ["100 g", 100]], src: "recipe" }],
  ["garlic-mayo", "Garlic mayonnaise (shawarma shop)", "condiment", 500, 1.0, 4.0, 53.0, "1 tbsp", 15, ["garlic mayo", "garlic mayonnaise", "toum", "shawarma mayo", "garlic sauce"], true, "serving", { pop: 2, servings: [["1 small cup (30 g)", 30], ["1 tsp", 5]], src: "recipe" }],
  ["kuboos", "Kuboos / Arabic bread", "bread", 275, 9.0, 55.0, 1.5, "1 kuboos", 60, ["kuboos", "khubz", "kubus", "arabic bread", "pita bread", "pita", "pitta"], true, "piece", { pop: 2, src: "recipe" }],

  /* ---------------- chillas ---------------- */
  ["besan-chilla", "Besan chilla", "breakfast", 200, 9.0, 20.0, 9.0, "1 chilla", 80, ["besan chilla", "besan cheela", "besan ka chilla", "gram flour pancake", "besan pancake", "pudla", "chilla"], true, "piece", { pop: 2, src: "recipe" }],
  ["moong-dal-chilla", "Moong dal chilla", "breakfast", 165, 9.0, 19.0, 6.0, "1 chilla", 80, ["moong dal chilla", "moong chilla", "moong dal cheela", "green moong chilla", "moong pancake"], true, "piece", { pop: 2, src: "recipe" }],

  /* ---------------- juice shop & bakery ---------------- */
  ["strawberry-milkshake", "Strawberry milkshake", "drink", 105, 3.0, 15.0, 3.6, "1 glass", 300, ["strawberry milkshake", "strawberry shake", "strawberry milk shake"], true, "glass", { pop: 2, src: "recipe" }],
  ["abc-juice", "ABC juice (apple, beetroot, carrot)", "drink", 45, 0.8, 10.0, 0.2, "1 glass", 300, ["abc juice", "abc drink", "apple beetroot carrot juice"], true, "glass", { pop: 2, src: "recipe" }],
  ["fruit-salad-ice-cream", "Fruit salad with ice cream", "sweet", 130, 2.0, 22.0, 4.0, "1 cup", 250, ["fruit salad with ice cream", "fruit salad ice cream", "fruit salad", "fruit cocktail with ice cream"], true, "cup", { pop: 2, src: "recipe" }],
  ["falooda", "Falooda", "sweet", 150, 3.5, 22.0, 5.2, "1 glass", 350, ["falooda", "faluda", "royal falooda", "rose falooda", "kesar falooda"], true, "glass", { pop: 2, src: "recipe" }],
  ["honey-cake", "Honey cake (bakery)", "sweet", 360, 4.0, 52.0, 15.0, "1 piece", 70, ["honey cake", "bakery honey cake", "iyengar honey cake"], true, "piece", { pop: 2, src: "recipe" }],
  ["black-forest-pastry", "Black forest pastry", "sweet", 330, 4.5, 40.0, 17.0, "1 pastry", 100, ["black forest pastry", "black forest", "black forest cake", "black forest cake slice"], true, "piece", { pop: 2, servings: [["½ kg cake", 500], ["1 kg cake", 1000]], src: "recipe" }],
  ["pineapple-pastry", "Pineapple pastry", "sweet", 320, 4.0, 42.0, 15.0, "1 pastry", 90, ["pineapple pastry", "pineapple cake", "pineapple cake slice"], true, "piece", { pop: 2, src: "recipe" }],

  /* ---------------- pantry ---------------- */
  ["prunes", "Prunes (dried plums)", "fruit", 240, 2.2, 64.0, 0.4, "5 prunes", 40, ["prunes", "dried plums", "prune"], false, "serving", { pop: 1, src: "usda" }],
  ["dried-apricot", "Dried apricots", "fruit", 241, 3.4, 63.0, 0.5, "5 apricots", 35, ["dried apricot", "dried apricots", "khubani", "khumani", "apricot dry"], false, "serving", { pop: 1, src: "usda" }],
  ["dried-cranberries", "Dried cranberries (sweetened)", "fruit", 308, 0.1, 82.0, 1.4, "1 tbsp", 15, ["dried cranberries", "cranberries", "craisins", "cranberry dried"], false, "serving", { pop: 1, src: "usda" }],
  ["oats-water", "Oats porridge (cooked in water)", "breakfast", 71, 2.5, 12.0, 1.5, "1 bowl", 250, ["oats in water", "oats with water", "oats porridge water", "plain oats water", "water oats", "porridge"], false, "bowl", { pop: 2, src: "usda" }],
  ["edamame", "Edamame (boiled)", "protein", 121, 12.0, 9.0, 5.0, "1 cup", 155, ["edamame", "green soybeans", "edamame beans"], false, "cup", { pop: 1, src: "usda" }],
];
