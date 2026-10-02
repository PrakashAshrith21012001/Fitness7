/**
 * Extended food lists, merged into the table by ../foods.ts.
 *
 *   south.ts        Tamil Nadu, Chettinad, Kongu, Kerala, Karnataka, Andhra & Telangana
 *   north.ts        Punjabi, Mughlai, Rajasthani, Gujarati, Maharashtrian, Bengali & east, Hyderabadi, Goan, street food, Indo-Chinese
 *   ingredients.ts  raw vegetables, fruit, grains, flours, millets, pulses, meat & seafood cuts, dairy, oils, seeds
 *   packaged.ts     Indian packaged brands and supplements (label values)
 *   restaurants.ts  restaurant chains in India (published nutrition, else estimates)
 *   global.ts       continental, Asian, Mexican, Middle-Eastern, bakery, desserts, gym / meal-prep food
 *   fill.ts         a few dishes the lists above each left to the other
 *   combos.ts       plates and thalis that expand into their parts
 */
import type { Combo, Row } from "../foods";
import { rows as south } from "./south";
import { rows as north } from "./north";
import { rows as ingredients } from "./ingredients";
import { rows as packaged } from "./packaged";
import { rows as restaurants } from "./restaurants";
import { rows as global } from "./global";
import { rows as fill } from "./fill";
import { combos } from "./combos";

export const EXTRA_ROWS: Row[] = [...south, ...north, ...ingredients, ...packaged, ...restaurants, ...global, ...fill];
export const EXTRA_COMBOS: Combo[] = combos;
