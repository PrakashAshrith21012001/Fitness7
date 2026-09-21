import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ACTIVITIES, ACTIVITY_BY_ID, ACTIVITY_CATEGORIES, burnKcal, type ActivityCategory } from "@f7/content";
import { radius } from "@/theme";
import { useColors } from "@/theme/ThemeProvider";
import { useSession, today } from "@/state/session";
import { useDay } from "@/state/day";
import { Chips } from "@/components/Pickers";
import { Body, Display, LimeButton } from "@/components/ui";
import { ScreenHeader } from "@/components/Screen";

const DURATIONS = [15, 30, 45, 60, 90, 120];

/**
 * Log activity — pick what, pick how long, see the estimate, add. Two taps
 * for the common case: the member's recent activities sit at the top with
 * their usual duration already chosen. A gym check-in today pre-selects
 * "Strength training" so the session is one tap.
 */
export default function LogActivity() {
  const colors = useColors();
  const router = useRouter();
  const { member } = useSession();
  const { addActivity, recentActivities, kg, activitiesFor } = useDay();
  const checkedIn = !!member?.checkins.includes(today());
  const gymLogged = activitiesFor(today()).some((a) => ACTIVITY_BY_ID[a.activityId]?.category === "gym");

  const [cat, setCat] = useState<ActivityCategory>(recentActivities.length ? ACTIVITY_BY_ID[recentActivities[0]]?.category ?? "gym" : "gym");
  const [picked, setPicked] = useState<string | null>(checkedIn && !gymLogged ? "strength" : recentActivities[0] ?? null);
  const [minutes, setMinutes] = useState<number>(picked ? ACTIVITY_BY_ID[picked]?.defaultMin ?? 30 : 30);
  const [busy, setBusy] = useState(false);

  // The recent list arrives after the cache loads — pre-select the usual one then.
  useEffect(() => {
    if (!picked && recentActivities.length) {
      setPicked(recentActivities[0]);
      setMinutes(ACTIVITY_BY_ID[recentActivities[0]]?.defaultMin ?? 30);
      setCat(ACTIVITY_BY_ID[recentActivities[0]]?.category ?? "gym");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recentActivities.length]);

  const list = useMemo(() => ACTIVITIES.filter((a) => a.category === cat), [cat]);
  const chosen = picked ? ACTIVITY_BY_ID[picked] : null;
  const kcal = chosen ? burnKcal(chosen.met, minutes, kg) : 0;

  const choose = (id: string) => {
    Haptics.selectionAsync().catch(() => {});
    setPicked(id);
    setMinutes(ACTIVITY_BY_ID[id]?.defaultMin ?? 30);
  };

  const save = async () => {
    if (!picked || busy) return;
    setBusy(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    await addActivity(picked, minutes);
    router.back();
  };

  const tile = (id: string, selected: boolean) => {
    const a = ACTIVITY_BY_ID[id];
    if (!a) return null;
    return (
      <Pressable
        key={id}
        onPress={() => choose(id)}
        accessibilityRole="radio"
        accessibilityState={{ selected }}
        accessibilityLabel={a.name}
        style={({ pressed }) => [
          {
            flexBasis: "48%",
            flexGrow: 0,
            minHeight: 64,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderRadius: radius.md,
            borderWidth: 1,
            borderColor: selected ? colors.green : colors.line,
            backgroundColor: selected ? colors.limeSoft : colors.surface,
          },
          pressed && { opacity: 0.85 },
        ]}
      >
        <Ionicons name={a.icon as keyof typeof Ionicons.glyphMap} size={20} color={selected ? colors.green : colors.muted} />
        <Body size="small" muted={false} style={{ flex: 1, fontWeight: "600" }} numberOfLines={2}>{a.name}</Body>
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.black }}>
      <ScreenHeader title="Log activity" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 200 }} showsVerticalScrollIndicator={false}>
        {recentActivities.length ? (
          <>
            <Body size="micro" style={{ letterSpacing: 1.4, marginBottom: 8 }}>YOUR USUAL</Body>
            <View style={{ flexDirection: "row", flexWrap: "wrap", columnGap: "4%", rowGap: 8, marginBottom: 18 }}>{recentActivities.map((id) => tile(id, picked === id))}</View>
          </>
        ) : null}

        {checkedIn && !gymLogged ? (
          <View style={{ flexDirection: "row", gap: 10, alignItems: "center", marginBottom: 14, borderRadius: radius.md, borderWidth: 1, borderColor: "rgba(46,204,113,0.45)", backgroundColor: colors.limeSoft, padding: 12 }}>
            <Ionicons name="checkmark-circle" size={18} color={colors.green} />
            <Body size="small" muted={false} style={{ flex: 1 }}>You checked in today — strength training is pre-selected. Change it if you did something else.</Body>
          </View>
        ) : null}

        <Body size="micro" style={{ letterSpacing: 1.4, marginBottom: 8 }}>WHAT</Body>
        <Chips value={cat} options={ACTIVITY_CATEGORIES} onChange={setCat} />
        <View style={{ flexDirection: "row", flexWrap: "wrap", columnGap: "4%", rowGap: 8, marginTop: 12 }}>{list.map((a) => tile(a.id, picked === a.id))}</View>

        {chosen ? (
          <View style={{ marginTop: 22 }}>
            <Body size="micro" style={{ letterSpacing: 1.4, marginBottom: 8 }}>HOW LONG</Body>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {DURATIONS.map((d) => {
                const on = d === minutes;
                return (
                  <Pressable
                    key={d}
                    onPress={() => {
                      Haptics.selectionAsync().catch(() => {});
                      setMinutes(d);
                    }}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: on }}
                    style={{ minHeight: 40, paddingHorizontal: 14, justifyContent: "center", borderRadius: radius.pill, borderWidth: 1, borderColor: on ? colors.green : colors.line, backgroundColor: on ? colors.green : colors.surface2 }}
                  >
                    <Body size="small" style={{ fontWeight: "600", color: on ? colors.onAccent : colors.white }}>{d < 60 ? `${d} min` : d === 60 ? "1 hr" : d === 90 ? "1½ hr" : `${d / 60} hr`}</Body>
                  </Pressable>
                );
              })}
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 12 }}>
              {(["remove", "add"] as const).map((icon) => (
                <Pressable
                  key={icon}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    setMinutes((m) => Math.max(5, Math.min(720, m + (icon === "add" ? 5 : -5))));
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={icon === "add" ? "5 minutes more" : "5 minutes less"}
                  style={({ pressed }) => [
                    { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface2 },
                    pressed && { borderColor: colors.green },
                  ]}
                >
                  <Ionicons name={icon} size={18} color={colors.white} />
                </Pressable>
              ))}
              <Body size="title" muted={false} style={{ fontWeight: "700" }}>{minutes} min</Body>
            </View>
          </View>
        ) : null}
      </ScrollView>

      {chosen ? (
        <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: 20, paddingTop: 14, backgroundColor: colors.black, borderTopWidth: 1, borderTopColor: colors.line }}>
          <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
            <Body size="small" muted={false} style={{ fontWeight: "600" }} numberOfLines={1}>{chosen.name} · {minutes} min</Body>
            <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4 }}>
              <Display size="h2" style={{ color: colors.lime }}>≈{kcal}</Display>
              <Body size="micro">KCAL</Body>
            </View>
          </View>
          <Body size="micro" style={{ marginBottom: 10 }}>ESTIMATE FOR {kg} KG · MET {chosen.met} · A STARTING POINT, NOT A MEASUREMENT</Body>
          <LimeButton label="Add to today" icon="checkmark" onPress={save} />
        </View>
      ) : null}
    </View>
  );
}
