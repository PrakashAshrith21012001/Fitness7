import { useEffect } from "react";
import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ACTIVITY_BY_ID, fmtKcal } from "@f7/content";
import { radius } from "@/theme";
import { useColors } from "@/theme/ThemeProvider";
import { useSession, today } from "@/state/session";
import { MEALS, useFood } from "@/state/food";
import { useDay } from "@/state/day";
import { targetFor } from "@/components/TargetCard";
import { Ring, Bar } from "@/components/Ring";
import { WaterStrip } from "@/components/WaterStrip";
import { Body, Card, Display, Eyebrow, LimeButton } from "@/components/ui";
import { MealCard } from "@/components/MealCard";
import { Screen } from "@/components/Screen";
import { ensurePermission } from "@/lib/reminders";

export const EXAMPLE = "2 idli, sambar, coffee";

/**
 * Today — the day at a glance, the way HealthifyMe frames it but quieter:
 * one ring (what's left), three numbers (eaten · burned · budget), water as
 * glasses you tap, activity you logged, and the meals underneath. The ring
 * is the one accent element. Over budget reads "Above target today", muted.
 */
export default function Today() {
  const colors = useColors();
  const router = useRouter();
  const { member } = useSession();
  const { forDate, totals, remove } = useFood();
  const { activitiesFor, burned, activeMinutes, removeActivity } = useDay();

  // First visit: ask for notification permission here, where reminders make sense — not at launch.
  useEffect(() => {
    if (member?.onboarded && (member.notifications.meals || member.notifications.water)) void ensurePermission(true);
  }, [member?.onboarded, member?.notifications.meals, member?.notifications.water]);

  if (!member) return null;

  const date = today();
  const entries = forDate(date);
  const t = totals(date);
  const target = targetFor(member);
  const hide = !!member.hideCalories;
  const burn = burned(date);
  const minutes = activeMinutes(date);
  const activities = activitiesFor(date);
  const budget = target ? target.kcal + burn : null;
  const left = budget !== null ? budget - t.kcal : null;
  const ratio = budget ? t.kcal / budget : t.count ? 1 : 0;
  const over = left !== null && left < 0;
  const proteinRatio = target ? t.proteinG / target.proteinG : 0;

  const action = (label: string, icon: keyof typeof Ionicons.glyphMap, go: () => void, primary?: boolean) => (
    <Pressable
      key={label}
      onPress={go}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        {
          flex: 1,
          minHeight: 64,
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor: primary ? "rgba(46,204,113,0.45)" : colors.line,
          backgroundColor: primary ? colors.limeSoft : colors.surface,
        },
        pressed && { borderColor: colors.green },
      ]}
    >
      <Ionicons name={icon} size={20} color={colors.lime} />
      <Body size="small" muted={false} style={{ fontWeight: "600" }}>{label}</Body>
    </Pressable>
  );

  const stat = (label: string, value: string, strong?: boolean) => (
    <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", minHeight: 26 }}>
      <Body size="micro">{label}</Body>
      <Body size={strong ? "title" : "body"} muted={false} style={{ fontWeight: "700" }}>{value}</Body>
    </View>
  );

  const macro = (label: string, g: number, goal: number | null, ratio: number) => (
    <View style={{ flex: 1 }}>
      <Body size="micro">{label}</Body>
      <Body size="small" muted={false} style={{ fontWeight: "600", marginTop: 1, marginBottom: 6 }}>{Math.round(g)}{goal ? ` / ${goal}` : ""} g</Body>
      <Bar progress={goal ? ratio : g ? 1 : 0} />
    </View>
  );

  return (
    <Screen title="Today">
      {/* Energy */}
      <Card accent>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 18 }}>
          <Ring size={124} stroke={12} progress={budget ? ratio : t.count ? 1 : 0} color={target ? colors.green : colors.line}>
            {hide ? (
              <>
                <Display size="h2">{t.count}</Display>
                <Body size="micro">ITEMS</Body>
              </>
            ) : left !== null ? (
              <>
                <Display size="h2">{fmtKcal(Math.abs(left))}</Display>
                <Body size="micro">{over ? "OVER" : "LEFT"}</Body>
              </>
            ) : (
              <>
                <Display size="h2">{fmtKcal(t.kcal)}</Display>
                <Body size="micro">KCAL</Body>
              </>
            )}
          </Ring>
          <View style={{ flex: 1 }}>
            <Eyebrow>Today</Eyebrow>
            {hide ? (
              <Body size="title" muted={false} style={{ marginTop: 6, fontWeight: "700" }}>
                {t.count ? `${t.count} item${t.count === 1 ? "" : "s"} logged` : "Nothing logged yet"}
              </Body>
            ) : (
              <View style={{ marginTop: 8, gap: 2 }}>
                {stat("EATEN", fmtKcal(t.kcal), true)}
                {stat("BURNED", `+${fmtKcal(burn)}`)}
                {stat("BUDGET", budget !== null ? fmtKcal(budget) : "—")}
              </View>
            )}
            {!hide && !target ? (
              <Pressable onPress={() => router.push("/settings")} accessibilityRole="button" hitSlop={6} style={{ marginTop: 6 }}>
                <Body size="small" style={{ color: colors.lime, fontWeight: "600" }}>Add your numbers for a budget</Body>
              </Pressable>
            ) : null}
            {!hide && over ? <Body size="small" style={{ marginTop: 6 }}>Above target today</Body> : null}
          </View>
        </View>
        {!hide ? (
          <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
            {macro("PROTEIN", t.proteinG, target?.proteinG ?? null, proteinRatio)}
            {macro("CARBS", t.carbsG, target?.carbsG ?? null, target?.carbsG ? t.carbsG / target.carbsG : 0)}
            {macro("FAT", t.fatG, target?.fatG ?? null, target?.fatG ? t.fatG / target.fatG : 0)}
          </View>
        ) : null}
      </Card>

      {/* Add food */}
      <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
        {action("Add food", "add-circle-outline", () => router.push("/food/add"), true)}
        {action("Snap a plate", "camera-outline", () => router.push("/food/snap"))}
      </View>

      {/* Meals */}
      <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginTop: 22, marginBottom: 10 }}>
        <Eyebrow>Meals</Eyebrow>
        {!hide && t.count ? <Body size="small">{t.count} item{t.count === 1 ? "" : "s"} · {fmtKcal(t.kcal)} kcal</Body> : null}
      </View>
      <View style={{ gap: 10 }}>
        {MEALS.map((m) => (
          <MealCard key={m.id} slot={m.id} label={m.label} entries={entries.filter((e) => e.meal === m.id)} target={target?.kcal ?? null} hideCalories={hide} onRemove={remove} />
        ))}
      </View>

      {/* Water */}
      <View style={{ marginTop: 10 }}><WaterStrip /></View>

      {/* Activity */}
      <Card style={{ marginTop: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" }}>
          <Eyebrow>Moved</Eyebrow>
          <Body size="small">{minutes ? `${minutes} min · ${fmtKcal(burn)} kcal` : "Nothing yet"}</Body>
        </View>
        {activities.length ? (
          <View style={{ marginTop: 10 }}>
            {activities.map((a, i) => (
              <View key={a.id} style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 48, borderTopWidth: i ? 1 : 0, borderTopColor: colors.line, paddingVertical: 6 }}>
                <Ionicons name={(ACTIVITY_BY_ID[a.activityId]?.icon ?? "flash-outline") as keyof typeof Ionicons.glyphMap} size={18} color={colors.lime} />
                <View style={{ flex: 1 }}>
                  <Body size="body" muted={false} numberOfLines={1}>{a.name}</Body>
                  <Body size="micro">{a.minutes} MIN · ≈{a.kcal} KCAL</Body>
                </View>
                <Pressable onPress={() => removeActivity(a.id)} accessibilityRole="button" accessibilityLabel={`Remove ${a.name}`} hitSlop={8} style={{ width: 32, height: 32, alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name="close" size={16} color={colors.muted} />
                </Pressable>
              </View>
            ))}
          </View>
        ) : (
          <Body size="small" style={{ marginTop: 6 }}>Gym session, cricket, a walk — log it and your budget grows.</Body>
        )}
        <LimeButton label="Log activity" icon="add" variant="outline" onPress={() => router.push("/food/activity")} style={{ marginTop: 12, paddingVertical: 12 }} />
      </Card>

      <Body size="micro" style={{ marginTop: 24, textAlign: "center", letterSpacing: 0.4 }}>
        FOOD FROM THE INDIAN FOOD TABLE OR AN ESTIMATE · BURN FROM MET VALUES · NOT MEDICAL ADVICE
      </Body>
    </Screen>
  );
}
