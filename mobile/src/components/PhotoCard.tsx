import type { ReactNode } from "react";
import { Image, View, type ImageSourcePropType, type StyleProp, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { radius, type } from "@/theme";
import { useColors, useTheme } from "@/theme/ThemeProvider";
import { Body } from "@/components/ui";
import { Glass, PressScale, elevation } from "@/components/motion";

/**
 * The photo-led card the whole app is built on — the pattern in the
 * reference apps: a full-bleed photo, a soft scrim, the name in white on the
 * photo (or below it on a white plinth), and one round glass control in a
 * corner. Two shapes:
 *   tile  — portrait 4:5, for grids and horizontal rails
 *   wide  — landscape, for the one thing a screen wants you to open
 */

type Props = {
  photo: ImageSourcePropType;
  title: string;
  subtitle?: string;
  /** small text under the photo in `plinth` layout, e.g. "60 min · All levels" */
  meta?: string;
  /** top-left chip on the photo */
  chip?: string;
  /** top-right round control */
  corner?: { icon: keyof typeof Ionicons.glyphMap; on?: boolean; label: string; onPress: () => void };
  onPress?: () => void;
  accessibilityLabel?: string;
  variant?: "tile" | "wide";
  /** "overlay" puts the words on the photo; "plinth" puts them on a card below (reference "Choose your bottle" grid) */
  layout?: "overlay" | "plinth";
  width?: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
};

export function PhotoCard({ photo, title, subtitle, meta, chip, corner, onPress, accessibilityLabel, variant = "tile", layout = "plinth", width, height, style, children }: Props) {
  const colors = useColors();
  const { theme } = useTheme();
  const dark = theme === "dark";
  const w = width ?? (variant === "tile" ? 168 : undefined);
  const photoH = height ?? (variant === "tile" ? 190 : 220);
  const r = radius.lg;

  const words = (onPhoto: boolean) => (
    <View>
      <Body size={variant === "tile" ? "body" : "title"} muted={false} numberOfLines={2} style={{ fontWeight: "700", color: onPhoto ? "#fff" : colors.white, ...(variant === "wide" ? type.h2 : null) }}>
        {title}
      </Body>
      {subtitle ? (
        <Body size="small" numberOfLines={onPhoto ? 1 : 2} style={{ marginTop: 2, color: onPhoto ? "rgba(255,255,255,0.82)" : colors.muted }}>
          {subtitle}
        </Body>
      ) : null}
      {meta ? (
        <Body size="micro" numberOfLines={1} style={{ marginTop: 6, color: onPhoto ? "rgba(255,255,255,0.7)" : colors.muted }}>
          {meta}
        </Body>
      ) : null}
    </View>
  );

  const body = (
    <View style={[{ width: w, borderRadius: r, overflow: "hidden", backgroundColor: colors.surface, borderWidth: dark ? 1 : 0, borderColor: colors.line }, elevation(dark), style]}>
      <View style={{ height: photoH, backgroundColor: colors.surface2 }}>
        <Image source={photo} style={{ width: "100%", height: "100%" }} resizeMode="cover" accessibilityIgnoresInvertColors />
        {layout === "overlay" ? (
          <LinearGradient pointerEvents="none" colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.15)", "rgba(0,0,0,0.65)"]} locations={[0, 0.45, 1]} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />
        ) : null}
        {chip ? (
          <View style={{ position: "absolute", top: 12, left: 12 }}>
            <Glass onPhoto intensity={30} radius={999} style={{ paddingHorizontal: 12, height: 30, justifyContent: "center" }}>
              <Body size="micro" style={{ color: "#fff", fontWeight: "600" }}>{chip}</Body>
            </Glass>
          </View>
        ) : null}
        {corner ? (
          <View style={{ position: "absolute", top: 10, right: 10 }}>
            <PressScale onPress={corner.onPress} scale={0.9} accessibilityRole="button" accessibilityLabel={corner.label} accessibilityState={{ selected: !!corner.on }} hitSlop={6}>
              {corner.on ? (
                <View style={{ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: colors.green }}>
                  <Ionicons name={corner.icon} size={18} color={colors.onAccent} />
                </View>
              ) : (
                <Glass onPhoto intensity={30} radius={20} style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name={corner.icon} size={18} color="#fff" />
                </Glass>
              )}
            </PressScale>
          </View>
        ) : null}
        {layout === "overlay" ? <View style={{ position: "absolute", left: 16, right: 16, bottom: 14 }}>{words(true)}</View> : null}
      </View>
      {layout === "plinth" ? <View style={{ padding: 14, paddingTop: 12, minHeight: variant === "tile" ? 84 : undefined }}>{words(false)}</View> : null}
      {children}
    </View>
  );

  if (!onPress) return body;
  return (
    <PressScale onPress={onPress} scale={0.975} haptic="selection" accessibilityRole="button" accessibilityLabel={accessibilityLabel ?? title}>
      {body}
    </PressScale>
  );
}

/** Photo header for detail screens: the picture, a scrim, and whatever chrome the caller floats on top. */
export function PhotoHeader({ photo, height = 380, children }: { photo: ImageSourcePropType; height?: number; children?: ReactNode }) {
  const colors = useColors();
  return (
    <View style={{ height, backgroundColor: colors.surface2 }}>
      <Image source={photo} style={{ width: "100%", height: "100%" }} resizeMode="cover" accessibilityIgnoresInvertColors />
      <LinearGradient pointerEvents="none" colors={["rgba(0,0,0,0.25)", "rgba(0,0,0,0)", "rgba(0,0,0,0.55)"]} locations={[0, 0.35, 1]} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />
      {children}
    </View>
  );
}

/** "Capacity · Material · Keeps cold" row from the reference detail screen: three quiet facts, divided by hairlines. */
export function FactsRow({ facts }: { facts: { label: string; value: string }[] }) {
  const colors = useColors();
  return (
    <View style={{ flexDirection: "row", borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.line, paddingVertical: 14 }}>
      {facts.map((f, i) => (
        <View key={f.label} style={{ flex: 1, paddingHorizontal: i ? 14 : 0, borderLeftWidth: i ? 1 : 0, borderLeftColor: colors.line }}>
          <Body size="micro">{f.label}</Body>
          <Body size="body" muted={false} style={{ fontWeight: "600", marginTop: 2 }} numberOfLines={3}>{f.value}</Body>
        </View>
      ))}
    </View>
  );
}
