import { useMemo, useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import { MUSCLE_LABEL, activitiesFor, brand, squadCopy, squadMembers, workoutFor, type MuscleGroup } from "@f7/content";
import { useColors } from "@/theme/ThemeProvider";
import { useSession } from "@/state/session";
import { addDays, className, useBookings, weekStartOf, type Booking } from "@/state/bookings";
import { CultButton, H, Label, P, Pane, SectionHead, T } from "@/components/cult";
import { Ridges } from "@/components/Scenery";
import { DevicesSheet, GoalSheet, TrackHealthCard, WeeksActiveSheet } from "@/components/ProfileSheets";
import { PressScale } from "@/components/motion";
import { GAP, SCREEN_W, referText, shareText } from "@/components/FitnessShared";
import { TodayTile } from "@/components/TodayTile";
import { MuscleMap } from "@/components/MuscleMap";
import { classPhoto, photo } from "@/lib/photos";

/**
 * Fitness → MY PROFILE: the cult.fit profile pane, section for section —
 * counters, this-week arc, squad leaderboard, quick access, the upcoming
 * class cards, past activities, Track Your Health, the week navigator,
 * Moments, the muscle map, chips, the six-week chart and the streak line.
 */

const MON = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const ALL_MUSCLES = Object.keys(MUSCLE_LABEL) as MuscleGroup[];

const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const to12 = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return `${String(h % 12 === 0 ? 12 : h % 12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};
/** "SEP 28" — the week navigator's format */
const mon = (iso: string) => {
  const d = new Date(iso + "T12:00:00");
  return `${MON[d.getMonth()]} ${d.getDate()}`;
};
const dm = (iso: string) => {
  const d = new Date(iso + "T12:00:00");
  return `${d.getDate()} ${MON[d.getMonth()]}`;
};

export function FitnessProfile({ sheet, onLeave }: { sheet?: boolean; onLeave?: () => void } = {}) {
  const colors = useColors();
  const router = useRouter();
  /** inside the Home sheet, close the sheet before leaving for another screen */
  const go = (href: string | { pathname: string; params?: Record<string, string> }) => {
    onLeave?.();
    router.push(href as never);
  };
  const [sheetOpen, setSheetOpen] = useState<null | "weeks" | "goal" | "devices">(null);
  const { member } = useSession();
  const { upcoming, past, cancel, workoutsTotal, weeksActive, thisWeek, musclesFor, attendedIn, memories } = useBookings();
  const [offset, setOffset] = useState(0);
  const t0 = todayIso();
  const weekStart = addDays(weekStartOf(t0), offset * 7);
  const weekEnd = addDays(weekStart, 6);
  const muscles = useMemo(() => musclesFor(weekStart), [musclesFor, weekStart]);
  const weekBookings = useMemo(() => attendedIn(weekStart, weekEnd), [attendedIn, weekStart, weekEnd]);
  const memory = memories.find((m) => m.date >= weekStart && m.date <= weekEnd);
  const initials = (member?.name || "F7").trim().split(/\s+/).map((s) => s[0]).join("").slice(0, 2).toUpperCase();

  // classes done in the week, by format
  const doneBy = useMemo(() => {
    const m = new Map<string, number>();
    weekBookings.forEach((b) => m.set(b.classId, (m.get(b.classId) ?? 0) + 1));
    return [...m.entries()];
  }, [weekBookings]);

  // last six weeks, ending with the shown week
  const weeks = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => {
        const ws = addDays(weekStart, -7 * (5 - i));
        return { ws, n: attendedIn(ws, addDays(ws, 6)).length };
      }),
    [attendedIn, weekStart],
  );
  const maxN = Math.max(1, ...weeks.map((w) => w.n));

  // upcoming, grouped by date
  const groups = useMemo(() => {
    const m = new Map<string, Booking[]>();
    upcoming.forEach((b) => m.set(b.date, [...(m.get(b.date) ?? []), b]));
    return [...m.entries()];
  }, [upcoming]);
  const groupLabel = (date: string, time: string) => {
    const d = new Date(date + "T12:00:00");
    const head = date === t0 ? "TODAY" : date === addDays(t0, 1) ? "TOMORROW" : `${d.getDate()} ${MON[d.getMonth()].slice(0, 1)}${MON[d.getMonth()].slice(1).toLowerCase()}, ${DAYS[d.getDay()]}`;
    return `${head} • ${to12(time)}`;
  };

  const weekTitle = offset === 0 ? "This Week" : offset === -1 ? "Previous Week" : "Week";
  const myCount = thisWeek.done;

  const risk = thisWeek.done === 0 && weeksActive > 0;
  const message =
    thisWeek.done === 0
      ? squadCopy.streakRisk
      : thisWeek.done < thisWeek.target
        ? `${thisWeek.target - thisWeek.done} more to hit your weekly goal`
        : "Weekly goal done — your streak is safe!";
  // squad on the leaderboard bar: me + buddies by this week's count
  const racers = [
    ...squadMembers.map((m) => ({ id: m.id, initials: m.initials, tint: m.tint, n: activitiesFor(m, 0), me: false })),
    { id: "me", initials, tint: colors.pink, n: myCount, me: true },
  ];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
      {/* ---------- hero band: counters, arc, squad leaderboard on the sunset ridge ---------- */}
      <View style={{ overflow: "hidden", paddingTop: sheet ? 26 : 0 }}>
        <View>
        <LinearGradient pointerEvents="none" colors={["#3d5486", "#56608f", "#97708f", "#d98a95"]} locations={[0, 0.35, 0.72, 1]} style={{ position: "absolute", left: 0, right: 0, top: sheet ? -26 : 0, bottom: 0 }} />
        <View style={{ paddingHorizontal: 16, paddingTop: 14 }}>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <Counter value={workoutsTotal} label="Workouts" icon="walk" iconColor="#2ec5ff" onPress={() => go("/activities")} />
            <Counter value={weeksActive} label="Weeks Active" icon="flash" iconColor="#ffc93c" alert={risk} onPress={() => setSheetOpen("weeks")} />
          </View>
          <Pressable onPress={() => setSheetOpen("goal")} accessibilityRole="button" accessibilityLabel="Edit weekly goal" hitSlop={8} style={{ alignSelf: "flex-end", marginTop: 10, width: 36, height: 36, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="pencil-outline" size={20} color="#fff" />
          </Pressable>
          <Pressable onPress={() => go("/activities")} accessibilityRole="button" accessibilityLabel={`${thisWeek.done} of ${thisWeek.target} this week activity`} style={{ alignItems: "center", marginTop: -14 }}>
            <Arc progress={thisWeek.done / thisWeek.target} />
            <View style={{ position: "absolute", top: 58, alignItems: "center" }}>
              <Text style={{ color: "#fff", fontSize: 40, fontWeight: "900" }}>{thisWeek.done}/{thisWeek.target}</Text>
              <Label style={{ marginTop: 0, color: "rgba(255,255,255,0.85)", fontSize: 10 }}>This week activity</Label>
            </View>
          </Pressable>
          <Text style={{ color: "#fff", fontSize: 16, lineHeight: 22, fontWeight: "700", textAlign: "center", marginTop: -8, paddingHorizontal: 12 }}>{message}</Text>

          {/* squad leaderboard */}
          <Pressable onPress={() => go("/squad")} accessibilityRole="button" accessibilityLabel={`Squad leaderboard: you have ${myCount} this week`} style={{ marginTop: 48 }}>
            <LeaderBar racers={racers} />
            <Label style={{ textAlign: "center", marginTop: 8, fontSize: 10, color: "rgba(255,255,255,0.85)" }}>Squad leaderboard</Label>
          </Pressable>
        </View>
        <View style={{ marginTop: -6 }}>
          <Ridges width={SCREEN_W} height={96} />
        </View>
        </View>
        <View style={{ backgroundColor: "#283152" }}>
          <LinearGradient pointerEvents="none" colors={["#283152", "#1d2342", colors.black]} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />
          {/* now quickly access */}
          <View style={{ alignItems: "center", marginTop: 8 }}>
            <View style={{ position: "absolute", left: 24, right: 24, top: 14, height: 40, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, borderBottomWidth: 0, borderColor: "rgba(255,255,255,0.18)" }} />
            <View style={{ paddingHorizontal: 18, paddingVertical: 7, borderRadius: 999, backgroundColor: "#283152", borderWidth: 1, borderColor: "rgba(255,255,255,0.35)" }}>
              <Text style={{ color: "#fff", fontSize: 12, fontWeight: "800", letterSpacing: 1.2 }}>NOW QUICKLY ACCESS</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: 18, paddingBottom: 18, paddingHorizontal: 24 }}>
            <QuickBox icon="people" tint="#3ddc84" label={"my\nsquad"} onPress={() => go("/squad")} />
            <QuickBox icon="list" tint="#ff7a6e" label={"workout\nplan"} onPress={() => go("/plan")} />
            <QuickBox icon="barbell" tint="#ff9f43" label={"strength\ntracker"} onPress={() => go("/progress")} />
          </View>
        </View>
      </View>

      {/* ---------- upcoming class cards ---------- */}
      <View style={{ paddingHorizontal: 16, marginTop: 8, gap: 18 }}>
        {groups.length === 0 ? (
          <Pane onPress={() => go("/fitness")} accessibilityLabel="Book a class">
            <T>No upcoming classes</T>
            <P style={{ marginTop: 2 }}>Book your next session from AT CENTER</P>
          </Pane>
        ) : null}
        {groups.map(([date, list]) => (
          <View key={date}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <H size={16}>{groupLabel(date, list[0].time)}</H>
              <Pressable onPress={() => go(`/booking/${list[0].id}`)} accessibilityRole="button" accessibilityLabel="Options" hitSlop={10}>
                <Ionicons name="ellipsis-horizontal" size={18} color={colors.white} />
              </Pressable>
            </View>
            <View style={{ gap: 10 }}>
              {list.map((b) => {
                const w = workoutFor(b.classId, new Date(b.date + "T12:00:00").getDay());
                return (
                  <Pane key={b.id} padding={0} style={{ overflow: "hidden" }}>
                    <Pressable onPress={() => go(`/booking/${b.id}`)} accessibilityRole="button" accessibilityLabel={`${className(b.classId)} ${w.focus}, ${to12(b.time)}`} style={{ flexDirection: "row", gap: 14, padding: 12 }}>
                      <View style={{ width: 64, height: 64, borderRadius: 8, overflow: "hidden", backgroundColor: colors.surface2 }}>
                        <Image source={classPhoto(b.classId)} style={{ width: "100%", height: "100%" }} resizeMode="cover" accessibilityIgnoresInvertColors />
                      </View>
                      <View style={{ flex: 1 }}>
                        <T numberOfLines={1}>{className(b.classId)} {w.focus}</T>
                        <P style={{ marginTop: 4 }}>50 Min</P>
                        <P style={{ marginTop: 2 }}>{brand.name} TS Square</P>
                      </View>
                    </Pressable>
                    <View style={{ flexDirection: "row", borderTopWidth: 1, borderTopColor: colors.line }}>
                      <Pressable onPress={() => shareText(`Join me for ${className(b.classId)} at ${brand.name} on ${dm(b.date)} at ${to12(b.time)}. ${referText(member?.name)}`)} accessibilityRole="button" accessibilityLabel="Invite" style={{ flex: 1, minHeight: 44, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRightWidth: 1, borderRightColor: colors.line }}>
                        <Ionicons name="share-social-outline" size={14} color={colors.muted} />
                        <Label>Invite</Label>
                      </Pressable>
                      <Pressable onPress={() => cancel(b.id)} accessibilityRole="button" accessibilityLabel="Cancel class" style={{ flex: 1, minHeight: 44, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}>
                        <Ionicons name="close-circle-outline" size={14} color={colors.muted} />
                        <Label>Cancel</Label>
                      </Pressable>
                    </View>
                  </Pane>
                );
              })}
            </View>
          </View>
        ))}

        {/* past activities */}
        <Pane onPress={() => go("/activities")} accessibilityLabel="Past activities, view all" style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <View style={{ width: 64, height: 64, borderRadius: 8, overflow: "hidden", backgroundColor: colors.surface2 }}>
            <Image source={classPhoto(past[0]?.classId ?? "strength")} style={{ width: "100%", height: "100%" }} resizeMode="cover" accessibilityIgnoresInvertColors />
          </View>
          <View style={{ flex: 1 }}>
            <T>Past activities</T>
            <Label style={{ marginTop: 6, color: colors.white }}>View all</Label>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.muted} />
        </Pane>

        {/* track your health */}
        <TrackHealthCard onConnect={() => setSheetOpen("devices")} bg={colors.surface2} />
        {/* calorie tracker — the Today ring */}
        <View style={{ marginTop: 12 }}>
          <TodayTile />
        </View>
      </View>

      {/* ---------- week navigator ---------- */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, marginTop: GAP }}>
        <Pressable onPress={() => setOffset((o) => o - 1)} accessibilityRole="button" accessibilityLabel="Previous week" hitSlop={10} style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="chevron-back" size={22} color={colors.white} />
        </Pressable>
        <View style={{ alignItems: "center" }}>
          <H size={18}>{weekTitle}</H>
          <Label style={{ marginTop: 4, color: colors.muted }}>{mon(weekStart)} - {mon(weekEnd)}</Label>
        </View>
        <Pressable onPress={() => setOffset((o) => Math.min(0, o + 1))} disabled={offset >= 0} accessibilityRole="button" accessibilityLabel="Next week" hitSlop={10} style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center", opacity: offset >= 0 ? 0.3 : 1 }}>
          <Ionicons name="chevron-forward" size={22} color={colors.white} />
        </Pressable>
      </View>

      {/* ---------- Moments ---------- */}
      <View style={{ marginTop: GAP }}>
        <SectionHead title="Moments" onMore={() => go("/activities/memories")} />
        <View style={{ paddingHorizontal: 16 }}>
          <View style={{ borderRadius: 14, padding: 16, backgroundColor: "#1b1d27", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}>
            <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}>{memory ? `• ${dm(memory.date)} • ${to12(memory.time).replace(":00", "").replace(/^0/, "")}` : `• ${mon(weekStart)} - ${mon(weekEnd)}`}</Text>
                <Text style={{ color: "#fff", fontSize: 17, fontWeight: "800", marginTop: 2 }}>{memory ? className(memory.classId) : "No moments this week"}</Text>
              </View>
              <Pressable onPress={() => go("/activities/memories")} accessibilityRole="button" accessibilityLabel="All moments" hitSlop={10}>
                <Ionicons name="camera-outline" size={22} color="#fff" />
              </Pressable>
            </View>
            <PressScale onPress={() => (memory ? go({ pathname: "/activities/memory", params: { id: memory.id } }) : go("/fitness"))} scale={0.98} accessibilityRole="button" accessibilityLabel={memory ? "Open memory" : "Book a class"} style={{ alignItems: "center", marginTop: 22, marginBottom: 6 }}>
              <View style={{ width: SCREEN_W - 110, height: 190, backgroundColor: memory ? "#f4f1ea" : "transparent", padding: memory ? 6 : 0, borderWidth: memory ? 0 : 2, borderColor: "rgba(255,255,255,0.55)", transform: [{ rotate: "-3deg" }] }}>
                {memory ? <Image source={photo(memory.photo)} style={{ width: "100%", height: "100%" }} resizeMode="cover" accessibilityIgnoresInvertColors /> : (
                  <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, textAlign: "center", paddingHorizontal: 20 }}>Attend a class to capture a moment</Text>
                  </View>
                )}
                {/* tape on all four corners */}
                {[
                  { left: -16, top: -6, r: "-40deg" },
                  { right: -16, top: -6, r: "40deg" },
                  { left: -16, bottom: -6, r: "40deg" },
                  { right: -16, bottom: -6, r: "-40deg" },
                ].map(({ r, ...pos }, i) => (
                  <View key={i} style={{ position: "absolute", ...pos, width: 44, height: 12, backgroundColor: "rgba(214,190,200,0.85)", transform: [{ rotate: r }] }} />
                ))}
              </View>
            </PressScale>
            <CultButton label="Share" variant="dark" disabled={!memory} onPress={() => memory && shareText(`${className(memory.classId)} at ${brand.name} • ${dm(memory.date)} #WEAREF7`)} style={{ marginTop: 18, backgroundColor: "#24305e", opacity: memory ? 1 : 0.5 }} />
          </View>
        </View>
      </View>

      {/* ---------- This week you focused on ---------- */}
      <View style={{ marginTop: GAP, paddingHorizontal: 16 }}>
        <H size={20}>This week you focused on</H>
        <View style={{ alignItems: "center", marginTop: 16 }}>
          <MuscleMap muscles={muscles} width={SCREEN_W - 80} />
        </View>
        <Label style={{ marginTop: 18 }}>You focused on</Label>
        <T style={{ marginTop: 4 }}>{muscles.length ? "improving the strength of your muscles + muscle gain" : "rest — no sessions logged this week"}</T>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
          {ALL_MUSCLES.map((m) => {
            const on = muscles.includes(m);
            return (
              <View key={m} style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: on ? colors.successSoft : colors.surface2, borderWidth: 1, borderColor: on ? colors.success : "transparent" }}>
                <Text style={{ color: on ? colors.success : colors.muted, fontSize: 9, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase" }}>{MUSCLE_LABEL[m]}</Text>
              </View>
            );
          })}
        </View>

        <H size={18} style={{ marginTop: 22 }}>Classes done</H>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
          {doneBy.length === 0 ? <P>None this week</P> : null}
          {doneBy.map(([id, n]) => (
            <Pressable key={id} onPress={() => go(`/class/${id}`)} accessibilityRole="button" accessibilityLabel={`${className(id)} ${n}`} style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingLeft: 10, paddingRight: 4, paddingVertical: 4, borderRadius: 999, backgroundColor: colors.surface2 }}>
              <Text style={{ color: colors.white, fontSize: 9, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase" }}>{className(id)}</Text>
              <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: colors.black, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "#fff", fontSize: 9, fontWeight: "800" }}>{n}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* last six weeks */}
        <H size={18} style={{ marginTop: 26 }}>Your last 6 weeks</H>
        <Pane style={{ marginTop: 12 }} padding={16}>
          <View style={{ flexDirection: "row", alignItems: "flex-end", height: 120, gap: 8 }}>
            {weeks.map((w, i) => {
              const cur = i === 5;
              return (
                <Pressable key={w.ws} onPress={() => setOffset((o) => o - (5 - i))} accessibilityRole="button" accessibilityLabel={`${w.n} workouts in the week of ${dm(w.ws)}`} style={{ flex: 1, alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
                  <Text style={{ color: colors.white, fontSize: 12, fontWeight: "700", marginBottom: 4 }}>{w.n}</Text>
                  <View style={{ width: 12, height: Math.max(4, (w.n / maxN) * 84), borderRadius: 2, backgroundColor: cur ? colors.pink : "#ff7a6e" }} />
                </Pressable>
              );
            })}
          </View>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
            {weeks.map((w, i) => (
              <Text key={w.ws} style={{ flex: 1, textAlign: "center", color: i === 5 ? colors.pink : colors.muted, fontSize: 8, fontWeight: "800" }}>{dm(w.ws)}</Text>
            ))}
          </View>
          {thisWeek.done === 0 && weeksActive > 0 && offset === 0 ? (
            <Text style={{ color: colors.muted, fontSize: 15, lineHeight: 21, fontWeight: "600", marginTop: 22 }}>{squadCopy.slipping}</Text>
          ) : (
            <View style={{ marginTop: 22 }}>
              <P>You've been regular for</P>
              <Text style={{ color: colors.white, fontSize: 18, fontWeight: "900", marginTop: 2 }}>
                {weeksActive} WEEK{weeksActive === 1 ? "" : "S"} <Text style={{ color: colors.muted, fontSize: 12, fontWeight: "400" }}>in a row</Text>
              </Text>
            </View>
          )}
        </Pane>
      </View>

      <WeeksActiveSheet open={sheetOpen === "weeks"} onClose={() => setSheetOpen(null)} />
      <GoalSheet open={sheetOpen === "goal"} onClose={() => setSheetOpen(null)} />
      <DevicesSheet open={sheetOpen === "devices"} onClose={() => setSheetOpen(null)} />
    </ScrollView>
  );
}

function Counter({ value, label, icon, iconColor, alert, onPress }: { value: number; label: string; icon: keyof typeof Ionicons.glyphMap; iconColor: string; alert?: boolean; onPress: () => void }) {
  return (
    <PressScale onPress={onPress} scale={0.97} accessibilityRole="button" accessibilityLabel={`${value} ${label}`} style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, height: 64, borderRadius: 10, backgroundColor: alert ? "rgba(40,50,90,0.35)" : "rgba(255,255,255,0.16)", borderWidth: 1.5, borderColor: alert ? "#ff4d5a" : "rgba(255,255,255,0.18)" }}>
      <Ionicons name={icon} size={26} color={iconColor} />
      <View>
        <Text style={{ color: alert ? "#ff4d5a" : "#fff", fontSize: 18, fontWeight: "800" }}>{value}</Text>
        <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 13 }}>{label}</Text>
      </View>
    </PressScale>
  );
}

function QuickBox({ icon, tint, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; tint: string; label: string; onPress: () => void }) {
  return (
    <PressScale onPress={onPress} scale={0.94} accessibilityRole="button" accessibilityLabel={label.replace("\n", " ")} style={{ alignItems: "center", width: 90 }}>
      <View style={{ width: 64, height: 64, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" }}>
        <Ionicons name={icon} size={28} color={tint} />
      </View>
      <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, lineHeight: 17, textAlign: "center", marginTop: 8 }}>{label}</Text>
    </PressScale>
  );
}

/**
 * The squad bar: orange → lime → green track with a stop for 1…6+, every
 * squad member's avatar sitting on their count this week. YOU is pinned
 * under the member's own avatar.
 */
function LeaderBar({ racers }: { racers: { id: string; initials: string; tint: string; n: number; me: boolean }[] }) {
  const [w, setW] = useState(0);
  const slot = (n: number) => (Math.min(6, n) / 6) * (w - 32) + 16;
  const stack = new Map<number, number>();
  const labels = ["YOU", "1", "2", "3", "4", "5", "6+"];
  const me = racers.find((r) => r.me)!;
  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      <View style={{ height: 14, borderRadius: 7, overflow: "hidden", marginHorizontal: 4 }}>
        <LinearGradient colors={["#ff6a2b", "#ffb21e", "#e6f53a", "#8fe628", "#3f9e2c"]} locations={[0, 0.18, 0.4, 0.7, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1 }} />
      </View>
      {w > 0
        ? [1, 2, 3, 4, 5, 6].map((i) => <View key={i} style={{ position: "absolute", top: 4, left: slot(i) - 3, width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(20,40,10,0.7)" }} />)
        : null}
      {w > 0
        ? [...racers].sort((a, b) => Number(a.me) - Number(b.me)).map((r) => {
            const k = Math.min(6, r.n);
            const off = stack.get(k) ?? 0;
            stack.set(k, off + 1);
            const size = r.me ? 34 : 30;
            return (
              <View key={r.id} style={{ position: "absolute", top: 7 - size / 2, left: slot(k) - size / 2 + off * 12, width: size, height: size, borderRadius: size / 2, backgroundColor: r.tint, borderWidth: 2, borderColor: "#fff", alignItems: "center", justifyContent: "center", zIndex: r.me ? 3 : 1 }}>
                <Text style={{ color: "#fff", fontWeight: "800", fontSize: r.me ? 11 : 10 }}>{r.initials}</Text>
              </View>
            );
          })
        : null}
      <View style={{ height: 22, marginTop: 12 }}>
        {w > 0
          ? labels.map((t, i) => {
              const mine = i === Math.min(6, me.n);
              const text = i === 0 ? (me.n === 0 ? "YOU" : "0") : mine ? "YOU" : t;
              const ahead = i > me.n && i < 6;
              return (
                <Text key={i} style={{ position: "absolute", left: slot(i) - 18, width: 36, textAlign: "center", color: mine ? "#fff" : ahead ? "#7dff6a" : "rgba(255,255,255,0.75)", fontSize: mine ? 13 : 12, fontWeight: mine ? "900" : "500" }}>
                  {text}
                </Text>
              );
            })
          : null}
      </View>
    </View>
  );
}

/** Semicircular gauge — a 220° arc, green on a translucent track. */
function Arc({ progress }: { progress: number }) {
  const colors = useColors();
  const size = 210;
  const r = 88;
  const cx = size / 2;
  const cy = 108;
  const p = Math.max(0, Math.min(1, progress));
  const pt = (deg: number) => {
    const a = (deg * Math.PI) / 180;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  };
  const arc = (from: number, to: number) => {
    const s = pt(from);
    const e = pt(to);
    const large = to - from > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
  };
  // 160° → 380° (= 20°): lower-left, over the top, to lower-right; the mouth opens downward
  const from = 160;
  const to = 380;
  const fillTo = from + (to - from) * p;
  return (
    <Svg width={size} height={140} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(p * 100) }}>
      <Path d={arc(from, to)} stroke="rgba(255,255,255,0.28)" strokeWidth={9} strokeLinecap="round" fill="none" />
      {p > 0 ? <Path d={arc(from, fillTo)} stroke={colors.success} strokeWidth={8} strokeLinecap="round" fill="none" /> : null}
    </Svg>
  );
}
