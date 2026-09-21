import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { fmtKcal } from "@f7/content";
import { radius } from "@/theme";
import { useColors } from "@/theme/ThemeProvider";
import { useSession, today } from "@/state/session";
import { useFood } from "@/state/food";
import { useDay } from "@/state/day";
import { targetFor } from "@/components/TargetCard";
import { Ring } from "@/components/Ring";
import { Body } from "@/components/ui";

/**
 * Compact "Today" tile for Home: a small ring and two lines —
 * "1,240 eaten · 320 burned" / "1,320 left · 5 of 10 glasses".
 * Tapping opens Today. Quiet by design: the check-in card keeps the accent.
 */
export function TodayTile() {
  const colors = useColors();
  const router = useRouter();
  const { member } = useSession();
  const { totals } = useFood();
  const { burned, waterMl, waterGoal, glassMl } = useDay();
  if (!member) return null;
  const date = today();
  const t = totals(date);
  const burn = burned(date);
  const target = targetFor(member);
  const hide = !!member.hideCalories;
  const budget = target ? target.kcal + burn : null;
  const left = budget !== null ? budget - t.kcal : null;
  const ratio = budget ? t.kcal / budget : t.count ? 1 : 0;
  const glasses = `${Math.round(waterMl(date) / glassMl)} of ${Math.max(1, Math.round(waterGoal(date) / glassMl))} glasses`;
  const nothing = !t.count && !burn;

  const line = hide
    ? t.count ? `${t.count} item${t.count === 1 ? "" : "s"} logged` : "Log what you ate"
    : nothing ? "Log what you ate"
      : `${fmtKcal(t.kcal)} eaten · ${fmtKcal(burn)} burned`;
  const sub = nothing
    ? `Type it, snap the plate, or tap a glass · ${glasses}`
    : hide
      ? glasses
      : left !== null
        ? `${left < 0 ? "Above target today" : `${fmtKcal(left)} left`} · ${glasses}`
        : `${glasses} · add your numbers for a budget`;

  return (
    <Pressable
      onPress={() => router.push("/food")}
      accessibilityRole="button"
      accessibilityLabel={`Today: ${line}. ${sub}`}
      style={({ pressed }) => [
        { flexDirection: "row", alignItems: "center", gap: 14, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, padding: 14, marginBottom: 12 },
        pressed && { borderColor: colors.green },
      ]}
    >
      <Ring size={48} stroke={6} progress={ratio} color={t.count ? colors.green : colors.line}>
        <Ionicons name="restaurant-outline" size={16} color={colors.lime} />
      </Ring>
      <View style={{ flex: 1 }}>
        <Body size="title" muted={false} style={{ fontWeight: "700" }} numberOfLines={1}>{line}</Body>
        <Body size="small" numberOfLines={1}>{sub}</Body>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.muted} />
    </Pressable>
  );
}
