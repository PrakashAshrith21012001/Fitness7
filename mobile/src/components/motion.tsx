import { type ReactNode } from "react";
import { Platform, Pressable, StyleSheet, View, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import { BlurTargetView, BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import type { RefObject } from "react";
import { useTheme } from "@/theme/ThemeProvider";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

/**
 * Motion primitives. Every tappable surface in the app presses with the same
 * short spring (scale 0.97, ~180 ms settle) and a light haptic tick, so the
 * whole app feels like one material. Sections enter with a 200 ms fade-up,
 * staggered by `index` so a screen assembles rather than pops (Doherty:
 * nothing waits on these — they run on the UI thread).
 */

const SPRING = { damping: 18, stiffness: 320, mass: 0.6 };

export function PressScale({
  children,
  style,
  scale = 0.97,
  haptic = "light",
  onPress,
  disabled,
  ...rest
}: Omit<PressableProps, "style"> & {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  scale?: number;
  haptic?: "light" | "medium" | "selection" | "none";
}) {
  const s = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  // flex has to live on the outer Pressable for the tile to take its share of a row
  const flat = StyleSheet.flatten(style) as ViewStyle | undefined;
  return (
    <Pressable
      {...rest}
      style={flat?.flex !== undefined ? { flex: flat.flex } : undefined}
      disabled={disabled}
      onPressIn={(e) => {
        s.value = withSpring(scale, SPRING);
        rest.onPressIn?.(e);
      }}
      onPressOut={(e) => {
        s.value = withSpring(1, SPRING);
        rest.onPressOut?.(e);
      }}
      onPress={(e) => {
        if (haptic === "selection") Haptics.selectionAsync().catch(() => {});
        else if (haptic !== "none") Haptics.impactAsync(haptic === "medium" ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        onPress?.(e);
      }}
    >
      <Animated.View style={[animated, style, disabled && { opacity: 0.5 }]}>{children}</Animated.View>
    </Pressable>
  );
}

/** Fade-up entrance for a block; `index` staggers siblings by 50 ms. */
export function Enter({ children, index = 0, style }: { children: ReactNode; index?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <Animated.View entering={FadeInDown.duration(220).delay(Math.min(index, 8) * 50)} style={style}>
      {children}
    </Animated.View>
  );
}

/** Soft elevation shared by cards and floating bars; tuned per theme by the caller's colours. */
export const elevation = (dark: boolean) =>
  dark
    ? { shadowColor: "#000", shadowOpacity: 0.35, shadowRadius: 18, shadowOffset: { width: 0, height: 10 }, elevation: 6 }
    : { shadowColor: "#1a2a1f", shadowOpacity: 0.08, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 4 };

/* ---------------- glass ---------------- */


/**
 * Glass — frosted, translucent surface for chrome that floats over content:
 * the tab bar, sticky action bars, header buttons over a photo, the hero
 * card. Real backdrop blur on iOS and web; on Android the experimental
 * blur method is used (works on most devices; where it doesn't, the tinted
 * overlay alone still reads as glass). A 1 px light hairline on top sells
 * the edge. Never put body text on glass over busy content — chrome only.
 */
export function Glass({
  children,
  style,
  intensity = 40,
  strength = "regular",
  radius: r = 24,
  target,
  onPhoto,
}: {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  strength?: "light" | "regular" | "strong";
  radius?: number;
  /** Android only: the BlurTarget whose pixels sit behind this glass. Without it Android can't blur. */
  target?: RefObject<View | null>;
  /** Sitting on a photo: always a dark smoked glass with white content, in both themes. */
  onPhoto?: boolean;
}) {
  const { theme } = useTheme();
  const dark = theme === "dark";
  // Real backdrop blur happens on iOS, web, and Android when a target is wired.
  const blurs = Platform.OS !== "android" || !!target;
  let overlay: string;
  let edge: string;
  let border: string;
  if (onPhoto) {
    // Smoked glass: readable white text on any photo, light or dark theme.
    overlay = `rgba(12,14,12,${blurs ? 0.28 : 0.42})`;
    edge = "rgba(255,255,255,0.22)";
    border = "rgba(255,255,255,0.18)";
  } else {
    // Frosted panel. Without a real blur the tint has to be nearly opaque, or
    // the text scrolling underneath shows through and it reads as a smudge.
    const alpha = blurs ? { light: 0.35, regular: 0.55, strong: 0.78 }[strength] : { light: 0.86, regular: 0.9, strong: 0.94 }[strength];
    overlay = dark ? `rgba(30,35,30,${alpha})` : `rgba(255,255,255,${alpha})`;
    edge = dark ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.95)";
    border = dark ? "rgba(255,255,255,0.10)" : "rgba(27,30,26,0.08)";
  }
  return (
    <View style={[{ borderRadius: r, overflow: "hidden", borderWidth: 1, borderColor: border }, style]}>
      {blurs ? (
        <BlurView
          pointerEvents="none"
          intensity={intensity}
          tint={onPhoto || dark ? "dark" : "light"}
          blurMethod={target ? "dimezisBlurViewSdk31Plus" : "none"}
          blurTarget={target}
          blurReductionFactor={3}
          style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
        />
      ) : null}
      <View pointerEvents="none" style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, backgroundColor: overlay }} />
      {/* sheen: light catching the top of the pane */}
      <LinearGradient pointerEvents="none" colors={[onPhoto || dark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.7)", "rgba(255,255,255,0)"]} style={{ position: "absolute", left: 0, right: 0, top: 0, height: "55%" }} />
      <View pointerEvents="none" style={{ position: "absolute", left: 0, right: 0, top: 0, height: 1, backgroundColor: edge }} />
      {children}
    </View>
  );
}

/** Wrap the content that scrolls under a Glass so Android can blur it; pass the same ref to `Glass target`. */
export function GlassTarget({ targetRef, children, style }: { targetRef: RefObject<View | null>; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <BlurTargetView ref={targetRef} style={[{ flex: 1 }, style]}>
      {children}
    </BlurTargetView>
  );
}
