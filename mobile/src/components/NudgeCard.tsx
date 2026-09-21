import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { radius } from "@/theme";
import { useColors } from "@/theme/ThemeProvider";
import { useNudge } from "@/components/Reminders";
import { Body } from "@/components/ui";

/**
 * The in-app version of the reminder: one line, muted, tap to act. Shows
 * only when something is actually missing for the time of day. Never red,
 * never a badge, never more than one.
 */
export function NudgeCard() {
  const colors = useColors();
  const router = useRouter();
  const nudge = useNudge();
  if (!nudge) return null;
  return (
    <Pressable
      onPress={() => router.push(nudge.url)}
      accessibilityRole="button"
      accessibilityLabel={`${nudge.title}. ${nudge.body}`}
      style={({ pressed }) => [
        { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, borderStyle: "dashed", paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12 },
        pressed && { borderColor: colors.green },
      ]}
    >
      <Ionicons name={nudge.icon} size={18} color={colors.lime} />
      <View style={{ flex: 1 }}>
        <Body size="small" muted={false} style={{ fontWeight: "600" }}>{nudge.title}</Body>
        <Body size="micro">{nudge.body.toUpperCase()}</Body>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.muted} />
    </Pressable>
  );
}
