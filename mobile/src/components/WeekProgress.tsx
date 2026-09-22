import { useMemo } from "react";
import { Image, Platform, Pressable, Share, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MUSCLE_LABEL, type MuscleGroup } from "@f7/content";
import { useColors } from "@/theme/ThemeProvider";
import { addDays, className, useBookings, weekStartOf } from "@/state/bookings";
import { today } from "@/state/session";
import { H, Label, P, Pane, T } from "@/components/cult";
import { PressScale } from "@/components/motion";
import { MuscleMap } from "@/components/MuscleMap";
import { photo } from "@/lib/photos";
import { CENTRE, clockShort, dayMonthCaps, shortDay } from "@/components/BookingDates";

/**
 * The weekly progress block under MY PROFILE — cult's order exactly:
 * week navigator, Moments polaroid, "This week you focused on" muscle map,
 * YOU FOCUSED ON copy, muscle chips, Classes done pills, the last-6-weeks
 * bar chart and "You've been regular for N WEEKS in a row".
 */

const ALL_MUSCLES: MuscleGroup[] = ["quads", "chest", "glutes", "upper-back", "abs", "lower-back", "shoulders", "biceps", "lats", "triceps", "forearms", "hamstrings", "calves", "obliques"];
const CORAL = "#ff6b6b";

export function WeekProgress({ weekStart, onPrev, onNext, canNext }: { weekStart: string; onPrev: () => void; onNext: () => void; canNext: boolean }) {
  const colors = useColors();
  const router = useRouter();
  const { musclesFor, attendedIn, weeksActive, memories } = useBookings();
  const t = today();
  const thisWeek = weekStartOf(t);
  const weekEnd = addDays(weekStart, 6);
  const title = weekStart === thisWeek ? "This Week" : weekStart === addDays(thisWeek, -7) ? "Previous Week" : "Week";
  const muscles = useMemo(() => musclesFor(weekStart), [musclesFor, weekStart]);
  const classesDone = useMemo(() => {
    const items = attendedIn(weekStart, weekEnd);
    const counts = new Map<string, number>();
    for (const b of items) counts.set(b.classId, (counts.get(b.classId) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [attendedIn, weekStart, weekEnd]);
  const bars = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => {
        const ws = addDays(weekStart, -7 * (5 - i));
        return { ws, n: attendedIn(ws, addDays(ws, 6)).length };
      }),
    [attendedIn, weekStart],
  );
  const max = Math.max(1, ...bars.map((b) => b.n));
  const moment = useMemo(() => memories.find((m) => m.date >= weekStart && m.date <= weekEnd), [memories, weekStart, weekEnd]);
  const empty = classesDone.length === 0;

  const shareMoment = async () => {
    if (!moment) return;
    const text = `${className(moment.classId)} at ${CENTRE} — ${shortDay(moment.date)}, ${clockShort(moment.time)}. #WEAREFITNESS7`;
    if (Platform.OS === "web") {
      const nav = typeof navigator !== "undefined" ? (navigator as Navigator & { share?: (d: { text: string }) => Promise<void> }) : undefined;
      if (nav?.share) await nav.share({ text }).catch(() => {});
      return;
    }
    await Share.share({ message: text }).catch(() => {});
  };

  const tape = (style: object) => <View pointerEvents="none" style={[{ position: "absolute", width: 34, height: 12, backgroundColor: "rgba(255,255,255,0.35)", transform: [{ rotate: "-45deg" }] }, style]} />;

  return (
    <View>
      {/* week navigator */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 8, marginTop: 8 }}>
        <Pressable onPress={onPrev} accessibilityRole="button" accessibilityLabel="Previous week" hitSlop={10} style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="chevron-back" size={22} color={colors.white} />
        </Pressable>
        <View style={{ alignItems: "center" }}>
          <T>{title}</T>
          <Label style={{ marginTop: 2 }}>{dayMonthCaps(weekStart)} – {dayMonthCaps(weekEnd)}</Label>
        </View>
        <Pressable onPress={onNext} disabled={!canNext} accessibilityRole="button" accessibilityLabel="Next week" accessibilityState={{ disabled: !canNext }} hitSlop={10} style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center", opacity: canNext ? 1 : 0.3 }}>
          <Ionicons name="chevron-forward" size={22} color={colors.white} />
        </Pressable>
      </View>

      {/* moments */}
      <View style={{ paddingHorizontal: 16, marginTop: 18 }}>
        <Pressable onPress={() => router.push("/activities/memories")} accessibilityRole="button" accessibilityLabel="Moments" style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 32 }}>
          <H size={16}>Moments</H>
          <Ionicons name="arrow-forward" size={18} color={colors.white} />
        </Pressable>
        <Pane style={{ marginTop: 10 }} onPress={() => (moment ? router.push({ pathname: "/activities/memory", params: { id: moment.id } }) : router.push("/activities/memories"))} accessibilityLabel="Open moment">
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <View>
              <Label style={{ color: colors.muted }}>{moment ? `• ${dayMonthCaps(moment.date)} • ${clockShort(moment.time)}` : "• this week"}</Label>
              <T style={{ marginTop: 2 }}>{moment ? className(moment.classId) : "No moment yet"}</T>
            </View>
            <Ionicons name="camera-outline" size={18} color={colors.white} />
          </View>
          <View style={{ alignItems: "center", marginTop: 14, marginBottom: 6 }}>
            <View style={{ width: "88%", aspectRatio: 4 / 3, backgroundColor: "#151a2e", borderRadius: 4, transform: [{ rotate: "-2deg" }], overflow: "visible" }}>
              {moment ? <Image source={photo(moment.photo)} style={{ width: "100%", height: "100%", borderRadius: 4 }} resizeMode="cover" accessibilityIgnoresInvertColors /> : <View style={{ flex: 1, borderRadius: 4, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center" }}><P>Attend a class to add one</P></View>}
              {tape({ top: -4, left: -10 })}
              {tape({ top: -4, right: -10, transform: [{ rotate: "45deg" }] })}
              {tape({ bottom: -4, left: -10, transform: [{ rotate: "45deg" }] })}
              {tape({ bottom: -4, right: -10 })}
            </View>
          </View>
          <Pressable onPress={shareMoment} disabled={!moment} accessibilityRole="button" accessibilityLabel="Share moment" style={{ marginTop: 12, minHeight: 40, borderRadius: 8, backgroundColor: colors.surface2, alignItems: "center", justifyContent: "center", opacity: moment ? 1 : 0.5 }}>
            <Text style={{ color: colors.white, fontSize: 12, fontWeight: "800", letterSpacing: 1 }}>SHARE</Text>
          </Pressable>
        </Pane>
      </View>

      {/* muscle map */}
      <View style={{ paddingHorizontal: 16, marginTop: 28 }}>
        <H size={18}>This week you focused on</H>
        <View style={{ alignItems: "center", marginTop: 16 }}>
          <MuscleMap muscles={muscles} width={230} />
        </View>
        {empty ? <P style={{ textAlign: "center", marginTop: 10 }}>No classes this week yet</P> : null}
        <Label style={{ marginTop: 22 }}>You focused on</Label>
        <T style={{ marginTop: 6 }}>{empty ? "Nothing yet — book a class and the map lights up" : "improving the strength of your muscles + muscle gain"}</T>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
          {ALL_MUSCLES.map((m) => {
            const on = muscles.includes(m);
            return (
              <View key={m} style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: on ? colors.successSoft : colors.surface, borderWidth: 1, borderColor: on ? "rgba(61,220,132,0.4)" : colors.line }}>
                <Text style={{ color: on ? colors.success : colors.muted, fontSize: 10, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase" }}>{MUSCLE_LABEL[m]}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* classes done */}
      <View style={{ paddingHorizontal: 16, marginTop: 28 }}>
        <H size={18}>Classes done</H>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
          {empty ? <P>None this week</P> : null}
          {classesDone.map(([cid, n]) => (
            <PressScale key={cid} onPress={() => router.push(`/class/${cid}`)} scale={0.96} accessibilityRole="button" accessibilityLabel={`${className(cid)} ${n} classes`} style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingLeft: 12, paddingRight: 6, minHeight: 32, borderRadius: 999, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line }}>
              <Text style={{ color: colors.white, fontSize: 10, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase" }}>{className(cid)}</Text>
              <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: colors.surface2, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: colors.white, fontSize: 11, fontWeight: "800" }}>{n}</Text>
              </View>
            </PressScale>
          ))}
        </View>
      </View>

      {/* last 6 weeks */}
      <View style={{ paddingHorizontal: 16, marginTop: 28 }}>
        <H size={18}>Your last 6 weeks</H>
        <Pane style={{ marginTop: 12 }} accessibilityLabel="Classes per week, last six weeks">
          <View style={{ flexDirection: "row", alignItems: "flex-end", height: 150, gap: 6 }}>
            {bars.map((b) => {
              const cur = b.ws === weekStart;
              const hgt = Math.max(4, Math.round((b.n / max) * 100));
              return (
                <View key={b.ws} style={{ flex: 1, alignItems: "center", justifyContent: "flex-end" }} accessibilityLabel={`${dayMonthCaps(b.ws)}: ${b.n} classes`}>
                  <Text style={{ color: colors.white, fontSize: 13, fontWeight: "700", marginBottom: 4 }}>{b.n}</Text>
                  <View style={{ width: 12, height: hgt, borderRadius: 3, backgroundColor: CORAL, opacity: b.n ? 1 : 0.35 }} />
                  <Text style={{ color: cur ? colors.pink : colors.muted, fontSize: 9, fontWeight: "800", letterSpacing: 0.4, marginTop: 8 }}>{dayMonthCaps(b.ws)}</Text>
                </View>
              );
            })}
          </View>
        </Pane>
        <View style={{ marginTop: 22, marginBottom: 8 }}>
          <T style={{ color: colors.muted, fontWeight: "500" }}>You've been regular for</T>
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6 }}>
            <H size={22}>{weeksActive} {weeksActive === 1 ? "WEEK" : "WEEKS"}</H>
            <T style={{ color: colors.muted, fontWeight: "500" }}>in a row</T>
          </View>
        </View>
      </View>
    </View>
  );
}
