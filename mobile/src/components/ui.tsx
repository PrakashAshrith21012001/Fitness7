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
import { radius, type, font, shadow } from "@/theme";
import { useColors } from "@/theme/ThemeProvider";

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
          textTransform: "uppercase",
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
        color: colors.lime,
        fontWeight: "700",
        textTransform: "uppercase",
        ...type.micro,
        letterSpacing: 1.6,
      }}
    >
      {children}
    </Text>
  );
}

export function Card({
  children,
  style,
  accent,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  accent?: boolean;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.line },
        accent && { borderColor: "rgba(46,204,113,0.45)", backgroundColor: colors.limeSoft },
        style,
      ]}
    >
      {children}
    </View>
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
    lime: { color: colors.lime, border: "rgba(200,255,30,0.3)" },
    amber: { color: "#FBC02D", border: "rgba(251,192,45,0.3)" },
    red: { color: colors.danger, border: "rgba(255,77,77,0.3)" },
    muted: { color: colors.muted, border: colors.line },
  }[tone];

  return (
    <View style={[styles.pill, { borderColor: tones.border }]}>
      <Text
        style={{
          color: tones.color,
          fontWeight: "700",
          textTransform: "uppercase",
          ...type.micro,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export function LimeButton({
  label,
  onPress,
  href,
  icon,
  style,
  variant = "lime",
}: {
  label: string;
  onPress?: () => void;
  href?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
  variant?: "lime" | "outline";
}) {
  const colors = useColors();
  const handle = () => {
    if (href) Linking.openURL(href).catch(() => {});
    onPress?.();
  };

  const isLime = variant === "lime";

  return (
    <Pressable
      onPress={handle}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.button,
        isLime
          ? [{ backgroundColor: colors.green }, shadow.lime]
          : { borderWidth: 1, borderColor: colors.line },
        pressed && { opacity: 0.85, transform: [{ scale: 0.985 }] },
        style,
      ]}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={17}
          color={isLime ? colors.onAccent : colors.white}
        />
      ) : null}
      <Text
        style={{
          color: isLime ? colors.onAccent : colors.white,
          fontWeight: "700",
          ...type.title,
        }}
      >
        {label}
      </Text>
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
