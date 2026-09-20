import { colors, radius, spacing } from "@f7/content";
import { Platform } from "react-native";

export { colors, radius, spacing };

export const font = {
  /**
   * Anton is loaded as a web font on the site; on device we lean on the
   * platform's heaviest condensed face so the app ships with no font files
   * and no flash of unstyled text.
   */
  display: Platform.select({
    ios: "Impact",
    android: "sans-serif-condensed",
    default: "sans-serif-condensed",
  }),
  displayWeight: Platform.select({
    ios: "400",
    android: "900",
    default: "900",
  }) as "400" | "900",
};

export const type = {
  hero: { fontSize: 40, lineHeight: 42, letterSpacing: -1.2 },
  h1: { fontSize: 30, lineHeight: 34, letterSpacing: -0.8 },
  h2: { fontSize: 22, lineHeight: 27, letterSpacing: -0.4 },
  title: { fontSize: 17, lineHeight: 23, letterSpacing: -0.2 },
  body: { fontSize: 15, lineHeight: 23 },
  small: { fontSize: 13, lineHeight: 19 },
  micro: { fontSize: 11, lineHeight: 15, letterSpacing: 0.6 },
} as const;

export const shadow = {
  lime: {
    shadowColor: colors.lime,
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
} as const;
