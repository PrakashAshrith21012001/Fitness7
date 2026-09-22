import { ReactNode } from "react";
import {
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { radius, type, font, shadow } from "@/theme";
import { useColors, useTheme } from "@/theme/ThemeProvider";
import { elevation } from "@/components/motion";

export function Display({
  children,
  style,
  size = "h1",
}: {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
  size?: "hero" | "h1" | "h2";
}) {
  const colors = useColors();
  return (
    <Text
      style={[
        {
          color: colors.white,
          fontFamily: font.display,
          fontWeight: font.displayWeight,
        },
        type[size],
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function Body({
  children,
  style,
  muted = true,
  size = "body",
  numberOfLines,
}: {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
  muted?: boolean;
  size?: "body" | "small" | "micro" | "title";
  numberOfLines?: number;
}) {
  const colors = useColors();
  return (
    <Text style={[{ color: muted ? colors.muted : colors.white }, type[size], style]} numberOfLines={numberOfLines}>
      {children}
    </Text>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  const colors = useColors();
  return (
    <Text
      style={{
        color: colors.muted,
        fontWeight: "600",
        ...type.small,
      }}
    >
      {children}
    </Text>
  );
}

/**
 * Card — the app's one raised surface. Soft elevation instead of a hard
 * border in light mode, a hairline plus a deeper shadow in dark. `accent`
 * is the single green-washed card a screen is allowed. With `onPress` the
 * whole card is the target and presses with the shared spring.
 */
export function Card({
  children,
  style,
  accent,
  onPress,
  accessibilityLabel,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  accent?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
}) {
  const colors = useColors();
  const { theme } = useTheme();
  const dark = theme === "dark";
  const base = [
    styles.card,
    elevation(dark),
    { backgroundColor: colors.surface, borderColor: dark ? colors.line : "transparent" },
    accent && { borderColor: colors.accentBorder, backgroundColor: colors.limeSoft },
    style,
  ];
  if (!onPress) return <View style={base}>{children}</View>;
  return (
    <SpringPressable onPress={onPress} accessibilityLabel={accessibilityLabel} style={base}>
      {children}
    </SpringPressable>
  );
}

const SPRING = { damping: 18, stiffness: 320, mass: 0.6 };

function SpringPressable({ children, style, onPress, accessibilityLabel, scale = 0.975 }: { children: ReactNode; style?: StyleProp<ViewStyle>; onPress: () => void; accessibilityLabel?: string; scale?: number }) {
  const s = useSharedValue(1);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPressIn={() => { s.value = withSpring(scale, SPRING); }}
      onPressOut={() => { s.value = withSpring(1, SPRING); }}
    >
      <Animated.View style={[a, style]}>{children}</Animated.View>
    </Pressable>
  );
}

export function Pill({
  label,
  tone = "lime",
}: {
  label: string;
  tone?: "lime" | "amber" | "red" | "muted";
}) {
  const colors = useColors();
  const tones = {
    lime: { color: colors.lime, border: colors.accentBorder },
    amber: { color: "#FBC02D", border: "rgba(251,192,45,0.3)" },
    red: { color: colors.danger, border: "rgba(255,77,77,0.3)" },
    muted: { color: colors.muted, border: colors.line },
  }[tone];

  return (
    <View style={[styles.pill, { borderColor: tones.border }]}>
      <Text
        style={{
          color: tones.color,
          fontWeight: "600",
          ...type.micro,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

/**
 * The pill button. Icon on the left, label centred, an optional chevron on
 * the right (`trailing`) for buttons that lead somewhere. Presses with a
 * spring and casts the green glow only in the lime variant.
 */
export function LimeButton({
  label,
  onPress,
  href,
  icon,
  style,
  variant = "lime",
  trailing,
  disabled,
}: {
  label: string;
  onPress?: () => void;
  href?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
  variant?: "lime" | "outline" | "soft";
  trailing?: boolean;
  disabled?: boolean;
}) {
  const colors = useColors();
  const handle = () => {
    if (href) Linking.openURL(href).catch(() => {});
    onPress?.();
  };
  const isLime = variant === "lime";
  const fg = isLime ? colors.onAccent : colors.white;
  const s = useSharedValue(1);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));

  return (
    <Pressable
      onPress={handle}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      onPressIn={() => { s.value = withSpring(0.97, SPRING); }}
      onPressOut={() => { s.value = withSpring(1, SPRING); }}
    >
      <Animated.View
        style={[
          styles.button,
          a,
          isLime ? [{ backgroundColor: colors.green }, shadow.lime] : variant === "soft" ? { backgroundColor: colors.surface2 } : { borderWidth: 1, borderColor: colors.line },
          disabled && { opacity: 0.5 },
          style,
        ]}
      >
        {icon ? <Ionicons name={icon} size={17} color={fg} style={trailing ? { position: "absolute", left: 20 } : undefined} /> : null}
        <Text style={{ color: fg, fontWeight: "700", ...type.title }}>{label}</Text>
        {trailing ? <Ionicons name="chevron-forward" size={16} color={fg} style={{ position: "absolute", right: 18 }} /> : null}
      </Animated.View>
    </Pressable>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  body,
}: {
  eyebrow?: string;
  title: string;
  body?: string;
}) {
  const colors = useColors();
  return (
    <View style={{ marginBottom: 20 }}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <Display size="h1" style={{ marginTop: eyebrow ? 8 : 0 }}>
        {title}
      </Display>
      {body ? <Body style={{ marginTop: 10 }}>{body}</Body> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: 20,
  },
  pill: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: radius.pill,
    paddingVertical: 15,
    paddingHorizontal: 24,
  },
});
