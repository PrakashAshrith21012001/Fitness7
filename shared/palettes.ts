/**
 * Fitness 7 — colour, taken from FirstGrade's live token system so the two
 * products share one visual language, in both light and dark.
 *
 * The page is still one climb through three altitude bands; each band now has
 * a light and a dark reading. The summit is the same in both themes — you
 * arrive in the green either way.
 *
 * FirstGrade reference (firstgrade.in, read from its stylesheet):
 *   dark  (ours) bg #111412 · card #181c19 · border #2a302c · text #eef2ef · muted #98a39b
 *   light bg #faf9f6 · card #fffefc · border #e9e6df · ink #0a0f0d · text-2 #4b5563
 *   green #2ecc71 · green-dark #27ae60 · green-text (light) #1a6b3c / #15803d
 */

export type ThemeId = "dark" | "light";
export type BandId = "valley" | "mist" | "summit";

export type Band = {
  bg: string;
  surface: string;
  surface2: string;
  line: string;
  fg: string;
  muted: string;
  /** Accent as TEXT — dark enough to read on this band's canvas */
  accent: string;
  /** Accent as FILL — the vivid brand green for buttons and glows */
  green: string;
  accentDeep: string;
  onAccent: string;
  ridgeNear: string;
  ridgeFar: string;
};

const summit: Band = {
  bg: "#2ecc71",
  surface: "#3bd47d",
  surface2: "#4fda8c",
  line: "#1f9e57",
  fg: "#0a0f0d",
  muted: "#0f4c3a",
  accent: "#0a0f0d",
  green: "#0a0f0d",
  accentDeep: "#000000",
  onAccent: "#fafaf7",
  ridgeNear: "#0f4c3a",
  ridgeFar: "#1f9e57",
};

export const themes: Record<ThemeId, Record<BandId, Band>> = {
  dark: {
    // Green-black charcoal — the gym's own black-and-lime creative, not
    // FirstGrade's navy. A hair of green in the greys so the accent sits in.
    valley: {
      bg: "#111412", surface: "#181c19", surface2: "#1f2420", line: "#2a302c",
      fg: "#eef2ef", muted: "#98a39b",
      accent: "#2ecc71", green: "#2ecc71", accentDeep: "#27ae60", onAccent: "#0a0f0d",
      ridgeNear: "#0b0e0c", ridgeFar: "#2a302c",
    },
    mist: {
      bg: "#1c211d", surface: "#242a25", surface2: "#2c332e", line: "#3a423c",
      fg: "#eef2ef", muted: "#a6b0a8",
      accent: "#4ade80", green: "#2ecc71", accentDeep: "#27ae60", onAccent: "#0a0f0d",
      ridgeNear: "#141816", ridgeFar: "#3a423c",
    },
    summit,
  },
  light: {
    valley: {
      bg: "#faf9f6", surface: "#fffefc", surface2: "#f3f1ec", line: "#e9e6df",
      fg: "#0a0f0d", muted: "#4b5563",
      accent: "#15803d", green: "#2ecc71", accentDeep: "#27ae60", onAccent: "#0a0f0d",
      ridgeNear: "#cfcbc0", ridgeFar: "#e6e3da",
    },
    mist: {
      bg: "#eae7e0", surface: "#f3f1ec", surface2: "#fffefc", line: "#d6d2c8",
      fg: "#0a0f0d", muted: "#4b5563",
      accent: "#15803d", green: "#2ecc71", accentDeep: "#27ae60", onAccent: "#0a0f0d",
      ridgeNear: "#bdb8ac", ridgeFar: "#d9d5cb",
    },
    summit,
  },
};

export const bands: { id: BandId; name: string; altitude: number }[] = [
  { id: "valley", name: "Valley floor", altitude: 380 },
  { id: "mist", name: "Mist band", altitude: 1100 },
  { id: "summit", name: "Above the cloud", altitude: 1980 },
];

export const baseAltitude = bands[0].altitude;
export const peakAltitude = bands[bands.length - 1].altitude;

export function altitudeAt(progress: number): number {
  const p = Math.min(1, Math.max(0, progress));
  return Math.round(baseAltitude + (peakAltitude - baseAltitude) * p);
}

/** FirstGrade's hero wash, per theme */
export const washHero: Record<ThemeId, string> = {
  dark: "linear-gradient(160deg, #15201a 0%, #111412 60%)",
  light: "linear-gradient(160deg, #f0fdf4 0%, #fffefc 60%)",
};

export const greenGlow = "0 4px 14px rgba(46, 204, 113, 0.4)";
