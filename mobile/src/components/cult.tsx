import { type ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors, useTheme } from "@/theme/ThemeProvider";
import { PressScale } from "@/components/motion";

/**
 * cult.fit primitives. Everything on the navy tabs is built from these so
 * the screens read as one app: the same pane, the same uppercase label,
 * the same pink/white pill, the same underline tabs.
 *
 *   NavyPage        scrolling page on the navy gradient, tab-bar padding
 *   Label           small UPPERCASE letter-spaced caption ("WORKOUT OF THE DAY")
 *   H / T / P       heading / title / paragraph text on navy
 *   Pane            translucent card
 *   CultButton      pill: "pink" (filled), "white" (filled white, pink text — MARK ATTENDANCE), "ghost" (outlined), "dark"
 *   Segmented       AT CENTER · AT HOME · MY PROFILE underline tabs
 *   Chip            rounded filter chip (Badminton / Swimming …)
 *   ActionTile      round-icon + two-line label used in the quick-action grids
 *   SectionHead     bold title with an optional arrow on the right
 *   ArrowLink       "Centers near You ⌄  →"
 *   Divider
 *   Dots            carousel indicator
 */

export function NavyPage({
  children,
  scroll = true,
  contentStyle,
  top = true,
  header,
}: {
  children: ReactNode;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  /** add safe-area top padding */
  top?: boolean;
  /** pinned content above the scroller (a header bar) */
  header?: ReactNode;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const body = <View style={[{ paddingBottom: insets.bottom + 96 }, contentStyle]}>{children}</View>;
  return (
    <View style={{ flex: 1, backgroundColor: colors.black }}>
      <LinearGradient pointerEvents="none" colors={[colors.navyDeep, colors.black, colors.black]} locations={[0, 0.45, 1]} style={StyleSheet.absoluteFill} />
      {top ? <View style={{ height: insets.top }} /> : null}
      {header}
      {scroll ? (
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentInsetAdjustmentBehavior="never">
          {body}
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>{body}</View>
      )}
    </View>
  );
}

export function Label({ children, style, color }: { children: ReactNode; style?: StyleProp<TextStyle>; color?: string }) {
  const colors = useColors();
  return (
    <Text style={[{ color: color ?? colors.muted, fontSize: 11, lineHeight: 14, fontWeight: "700", letterSpacing: 1.1, textTransform: "uppercase" }, style]}>
      {children}
    </Text>
  );
}

export function H({ children, style, size = 22, numberOfLines }: { children: ReactNode; style?: StyleProp<TextStyle>; size?: number; numberOfLines?: number }) {
  const colors = useColors();
  return (
    <Text numberOfLines={numberOfLines} style={[{ color: colors.white, fontSize: size, lineHeight: Math.round(size * 1.2), fontWeight: "800", letterSpacing: -0.3 }, style]}>
      {children}
    </Text>
  );
}

export function T({ children, style, numberOfLines, muted }: { children: ReactNode; style?: StyleProp<TextStyle>; numberOfLines?: number; muted?: boolean }) {
  const colors = useColors();
  return (
    <Text numberOfLines={numberOfLines} style={[{ color: muted ? colors.muted : colors.white, fontSize: 15, lineHeight: 20, fontWeight: "600" }, style]}>
      {children}
    </Text>
  );
}

export function P({ children, style, numberOfLines, size = 13 }: { children: ReactNode; style?: StyleProp<TextStyle>; numberOfLines?: number; size?: number }) {
  const colors = useColors();
  return (
    <Text numberOfLines={numberOfLines} style={[{ color: colors.muted, fontSize: size, lineHeight: Math.round(size * 1.45) }, style]}>
      {children}
    </Text>
  );
}

export function Pane({ children, style, onPress, accessibilityLabel, padding = 14, tint }: { children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; accessibilityLabel?: string; padding?: number; tint?: string }) {
  const colors = useColors();
  const base: StyleProp<ViewStyle> = [{ backgroundColor: tint ?? colors.surface, borderRadius: 14, padding, borderWidth: 1, borderColor: colors.line }, style];
  if (!onPress) return <View style={base}>{children}</View>;
  return (
    <PressScale onPress={onPress} scale={0.98} haptic="selection" accessibilityRole="button" accessibilityLabel={accessibilityLabel} style={base}>
      {children}
    </PressScale>
  );
}

export function CultButton({
  label,
  onPress,
  variant = "pink",
  icon,
  style,
  small,
  disabled,
  full = true,
}: {
  label: string;
  onPress?: () => void;
  variant?: "pink" | "white" | "ghost" | "dark" | "green";
  icon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
  small?: boolean;
  disabled?: boolean;
  full?: boolean;
}) {
  const colors = useColors();
  const { theme } = useTheme();
  const dark = theme === "dark";
  const bg = { pink: colors.pink, white: dark ? "#ffffff" : "#ffffff", ghost: "transparent", dark: colors.surface2, green: colors.success }[variant];
  const fg = { pink: "#ffffff", white: colors.pink, ghost: colors.white, dark: colors.white, green: "#0f1428" }[variant];
  return (
    <PressScale
      onPress={onPress}
      disabled={disabled}
      scale={0.97}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[
        {
          minHeight: small ? 36 : 48,
          paddingHorizontal: small ? 14 : 20,
          borderRadius: 8,
          backgroundColor: bg,
          borderWidth: variant === "ghost" ? 1 : 0,
          borderColor: colors.line,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: 8,
          alignSelf: full ? "stretch" : "flex-start",
        },
        style,
      ]}
    >
      {icon ? <Ionicons name={icon} size={16} color={fg} /> : null}
      <Text style={{ color: fg, fontWeight: "800", fontSize: small ? 12 : 13, letterSpacing: 1, textTransform: "uppercase" }}>{label}</Text>
    </PressScale>
  );
}

export function Segmented<T extends string>({ items, value, onChange, style }: { items: { id: T; label: string }[]; value: T; onChange: (v: T) => void; style?: StyleProp<ViewStyle> }) {
  const colors = useColors();
  return (
    <View style={[{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: colors.line }, style]}>
      {items.map((it) => {
        const on = it.id === value;
        return (
          <Pressable
            key={it.id}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              onChange(it.id);
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            style={{ paddingVertical: 12, marginRight: 22, borderBottomWidth: 2, borderBottomColor: on ? colors.white : "transparent" }}
          >
            <Text style={{ color: on ? colors.white : colors.muted, fontWeight: "800", fontSize: 12, letterSpacing: 1, textTransform: "uppercase" }}>{it.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Chip({ label, on, onPress, icon }: { label: string; on?: boolean; onPress?: () => void; icon?: keyof typeof Ionicons.glyphMap }) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!on }}
      style={{ flexDirection: "row", alignItems: "center", gap: 6, minHeight: 34, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: on ? colors.white : colors.line, backgroundColor: on ? "rgba(255,255,255,0.16)" : colors.surface }}
    >
      {icon ? <Ionicons name={icon} size={14} color={colors.white} /> : null}
      <Text style={{ color: colors.white, fontSize: 13, fontWeight: "600" }}>{label}</Text>
    </Pressable>
  );
}

/** Round icon on top, two short lines under — the quick-action grid. Pass a hex `tint` for the icon. */
export function ActionTile({ icon, label, onPress, tint, width = 72 }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress?: () => void; tint?: string; width?: number }) {
  const colors = useColors();
  return (
    <PressScale onPress={onPress} scale={0.92} accessibilityRole="button" accessibilityLabel={label} style={{ width, alignItems: "center", gap: 8 }}>
      <View style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
        <Ionicons name={icon} size={26} color={tint ?? colors.white} />
      </View>
      <Text style={{ color: colors.muted, fontSize: 11, lineHeight: 14, textAlign: "center", fontWeight: "500" }} numberOfLines={2}>
        {label}
      </Text>
    </PressScale>
  );
}

export function SectionHead({ title, onMore, style, children }: { title: string; onMore?: () => void; style?: StyleProp<ViewStyle>; children?: ReactNode }) {
  const colors = useColors();
  return (
    <View style={[{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, marginBottom: 12 }, style]}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flex: 1 }}>
        <H size={20}>{title}</H>
        {children}
      </View>
      {onMore ? (
        <Pressable onPress={onMore} accessibilityRole="button" accessibilityLabel={`More ${title}`} hitSlop={10}>
          <Ionicons name="arrow-forward" size={20} color={colors.white} />
        </Pressable>
      ) : null}
    </View>
  );
}

/** Inline "You ⌄" picker text used after a section title (Centers near **You**). */
export function Picker({ label, onPress }: { label: string; onPress?: () => void }) {
  const colors = useColors();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={{ flexDirection: "row", alignItems: "center", gap: 2, borderBottomWidth: 1, borderBottomColor: colors.white }}>
      <Text style={{ color: colors.white, fontSize: 17, fontWeight: "700" }}>{label}</Text>
      <Ionicons name="chevron-down" size={16} color={colors.white} />
    </Pressable>
  );
}

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  const colors = useColors();
  return <View style={[{ height: 1, backgroundColor: colors.line }, style]} />;
}

export function Dots({ count, index, style }: { count: number; index: number; style?: StyleProp<ViewStyle> }) {
  const colors = useColors();
  return (
    <View style={[{ flexDirection: "row", gap: 6, alignItems: "center", justifyContent: "center" }, style]}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={{ width: i === index ? 18 : 6, height: 3, borderRadius: 2, backgroundColor: i === index ? colors.white : colors.line }} />
      ))}
    </View>
  );
}

/** A settings-style row with a chevron (Quick Links · Help & Support ›). */
export function LinkRow({ label, onPress, sub, icon, right, first }: { label: string; onPress?: () => void; sub?: string; icon?: keyof typeof Ionicons.glyphMap; right?: ReactNode; first?: boolean }) {
  const colors = useColors();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={({ pressed }) => [{ minHeight: 52, flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderTopWidth: first ? 0 : 1, borderTopColor: colors.line }, pressed && { opacity: 0.7 }]}>
      {icon ? <Ionicons name={icon} size={20} color={colors.white} /> : null}
      <View style={{ flex: 1 }}>
        <T>{label}</T>
        {sub ? <P style={{ marginTop: 2 }}>{sub}</P> : null}
      </View>
      {right ?? <Ionicons name="chevron-forward" size={18} color={colors.muted} />}
    </Pressable>
  );
}

/** Top bar for stack screens on navy: "‹ HRX Workout". */
export function NavyHeader({ title, right, onBack, transparent }: { title?: string; right?: ReactNode; onBack: () => void; transparent?: boolean }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top + 6, paddingHorizontal: 8, paddingBottom: 8, flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: transparent ? "transparent" : undefined }}>
      <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="Back" hitSlop={10} style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}>
        <Ionicons name="chevron-back" size={24} color={colors.white} />
      </Pressable>
      <View style={{ flex: 1 }}>{title ? <H size={17}>{title}</H> : null}</View>
      {right}
    </View>
  );
}

/** Uppercase pill tag — "CONFIRMED" (green), "COMPLETED", "LEVEL 3" (gold). */
export function Tag({ label, tone = "green" }: { label: string; tone?: "green" | "gold" | "pink" | "muted" }) {
  const colors = useColors();
  const c = { green: colors.success, gold: colors.gold, pink: colors.pink, muted: colors.muted }[tone];
  const bg = { green: colors.successSoft, gold: colors.goldSoft, pink: colors.pinkSoft, muted: colors.surface2 }[tone];
  return (
    <View style={{ alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, backgroundColor: bg }}>
      <Text style={{ color: c, fontSize: 10, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase" }}>{label}</Text>
    </View>
  );
}
