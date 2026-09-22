import { ReactNode } from "react";
import { Pressable, ScrollView, View, type StyleProp, type ViewStyle } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { radius } from "@/theme";
import { useColors } from "@/theme/ThemeProvider";
import { Body, Display } from "@/components/ui";
import { Glass } from "@/components/motion";

/**
 * Stack-screen chrome: a 44pt back target on the left (Fitts), the title,
 * an optional action on the right. Every pushed screen uses it so the way
 * back is always in the same place (Jakob).
 */
export function ScreenHeader({
  title,
  right,
  onBack,
}: {
  title?: string;
  right?: ReactNode;
  onBack?: () => void;
}) {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const back = () => (onBack ? onBack() : router.canGoBack() ? router.back() : router.replace("/(tabs)"));

  return (
    <View
      style={{
        paddingTop: insets.top + 8,
        paddingHorizontal: 12,
        paddingBottom: 8,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
      }}
    >
      <Pressable onPress={back} accessibilityRole="button" accessibilityLabel="Back" hitSlop={8} style={({ pressed }) => [pressed && { opacity: 0.7 }]}>
        <Glass strength="regular" intensity={40} radius={22} style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="chevron-back" size={20} color={colors.white} />
        </Glass>
      </Pressable>
      <View style={{ flex: 1 }}>
        {title ? (
          <Display size="h2" style={{ textTransform: "none", letterSpacing: -0.3 }}>
            {title}
          </Display>
        ) : null}
      </View>
      {right}
    </View>
  );
}

export function Screen({
  children,
  title,
  right,
  contentStyle,
  scroll = true,
}: {
  children: ReactNode;
  title?: string;
  right?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  scroll?: boolean;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const body = (
    <View style={[{ paddingHorizontal: 20, paddingBottom: insets.bottom + 32 }, contentStyle]}>{children}</View>
  );
  return (
    <View style={{ flex: 1, backgroundColor: colors.black }}>
      <ScreenHeader title={title} right={right} />
      {scroll ? (
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {body}
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>{body}</View>
      )}
    </View>
  );
}

/** A tappable settings/profile row. Whole row is the target, not the chevron. */
export function Row({
  icon,
  label,
  value,
  onPress,
  right,
  danger,
  first,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  right?: ReactNode;
  danger?: boolean;
  first?: boolean;
}) {
  const colors = useColors();
  const tint = danger ? colors.danger : colors.lime;
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={value ? `${label}: ${value}` : label}
      style={({ pressed }) => [
        {
          minHeight: 56,
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderTopWidth: first ? 0 : 1,
          borderTopColor: colors.line,
        },
        pressed && onPress && { backgroundColor: colors.surface2 },
      ]}
    >
      {icon ? <Ionicons name={icon} size={20} color={tint} /> : null}
      <View style={{ flex: 1 }}>
        <Body size="title" muted={false} style={[{ fontWeight: "500" }, danger && { color: colors.danger }]}>
          {label}
        </Body>
        {value ? (
          <Body size="small" style={{ marginTop: 1 }}>
            {value}
          </Body>
        ) : null}
      </View>
      {right ?? (onPress ? <Ionicons name="chevron-forward" size={16} color={colors.muted} /> : null)}
    </Pressable>
  );
}

/** Rounded group of Rows with a small caption above — the grouped-list pattern from iOS/Android settings (Proximity). */
export function Group({ title, children }: { title?: string; children: ReactNode }) {
  const colors = useColors();
  return (
    <View style={{ marginTop: 22 }}>
      {title ? (
        <Body size="small" style={{ fontWeight: "600", marginBottom: 8, marginLeft: 4 }}>
          {title}
        </Body>
      ) : null}
      <View
        style={{
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.line,
          backgroundColor: colors.surface,
          overflow: "hidden",
        }}
      >
        {children}
      </View>
    </View>
  );
}
