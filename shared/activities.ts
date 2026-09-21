/**
 * Activities and the energy they use.
 *
 * kcal burned = MET × body weight (kg) × hours. MET values follow the
 * Compendium of Physical Activities (Ainsworth et al., 2011 update) — the same
 * table every fitness app uses. They are population averages: a 60 kg member
 * and a 90 kg member get different numbers for the same hour, but pace,
 * fitness and rest between sets still vary, so the UI calls these estimates.
 *
 * Water: 33 ml per kg of body weight a day is the common baseline; each
 * 30 minutes of training adds about 250 ml. Rounded to the nearest glass.
 */

export type ActivityCategory = "gym" | "cardio" | "sport" | "outdoor" | "mind" | "daily";

export type ActivityItem = {
  id: string;
  name: string;
  category: ActivityCategory;
  met: number;
  /** Ionicons name for the picker */
  icon: string;
  /** typical session in minutes — preselected in the picker */
  defaultMin: number;
  aliases?: string[];
};

export const ACTIVITIES: ActivityItem[] = [
  // gym — what most members do at Fitness 7
  { id: "strength", name: "Strength training", category: "gym", met: 5.0, icon: "barbell-outline", defaultMin: 60, aliases: ["weights", "lifting", "gym"] },
  { id: "strength-heavy", name: "Heavy lifting (powerlifting)", category: "gym", met: 6.0, icon: "barbell", defaultMin: 60, aliases: ["powerlifting", "deadlift day"] },
  { id: "hiit", name: "HIIT / circuit", category: "gym", met: 8.0, icon: "flame-outline", defaultMin: 40, aliases: ["hiit burn", "circuit", "tabata"] },
  { id: "functional", name: "Functional training", category: "gym", met: 7.0, icon: "flash-outline", defaultMin: 60, aliases: ["crossfit", "wod"] },
  { id: "boxing", name: "Boxing / combat fit", category: "gym", met: 7.8, icon: "hand-left-outline", defaultMin: 45, aliases: ["bag work", "pad work", "combat"] },
  { id: "pt", name: "Personal training session", category: "gym", met: 5.5, icon: "person-outline", defaultMin: 60 },
  { id: "stretch", name: "Stretching / mobility", category: "mind", met: 2.3, icon: "body-outline", defaultMin: 20, aliases: ["mobility", "warm up", "cool down"] },
  { id: "yoga", name: "Yoga", category: "mind", met: 3.0, icon: "leaf-outline", defaultMin: 50, aliases: ["hatha", "asana"] },
  { id: "power-yoga", name: "Power yoga", category: "mind", met: 4.0, icon: "leaf", defaultMin: 50 },

  // cardio
  { id: "treadmill-walk", name: "Treadmill walk", category: "cardio", met: 3.8, icon: "walk-outline", defaultMin: 30 },
  { id: "treadmill-run", name: "Treadmill run", category: "cardio", met: 8.8, icon: "fitness-outline", defaultMin: 30 },
  { id: "cycle-machine", name: "Stationary cycle", category: "cardio", met: 6.8, icon: "bicycle-outline", defaultMin: 30, aliases: ["spin", "exercise bike"] },
  { id: "cross-trainer", name: "Cross-trainer / elliptical", category: "cardio", met: 5.0, icon: "swap-horizontal-outline", defaultMin: 30, aliases: ["elliptical"] },
  { id: "rowing", name: "Rowing machine", category: "cardio", met: 7.0, icon: "boat-outline", defaultMin: 20, aliases: ["rower"] },
  { id: "stairs", name: "Stair climber", category: "cardio", met: 9.0, icon: "trending-up-outline", defaultMin: 15, aliases: ["stairmaster", "steps"] },
  { id: "skipping", name: "Skipping rope", category: "cardio", met: 11.0, icon: "sync-outline", defaultMin: 15, aliases: ["jump rope", "rope"] },

  // outdoor
  { id: "walk", name: "Walking (brisk)", category: "outdoor", met: 4.3, icon: "walk-outline", defaultMin: 30, aliases: ["walking", "morning walk", "evening walk"] },
  { id: "walk-easy", name: "Walking (easy)", category: "outdoor", met: 3.0, icon: "walk-outline", defaultMin: 30, aliases: ["stroll"] },
  { id: "jog", name: "Jogging", category: "outdoor", met: 7.0, icon: "fitness-outline", defaultMin: 30, aliases: ["slow run"] },
  { id: "run", name: "Running", category: "outdoor", met: 9.8, icon: "fitness-outline", defaultMin: 30, aliases: ["5k", "10k"] },
  { id: "cycling", name: "Cycling", category: "outdoor", met: 6.8, icon: "bicycle-outline", defaultMin: 45, aliases: ["bike ride", "cycle"] },
  { id: "trek", name: "Trekking / hill walk", category: "outdoor", met: 6.0, icon: "trail-sign-outline", defaultMin: 180, aliases: ["hike", "hiking", "trekking", "hill"] },
  { id: "swim", name: "Swimming", category: "outdoor", met: 6.0, icon: "water-outline", defaultMin: 30, aliases: ["swimming", "laps"] },

  // sport — Dharmapuri evenings
  { id: "cricket", name: "Cricket", category: "sport", met: 4.8, icon: "baseball-outline", defaultMin: 90, aliases: ["gully cricket", "match", "nets", "tennis ball cricket"] },
  { id: "football", name: "Football", category: "sport", met: 7.0, icon: "football-outline", defaultMin: 60, aliases: ["soccer"] },
  { id: "badminton", name: "Badminton", category: "sport", met: 5.5, icon: "tennisball-outline", defaultMin: 45, aliases: ["shuttle"] },
  { id: "kabaddi", name: "Kabaddi", category: "sport", met: 8.0, icon: "people-outline", defaultMin: 40 },
  { id: "volleyball", name: "Volleyball", category: "sport", met: 4.0, icon: "basketball-outline", defaultMin: 45 },
  { id: "basketball", name: "Basketball", category: "sport", met: 6.5, icon: "basketball-outline", defaultMin: 45 },
  { id: "kho-kho", name: "Kho-kho / running games", category: "sport", met: 7.0, icon: "people-outline", defaultMin: 30 },
  { id: "table-tennis", name: "Table tennis", category: "sport", met: 4.0, icon: "tennisball-outline", defaultMin: 30, aliases: ["tt", "ping pong"] },
  { id: "tennis", name: "Tennis", category: "sport", met: 7.3, icon: "tennisball-outline", defaultMin: 60 },
  { id: "silambam", name: "Silambam / martial arts", category: "sport", met: 10.3, icon: "flash-outline", defaultMin: 45, aliases: ["karate", "martial arts", "kalari"] },
  { id: "dance", name: "Dance / Zumba", category: "sport", met: 5.5, icon: "musical-notes-outline", defaultMin: 45, aliases: ["zumba", "dancing"] },

  // daily life — for the honest days
  { id: "housework", name: "Housework", category: "daily", met: 3.3, icon: "home-outline", defaultMin: 30, aliases: ["cleaning", "sweeping", "mopping"] },
  { id: "farm-work", name: "Farm / field work", category: "daily", met: 4.5, icon: "leaf-outline", defaultMin: 60, aliases: ["field", "farming"] },
  { id: "standing-work", name: "Standing work / shop", category: "daily", met: 2.3, icon: "storefront-outline", defaultMin: 120 },
  { id: "carrying", name: "Carrying loads", category: "daily", met: 5.0, icon: "cube-outline", defaultMin: 30 },
  { id: "playing-kids", name: "Playing with kids", category: "daily", met: 3.5, icon: "happy-outline", defaultMin: 30 },
];

export const ACTIVITY_BY_ID: Record<string, ActivityItem> = Object.fromEntries(ACTIVITIES.map((a) => [a.id, a]));

export const ACTIVITY_CATEGORIES: { id: ActivityCategory; label: string }[] = [
  { id: "gym", label: "At the gym" },
  { id: "cardio", label: "Cardio floor" },
  { id: "sport", label: "Sports" },
  { id: "outdoor", label: "Outdoors" },
  { id: "mind", label: "Yoga & mobility" },
  { id: "daily", label: "Daily life" },
];

/** Energy used, kcal. Rounded to 5. `kg` defaults to 65 when the member hasn't logged a weight. */
export function burnKcal(met: number, minutes: number, kg = 65): number {
  return Math.round((met * kg * (minutes / 60)) / 5) * 5;
}

/** Daily water target in ml — 33 ml/kg plus ~250 ml per 30 min of activity, rounded to the glass. */
export function waterTargetMl(kg = 65, activeMinutes = 0, glassMl = 250): number {
  const base = 33 * kg + Math.round(activeMinutes / 30) * 250;
  const clamped = Math.min(5000, Math.max(1500, base));
  return Math.round(clamped / glassMl) * glassMl;
}

export const GLASS_SIZES = [200, 250, 300, 500] as const;
