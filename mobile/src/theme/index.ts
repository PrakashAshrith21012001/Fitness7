import { colors, radius, spacing } from "@f7/content";
import { Platform } from "react-native";

export { colors, radius, spacing };

export const font = {
  /**
   * Anton is loaded as a web font on the site; on device we lean on the
   * platform's heaviest condensed face so the app ships with no font files
   * and no flash of unstyled text.
   */
  // Sentence-case, semibold, tight — the reference apps' headline voice.
  display: Platform.select({
    ios: "System",
    android: "sans-serif-medium",
    default: "system-ui",
  }),
  displayWeight: "600" as "400" | "600" | "900",
};

export const type = {
  hero: { fontSize: 36, lineHeight: 40, letterSpacing: -0.8 },
  h1: { fontSize: 28, lineHeight: 33, letterSpacing: -0.6 },
  h2: { fontSize: 22, lineHeight: 27, letterSpacing: -0.4 },
  title: { fontSize: 17, lineHeight: 23, letterSpacing: -0.2 },
  body: { fontSize: 15, lineHeight: 22 },
  small: { fontSize: 13, lineHeight: 18 },
  micro: { fontSize: 12, lineHeight: 16, letterSpacing: 0 },
} as const;

export const shadow = {
  /** Primary button lift — neutral, not a coloured glow */
  lime: {
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
} as const;
