/**
 * Fitness 7 Gym Unisex — brand tokens.
 * Colour is FirstGrade's token system (see ./palettes) so the two products
 * share one visual language. The app runs the dark set — green-black charcoal,
 * from the gym's own black-and-lime creative.
 */

export const brand = {
  name: "Fitness 7",
  fullName: "Fitness 7 Gym Unisex",
  /** Their own line, from the gym's Google listing creative */
  tagline: "Power · Perseverance · Discipline",
  /** Campaign line for the site hero */
  heroLine: "The floor is just base camp.",
  /** The listing bills it as "UNISEX PREMIUM (A/C)" */
  airConditioned: true,
  city: "Dharmapuri",
  instagram: "f7gym_dpi",
} as const;

/**
 * The valley band — pre-dawn on the floor at 5 AM. The app opens at the
 * bottom of the climb, so it uses the same tokens the website's first screen
 * does. The full three-band set lives in ./palettes.
 */
export const colors = {
  /** Page canvas */
  black: "#111412",
  /** Raised surfaces: cards, sheets, nav */
  surface: "#181c19",
  /** Hairlines and dividers */
  line: "#2a302c",
  /** Primary text */
  white: "#eef2ef",
  /** Secondary text */
  muted: "#98a39b",
  /** Brand accent — FirstGrade green */
  lime: "#2ecc71",
  /** Accent, pressed / deep state */
  limeDeep: "#27ae60",
  /** Accent, soft wash for glows */
  limeSoft: "rgba(46, 204, 113, 0.14)",
  /** Destructive / sold-out */
  danger: "#ef4444",
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 22,
  xl: 32,
  pill: 999,
} as const;

export const spacing = {
  xs: 6,
  sm: 12,
  md: 20,
  lg: 32,
  xl: 56,
  xxl: 96,
} as const;

export type Brand = typeof brand;
export type Colors = typeof colors;
