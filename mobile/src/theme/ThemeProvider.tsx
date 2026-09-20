import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { themes, type ThemeId } from "@f7/content";

/**
 * Light/dark for the app, on the same tokens the website uses (shared/palettes).
 * Saved choice wins; otherwise the OS setting.
 */

export type AppColors = {
  black: string; surface: string; surface2: string; line: string;
  white: string; muted: string; lime: string; green: string; limeDeep: string;
  limeSoft: string; danger: string; onAccent: string;
};

function fromBand(t: ThemeId): AppColors {
  const b = themes[t].valley;
  return {
    black: b.bg, surface: b.surface, surface2: b.surface2, line: b.line,
    white: b.fg, muted: b.muted, lime: b.accent, green: b.green, limeDeep: b.accentDeep,
    limeSoft: "rgba(46, 204, 113, 0.14)", danger: "#ef4444", onAccent: b.onAccent,
  };
}

type Ctx = { theme: ThemeId; colors: AppColors; setTheme: (t: ThemeId | "system") => void; pref: ThemeId | "system" };
const ThemeCtx = createContext<Ctx | null>(null);
const KEY = "f7-theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [pref, setPref] = useState<ThemeId | "system">("system");
  const [system, setSystem] = useState<ThemeId>(Appearance.getColorScheme() === "light" ? "light" : "dark");
  // Hold the first paint until the saved choice is known, so a member who
  // picked dark on a light phone never sees a light flash under the splash.
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Re-read after mount: on web the server render has no idea what the device prefers.
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
