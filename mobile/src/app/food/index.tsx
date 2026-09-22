import { useEffect } from "react";
import { Pressable, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Enter, PressScale } from "@/components/motion";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ACTIVITY_BY_ID, fmtKcal, slotForHour } from "@f7/content";
import { radius } from "@/theme";
import { useColors, useTheme } from "@/theme/ThemeProvider";
import { useSession, today } from "@/state/session";
import { MEALS, useFood } from "@/state/food";
import { useDay } from "@/state/day";
import { missingNumbers, targetFor } from "@/components/TargetCard";
import { Ring, Bar } from "@/components/Ring";
import { WaterStrip } from "@/components/WaterStrip";
import { Body, Card, Display, Eyebrow, LimeButton } from "@/components/ui";
import { MealCard, MEAL_SHARE } from "@/components/MealCard";
import { Screen } from "@/components/Screen";
import { ensurePermission } from "@/lib/reminders";
import { Kcal } from "@/components/Kcal";

export const EXAMPLE = "2 idli, sambar, coffee";

/**
 * Today — the day at a glance, the way HealthifyMe frames it but quieter:
 * one ring (what's left), three numbers (eaten · burned · budget), water as
 * glasses you tap, activity you logged, and the meals underneath. The ring
 * is the one accent element. Over budget reads "Above target today", muted.
 */
export default function Today() {
  const colors = useColors();
  const { theme } = useTheme();
  const dark = theme === "dark";
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
    <PressScale
      key={label}
      onPress={go}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{
        flex: 1,
        minHeight: 60,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        borderRadius: radius.pill,
        backgroundColor: primary ? colors.green : colors.surface,
        borderWidth: primary || !dark ? 0 : 1,
        borderColor: colors.line,
      }}
    >
      <Ionicons name={icon} size={19} color={primary ? colors.onAccent : colors.lime} />
      <Body size="body" muted={false} style={{ fontWeight: "700", color: primary ? colors.onAccent : colors.white }}>{label}</Body>
    </PressScale>
  );

  const stat = (label: string, value: number | null, strong?: boolean, prefix?: string) => (
    <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", minHeight: 26 }}>
      <Body size="micro">{label}</Body>
      {value === null ? <Body size="body" muted={false}>—</Body> : <Kcal value={value} prefix={prefix} size={strong ? "title" : "body"} color={strong && over ? colors.danger : undefined} />}
    </View>
  );

  /**
   * One sentence that tells the member what to do with the rest of the day —
   * the meals not yet logged share what is left, in their usual proportion.
   */
  const guidance = (() => {
    if (budget === null || left === null) return "";
    const hour = new Date().getHours();
    // Meals still ahead of us today (a missed breakfast at 7 pm isn't "to do" any more).
    const order = MEALS.map((m) => m.id);
    const nowSlot = order.indexOf(slotForHour(hour));
    const todo = order.filter((id, i) => i >= nowSlot && !entries.some((e) => e.meal === id));
    if (over) return `About ${fmtKcal(-left)} over today — a lighter ${hour < 16 ? "dinner" : "evening"} or a walk squares it.`;
    if (!todo.length) return "On target for the day.";
    const shareLeft = todo.reduce((a, id) => a + MEAL_SHARE[id], 0);
    const per = todo.map((id) => `~${fmtKcal(Math.round((left * MEAL_SHARE[id]) / shareLeft))} for ${MEALS.find((m) => m.id === id)!.label.toLowerCase()}`);
    return `You can have ${per.slice(0, 2).join(", ")}${todo.length > 2 ? "…" : ""}`;
  })();

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
      <Enter index={0}>
      <Card accent style={{ overflow: "hidden" }}>
        <LinearGradient pointerEvents="none" colors={dark ? ["rgba(185,207,174,0.16)", "rgba(185,207,174,0.02)"] : ["rgba(63,92,60,0.14)", "rgba(63,92,60,0.0)"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />
        <View style={{ flexDirection: "row", alignItems: "center", gap: 18 }}>
          <Ring size={128} stroke={12} progress={budget ? ratio : t.count ? 1 : 0} color={target ? colors.green : colors.line}>
            {hide ? (
              <>
                <Display size="h2">{t.count}</Display>
                <Body size="micro">items</Body>
              </>
            ) : budget !== null ? (
              <>
                <Display size="h2" style={over ? { color: colors.danger } : undefined}>{fmtKcal(t.kcal)}</Display>
                <Body size="small" muted={false} style={{ fontWeight: "600" }}>/ {fmtKcal(budget)}</Body>
                <Body size="micro">kcal</Body>
              </>
            ) : (
              <>
                <Display size="h2">{fmtKcal(t.kcal)}</Display>
                <Body size="micro">kcal</Body>
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
                {stat(over ? "Over by" : "Left", budget !== null ? Math.abs(left ?? 0) : null, true)}
                {stat("Burned", burn, false, "+")}
                {stat("Target", budget)}
              </View>
            )}
            {!hide && !target ? (
              <Pressable onPress={() => router.push("/settings")} accessibilityRole="button" hitSlop={6} style={{ marginTop: 6 }}>
                <Body size="small" style={{ color: colors.lime, fontWeight: "600" }}>For a budget, add your {missingNumbers(member).join(", ")} →</Body>
              </Pressable>
            ) : null}
            {!hide && budget !== null ? <Body size="small" muted={false} style={{ marginTop: 8, fontWeight: "600" }}>{guidance}</Body> : null}
          </View>
        </View>
        {!hide ? (
          <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
            {macro("Protein", t.proteinG, target?.proteinG ?? null, proteinRatio)}
            {macro("Carbs", t.carbsG, target?.carbsG ?? null, target?.carbsG ? t.carbsG / target.carbsG : 0)}
            {macro("Fat", t.fatG, target?.fatG ?? null, target?.fatG ? t.fatG / target.fatG : 0)}
          </View>
        ) : null}
      </Card>
      </Enter>

      {/* Add food */}
      <Enter index={1}><View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
        {action("Add food", "add-circle-outline", () => router.push("/food/add"), true)}
        {action("Snap a plate", "camera-outline", () => router.push("/food/snap"))}
      </View></Enter>

      {/* Meals */}
      <Enter index={2}>
      <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginTop: 22, marginBottom: 10 }}>
        <Eyebrow>Meals</Eyebrow>
        {!hide && t.count ? <Body size="small">{t.count} item{t.count === 1 ? "" : "s"} · <Kcal value={t.kcal} size="small" weight="600" /></Body> : null}
      </View>
      <View style={{ gap: 10 }}>
        {MEALS.map((m) => (
          <MealCard key={m.id} slot={m.id} label={m.label} entries={entries.filter((e) => e.meal === m.id)} target={target?.kcal ?? null} hideCalories={hide} onRemove={remove} />
        ))}
      </View>
      </Enter>

      {/* Water */}
      <Enter index={3}><View style={{ marginTop: 10 }}><WaterStrip /></View></Enter>

      {/* Activity */}
      <Enter index={4}>
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
                  <Body size="micro">{a.minutes} min · ≈{a.kcal} kcal</Body>
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
        <LimeButton label="Log activity" icon="add" variant="soft" trailing onPress={() => router.push("/food/activity")} style={{ marginTop: 12, paddingVertical: 12 }} />
      </Card>
      </Enter>

      <Body size="micro" style={{ marginTop: 24, textAlign: "center" }}>
        Food from the Indian food table or an estimate · burn from MET values · not medical advice
      </Body>
    </Screen>
  );
}
