import { Linking, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { radius } from "@/theme";
import { useColors } from "@/theme/ThemeProvider";
import { useContent } from "@/state/content";
import { Body } from "@/components/ui";

/** The owner's notice, one at a time, quiet: a megaphone, a title, a line. */
export function AnnouncementCard() {
  const colors = useColors();
  const { announcements } = useContent();
  const a = announcements[0];
  if (!a) return null;
  const body = (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12 }}>
      <Ionicons name="megaphone-outline" size={18} color={colors.lime} />
      <View style={{ flex: 1 }}>
        <Body size="small" muted={false} style={{ fontWeight: "600" }}>{a.title}</Body>
        {a.body ? <Body size="small" numberOfLines={2}>{a.body}</Body> : null}
      </View>
      {a.link_url ? <Ionicons name="open-outline" size={16} color={colors.muted} /> : null}
    </View>
  );
  return a.link_url ? (
    <Pressable onPress={() => Linking.openURL(a.link_url!).catch(() => {})} accessibilityRole="link" accessibilityLabel={a.title}>
      {body}
    </Pressable>
  ) : (
    body
  );
}
