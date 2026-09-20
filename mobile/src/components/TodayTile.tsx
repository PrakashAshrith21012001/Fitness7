import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { fmtKcal } from "@f7/content";
import { radius } from "@/theme";
import { useColors } from "@/theme/ThemeProvider";
import { useSession, today } from "@/state/session";
import { useFood } from "@/state/food";
import { targetFor } from "@/components/TargetCard";
import { Ring } from "@/components/Ring";
import { Body } from "@/components/ui";

/**
 * Compact "Today" food tile for Home: a small ring and one line —
 * "1,240 / 2,100 kcal · 68 g protein". Tapping opens Food. Quiet by design:
 * the check-in card above it keeps the accent.
 */
export function TodayTile() {
  const colors = useColors();
  const router = useRouter();
  const { member } = useSession();
  const { totals } = useFood();
  if (!member) return null;
  const t = totals(today());
  const target = targetFor(member);
  const hide = !!member.hideCalories;
  const ratio = target ? t.kcal / target.kcal : t.count ? 1 : 0;

  const prot = `${Math.round(t.proteinG)} g protein`;
  const line = hide
    ? t.count
      ? `${t.count} item${t.count === 1 ? "" : "s"} logged`
      : "Log what you ate"
    : target
      ? `${fmtKcal(t.kcal)} / ${fmtKcal(target.kcal)} kcal`
      : t.count
        ? `${fmtKcal(t.kcal)} kcal`
        : "Log what you ate";
  const sub = !t.count
    ? "Type it in plain words or snap the plate"
    : hide
      ? `${prot} · tap for today's meals`
      : target
        ? t.kcal > target.kcal
          ? `${prot} · above target today`
          : `${prot} · ${fmtKcal(target.kcal - t.kcal)} to go`
        : `${prot} · add your numbers for a target`;

  return (
    <Pressable
      onPress={() => router.push("/food")}
      accessibilityRole="button"
      accessibilityLabel={`Food today: ${line}`}
      style={({ pressed }) => [
        { flexDirection: "row", alignItems: "center", gap: 14, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, padding: 14, marginBottom: 12 },
        pressed && { borderColor: colors.green },
      ]}
    >
      <Ring size={48} stroke={6} progress={ratio} color={t.count ? colors.green : colors.line}>
        <Ionicons name="restaurant-outline" size={16} color={colors.lime} />
      </Ring>
      <View style={{ flex: 1 }}>
        <Body size="title" muted={false} style={{ fontWeight: "700" }} numberOfLines={1}>
          {line}
        </Body>
        <Body size="small" numberOfLines={1}>{sub}</Body>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.muted} />
    </Pressable>
  );
}
