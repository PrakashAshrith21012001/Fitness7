import { Text, type StyleProp, type TextStyle } from "react-native";
import { fmtKcal } from "@f7/content";
import { type } from "@/theme";
import { useColors } from "@/theme/ThemeProvider";

/**
 * A calorie number with its unit: the number at the size the caller wants,
 * then a smaller, muted "kcal" right after it — so every figure on screen
 * says what it is. `of` renders "1,240 / 2,620 kcal".
 */
export function Kcal({
  value,
  of,
  size = "body",
  weight = "700",
  color,
  prefix,
  style,
}: {
  value: number;
  of?: number | null;
  size?: "micro" | "small" | "body" | "title" | "h2";
  weight?: "500" | "600" | "700" | "800";
  color?: string;
  /** e.g. "+" for burned, "≈" for estimates */
  prefix?: string;
  style?: StyleProp<TextStyle>;
}) {
  const colors = useColors();
  const main = type[size];
  const unitSize = size === "h2" ? type.small : size === "title" ? type.micro : { fontSize: Math.max(10, main.fontSize - 3), lineHeight: main.lineHeight };
  return (
    <Text style={[main, { color: color ?? colors.white, fontWeight: weight }, style]} accessibilityLabel={`${prefix ?? ""}${Math.round(value)}${of ? ` of ${Math.round(of)}` : ""} kilocalories`}>
      {prefix ?? ""}
      {fmtKcal(value)}
      {of ? <Text style={{ color: colors.muted, fontWeight: "600" }}> / {fmtKcal(of)}</Text> : null}
      <Text style={[unitSize, { color: colors.muted, fontWeight: "500", letterSpacing: 0 }]}> kcal</Text>
    </Text>
  );
}
