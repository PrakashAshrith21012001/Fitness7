import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ThemeId } from "@f7/content";

/**
 * Design v4 — the cult.fit look. The whole app sits on a deep navy, every
 * card is a translucent white pane on that navy, type is white, and two
 * accents do all the talking: a hot pink for the one action on a screen
 * and a bright green for anything that is done / confirmed / a saving.
 * The Store is the one exception: it is a white web-shop (see store tokens).
 *
 * Light is kept for the OS toggle but is the same idea lifted: a pale
 * blue-grey canvas with navy ink.
 */

export type AppColors = {
  /** page canvas */
  black: string;
  /** deeper band the canvas fades into (hero tops, tab bar) */
  navyDeep: string;
  /** raised card — translucent white on navy */
  surface: string;
  /** second-level surface: chips, inputs, inactive controls */
  surface2: string;
  line: string;
  /** primary text */
  white: string;
  muted: string;
  /** accent text/icons — cult green */
  lime: string;
  /** primary filled button (white pill with pink text in cult; kept as "green" token name for old screens) */
  green: string;
  limeDeep: string;
  limeSoft: string;
  accentBorder: string;
  danger: string;
  onAccent: string;
  /** cult pink — the one loud action, prices on sale, EXPLORE PLANS */
  pink: string;
  pinkSoft: string;
  /** cult green — completed, confirmed, savings, muscle map */
  success: string;
  successSoft: string;
  /** streak / deal gold */
  gold: string;
  goldSoft: string;
};

const PALETTE: Record<ThemeId, AppColors> = {
  dark: {
    black: "#0f1428",
    navyDeep: "#090c1c",
    surface: "rgba(255,255,255,0.07)",
    surface2: "rgba(255,255,255,0.12)",
    line: "rgba(255,255,255,0.12)",
    white: "#ffffff",
    muted: "#9aa1b8",
    lime: "#3ddc84",
    green: "#ffffff",
    limeDeep: "#2bbf6d",
    limeSoft: "rgba(61,220,132,0.14)",
    accentBorder: "rgba(61,220,132,0.35)",
    danger: "#ff5a5f",
    onAccent: "#ff3e6c",
    pink: "#ff3e6c",
    pinkSoft: "rgba(255,62,108,0.16)",
    success: "#3ddc84",
    successSoft: "rgba(61,220,132,0.16)",
    gold: "#ffc857",
    goldSoft: "rgba(255,200,87,0.18)",
  },
  light: {
    black: "#f3f5fb",
    navyDeep: "#e6e9f4",
    surface: "#ffffff",
    surface2: "#e9ecf5",
    line: "#dfe3ee",
    white: "#0f1428",
    muted: "#5f667f",
    lime: "#149a52",
    green: "#0f1428",
    limeDeep: "#0f7d42",
    limeSoft: "rgba(20,154,82,0.12)",
    accentBorder: "rgba(20,154,82,0.35)",
    danger: "#d63a45",
    onAccent: "#ffffff",
    pink: "#f0295b",
    pinkSoft: "rgba(240,41,91,0.12)",
    success: "#149a52",
    successSoft: "rgba(20,154,82,0.12)",
    gold: "#c98a00",
    goldSoft: "rgba(201,138,0,0.14)",
  },
};

/** The Store's own palette — a white web-shop with cult pink, in both themes. */
export const store = {
  bg: "#ffffff",
  bg2: "#f6f6f8",
  ink: "#111111",
  muted: "#6b6f7b",
  line: "#e6e7ec",
  pink: "#e6215f",
  pinkSoft: "#fdeaf0",
  green: "#1f9d55",
  greenSoft: "#e8f7ee",
  gold: "#f6b80b",
  goldSoft: "#fff6d6",
  whatsapp: "#25d366",
} as const;

function fromBand(t: ThemeId): AppColors {
  return PALETTE[t];
}

type Ctx = { theme: ThemeId; colors: AppColors; setTheme: (t: ThemeId | "system") => void; pref: ThemeId | "system" };
const ThemeCtx = createContext<Ctx | null>(null);
const KEY = "f7-theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  // cult.fit is a dark app; dark is the default unless the member chose light.
  const [pref, setPref] = useState<ThemeId | "system">("dark");
  const [system, setSystem] = useState<ThemeId>(Appearance.getColorScheme() === "light" ? "light" : "dark");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setSystem(Appearance.getColorScheme() === "light" ? "light" : "dark");
    AsyncStorage.getItem(KEY)
      .then((v) => { if (v === "light" || v === "dark" || v === "system") setPref(v); })
      .catch(() => {})
      .finally(() => setLoaded(true));
    const sub = Appearance.addChangeListener(({ colorScheme }) => setSystem(colorScheme === "light" ? "light" : "dark"));
    return () => sub.remove();
  }, []);

  const setTheme = useCallback((t: ThemeId | "system") => {
    setPref(t);
    AsyncStorage.setItem(KEY, t).catch(() => {});
  }, []);

  const theme: ThemeId = pref === "system" ? system : pref;
  const value = useMemo(() => ({ theme, colors: fromBand(theme), setTheme, pref }), [theme, setTheme, pref]);
  return <ThemeCtx.Provider value={value}>{loaded ? children : null}</ThemeCtx.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme outside ThemeProvider");
  return ctx;
}

export function useColors(): AppColors {
  return useTheme().colors;
}
