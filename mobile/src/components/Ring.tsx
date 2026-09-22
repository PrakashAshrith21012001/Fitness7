import { View, type StyleProp, type ViewStyle } from "react-native";
import { useEffect, type ReactNode } from "react";
import Animated, { Easing, useAnimatedStyle, useDerivedValue, useSharedValue, withTiming } from "react-native-reanimated";
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

  // The sweep animates from wherever it was to the new value — 600 ms, eased out.
  const deg = useSharedValue(p * 360);
  useEffect(() => {
    deg.value = withTiming(p * 360, { duration: 600, easing: Easing.out(Easing.cubic) });
  }, [p, deg]);
  const rightDeg = useDerivedValue(() => Math.min(180, deg.value));
  const leftDeg = useDerivedValue(() => Math.max(0, deg.value - 180));
  const rightStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rightDeg.value - 135}deg` }], opacity: rightDeg.value > 0.5 ? 1 : 0 }));
  const leftStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${45 + leftDeg.value}deg` }], opacity: leftDeg.value > 0.5 ? 1 : 0 }));

  /**
   * A circle whose top+right borders are coloured is, after a 45° turn, a
   * coloured right half. Clipped to one half of the ring and rotated further,
   * it sweeps: right half covers 0–180°, left half 180–360°.
   */
  const half = (side: "left" | "right", animated: typeof rightStyle) => (
    <View pointerEvents="none" style={{ position: "absolute", top: 0, [side]: 0, width: r, height: size, overflow: "hidden" }}>
      <Animated.View
        style={[
          {
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
          },
          animated,
        ]}
      />
    </View>
  );

  return (
    <View style={[{ width: size, height: size, alignItems: "center", justifyContent: "center" }, style]} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(p * 100) }}>
      {/* glow — only when there is progress to show */}
      {p > 0 && fill === colors.green ? (
        <View pointerEvents="none" style={{ position: "absolute", width: size, height: size, borderRadius: r, shadowColor: colors.green, shadowOpacity: 0.45, shadowRadius: size / 5, shadowOffset: { width: 0, height: 0 }, elevation: 0, backgroundColor: "transparent" }} />
      ) : null}
      <View style={{ position: "absolute", width: size, height: size, borderRadius: r, borderWidth: stroke, borderColor: bg }} />
      {half("right", rightStyle)}
      {half("left", leftStyle)}
      <View style={{ alignItems: "center", justifyContent: "center" }}>{children}</View>
    </View>
  );
}

/** Thin horizontal bar, e.g. protein against its target. */
export function Bar({ progress, color, height = 6, style }: { progress: number; color?: string; height?: number; style?: StyleProp<ViewStyle> }) {
  const colors = useColors();
  const p = Math.max(0, Math.min(1, progress));
  const w = useSharedValue(p);
  useEffect(() => {
    w.value = withTiming(p, { duration: 500, easing: Easing.out(Easing.cubic) });
  }, [p, w]);
  const a = useAnimatedStyle(() => ({ width: `${w.value * 100}%` }));
  return (
    <View style={[{ height, borderRadius: height / 2, backgroundColor: colors.surface2, overflow: "hidden" }, style]} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(p * 100) }}>
      <Animated.View style={[{ height: "100%", backgroundColor: color ?? colors.green, borderRadius: height / 2 }, a]} />
    </View>
  );
}
