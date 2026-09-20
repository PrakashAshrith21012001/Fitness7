import { View, type StyleProp, type ViewStyle } from "react-native";
import type { ReactNode } from "react";
import { useColors } from "@/theme/ThemeProvider";

/**
 * A progress ring drawn with Views — no SVG library. Two half-circle
 * borders, each clipped to a half, rotated by the progress. The same idea
 * as the ten-bar weight chart: nothing to install, works on web too.
 */
export function Ring({
  size = 96,
  stroke = 10,
  progress,
  color,
  track,
  children,
  style,
}: {
  size?: number;
  stroke?: number;
  /** 0–1; values above 1 fill the ring and are shown by the caller's copy, not by colour */
  progress: number;
  color?: string;
  track?: string;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const colors = useColors();
  const p = Math.max(0, Math.min(1, progress));
  const fill = color ?? colors.green;
  const bg = track ?? colors.surface2;
  const r = size / 2;
  const deg = p * 360;
  const rightDeg = Math.min(180, deg);
  const leftDeg = Math.max(0, deg - 180);

  /**
   * A circle whose top+right borders are coloured is, after a 45° turn, a
   * coloured right half. Clipped to one half of the ring and rotated further,
   * it sweeps: right half covers 0–180°, left half 180–360°.
   */
  const half = (side: "left" | "right", degrees: number) => (
    <View pointerEvents="none" style={{ position: "absolute", top: 0, [side]: 0, width: r, height: size, overflow: "hidden" }}>
      <View
        style={{
          position: "absolute",
          top: 0,
          [side === "right" ? "left" : "right"]: -r,
          width: size,
          height: size,
          borderRadius: r,
          borderWidth: stroke,
          borderTopColor: fill,
          borderRightColor: fill,
          borderBottomColor: "transparent",
          borderLeftColor: "transparent",
          transform: [{ rotate: `${side === "right" ? degrees - 135 : 45 + degrees}deg` }],
        }}
      />
    </View>
  );

  return (
    <View style={[{ width: size, height: size, alignItems: "center", justifyContent: "center" }, style]} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(p * 100) }}>
      <View style={{ position: "absolute", width: size, height: size, borderRadius: r, borderWidth: stroke, borderColor: bg }} />
      {rightDeg > 0 ? half("right", rightDeg) : null}
      {leftDeg > 0 ? half("left", leftDeg) : null}
      <View style={{ alignItems: "center", justifyContent: "center" }}>{children}</View>
    </View>
  );
}

/** Thin horizontal bar, e.g. protein against its target. */
export function Bar({ progress, color, height = 6, style }: { progress: number; color?: string; height?: number; style?: StyleProp<ViewStyle> }) {
  const colors = useColors();
  const p = Math.max(0, Math.min(1, progress));
  return (
    <View style={[{ height, borderRadius: height / 2, backgroundColor: colors.surface2, overflow: "hidden" }, style]} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(p * 100) }}>
      <View style={{ width: `${p * 100}%`, height: "100%", backgroundColor: color ?? colors.green, borderRadius: height / 2 }} />
    </View>
  );
}
