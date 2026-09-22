import { useMemo, useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import { MUSCLE_LABEL, brand, squad, workoutFor, type MuscleGroup } from "@f7/content";
import { useColors } from "@/theme/ThemeProvider";
import { useSession } from "@/state/session";
import { addDays, className, useBookings, weekStartOf, type Booking } from "@/state/bookings";
import { ActionTile, CultButton, H, Label, P, Pane, SectionHead, T } from "@/components/cult";
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
const dm = (iso: string) => {
  const d = new Date(iso + "T12:00:00");
  return `${d.getDate()} ${MON[d.getMonth()]}`;
};

export function FitnessProfile() {
  const colors = useColors();
  const router = useRouter();
  const { member } = useSession();
  const { upcoming, past, cancel, workoutsTotal, weeksActive, thisWeek, musclesFor, attendedIn, memories } = useBookings();
  const [health, setHealth] = useState(true);
  const [offset, setOffset] = useState(0);
  const t0 = todayIso();
  const weekStart = addDays(weekStartOf(t0), offset * 7);
  const weekEnd = addDays(weekStart, 6);
  const muscles = useMemo(() => musclesFor(weekStart), [musclesFor, weekStart]);
  const weekBookings = useMemo(() => attendedIn(weekStart, weekEnd), [attendedIn, weekStart, weekEnd]);
  const memory = memories.find((m) => m.date >= weekStart && m.date <= weekEnd) ?? memories[0];
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

  const weekTitle = offset === 0 ? "This Week" : offset === -1 ? "Last Week" : offset === 1 ? "Next Week" : `${Math.abs(offset)} weeks ${offset < 0 ? "ago" : "ahead"}`;
  const myCount = thisWeek.done;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
      {/* ---------- hero band: counters, arc, leaderboard ---------- */}
      <View style={{ overflow: "hidden" }}>
        <Image source={photo("trek")} style={{ position: "absolute", width: "100%", height: "100%" }} resizeMode="cover" accessibilityIgnoresInvertColors />
        <LinearGradient pointerEvents="none" colors={["rgba(40,60,120,0.75)", "rgba(15,20,40,0.85)", colors.black]} locations={[0, 0.6, 1]} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />
        <View style={{ paddingHorizontal: 16, paddingTop: 14 }}>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Counter value={workoutsTotal} label="Workouts" onPress={() => router.push("/activities")} />
            <Counter value={weeksActive} label="Weeks Active" onPress={() => router.push("/progress")} />
          </View>
          <Pressable onPress={() => router.push("/profile")} accessibilityRole="button" accessibilityLabel="Edit profile" hitSlop={8} style={{ alignSelf: "flex-end", marginTop: 10, width: 36, height: 36, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="pencil" size={16} color={colors.white} />
          </Pressable>
          <Pressable onPress={() => router.push("/activities")} accessibilityRole="button" accessibilityLabel={`${thisWeek.done} of ${thisWeek.target} this week activity`} style={{ alignItems: "center", marginTop: -10 }}>
            <Arc progress={thisWeek.done / thisWeek.target} />
            <View style={{ position: "absolute", top: 58, alignItems: "center" }}>
              <Text style={{ color: "#fff", fontSize: 34, fontWeight: "900" }}>{thisWeek.done}/{thisWeek.target}</Text>
              <Label style={{ marginTop: 2, color: "rgba(255,255,255,0.8)", fontSize: 9 }}>This week activity</Label>
            </View>
          </Pressable>

          {/* squad leaderboard */}
          <View style={{ marginTop: 22, marginBottom: 6 }}>
            <View style={{ height: 8, borderRadius: 4, overflow: "hidden" }}>
              <LinearGradient colors={[colors.success, "#d7ff3a", colors.gold, colors.pink]} locations={[0, 0.4, 0.75, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1 }} />
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
              {["0", "YOU", "2", "3", "4", "5", "6+"].map((t, i) => (
                <Text key={t} style={{ width: 30, textAlign: i === 0 ? "left" : i === 6 ? "right" : "center", color: t === "YOU" ? "#fff" : colors.muted, fontSize: 10, fontWeight: "800" }}>{t}</Text>
              ))}
            </View>
            <Pressable onPress={() => shareText(referText(member?.name))} accessibilityRole="button" accessibilityLabel={`You: ${myCount} workouts this week. Invite your squad`} style={{ position: "absolute", top: -14, left: `${Math.min(6, myCount) * (100 / 6)}%`, marginLeft: -18, width: 36, height: 36, borderRadius: 18, backgroundColor: colors.pink, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#fff" }}>
              <Text style={{ color: "#fff", fontWeight: "800", fontSize: 12 }}>{initials}</Text>
            </Pressable>
            <Label style={{ textAlign: "center", marginTop: 6, fontSize: 9 }}>Squad leaderboard</Label>
          </View>

          {/* now quickly access */}
          <View style={{ alignItems: "center", marginTop: 18 }}>
            <View style={{ paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.14)" }}>
              <Label style={{ color: "#fff", fontSize: 9 }}>Now quickly access</Label>
            </View>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: 12, paddingBottom: 12 }}>
            <ActionTile icon="people-outline" label={"my\nsquad"} width={90} tint={colors.success} onPress={() => shareText(`Join my squad at ${brand.name}! ${squad.map((s) => s.name).join(", ")} and I train together — come along. ${referText(member?.name)}`)} />
            <ActionTile icon="list-outline" label={"workout\nplan"} width={90} tint={colors.gold} onPress={() => router.push("/plan")} />
            <ActionTile icon="trending-up-outline" label={"strength\ntracker"} width={90} tint={colors.pink} onPress={() => router.push("/progress")} />
          </View>
        </View>
      </View>

      {/* ---------- upcoming class cards ---------- */}
      <View style={{ paddingHorizontal: 16, marginTop: 8, gap: 18 }}>
        {groups.length === 0 ? (
          <Pane onPress={() => router.push("/fitness")} accessibilityLabel="Book a class">
            <T>No upcoming classes</T>
            <P style={{ marginTop: 2 }}>Book your next session from AT CENTER</P>
          </Pane>
        ) : null}
        {groups.map(([date, list]) => (
          <View key={date}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <H size={16}>{groupLabel(date, list[0].time)}</H>
              <Pressable onPress={() => router.push(`/booking/${list[0].id}`)} accessibilityRole="button" accessibilityLabel="Options" hitSlop={10}>
                <Ionicons name="ellipsis-horizontal" size={18} color={colors.white} />
              </Pressable>
            </View>
            <View style={{ gap: 10 }}>
              {list.map((b) => {
                const w = workoutFor(b.classId, new Date(b.date + "T12:00:00").getDay());
                return (
                  <Pane key={b.id} padding={0} style={{ overflow: "hidden" }}>
                    <Pressable onPress={() => router.push(`/booking/${b.id}`)} accessibilityRole="button" accessibilityLabel={`${className(b.classId)} ${w.focus}, ${to12(b.time)}`} style={{ flexDirection: "row", gap: 14, padding: 12 }}>
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
        <Pane onPress={() => router.push("/activities")} accessibilityLabel="Past activities, view all" style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
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
        {health ? (
          <Pane style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View style={{ flexDirection: "row" }}>
              {(["heart", "walk", "flash"] as const).map((ic, i) => (
                <View key={ic} style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: [colors.pink, colors.success, colors.gold][i], alignItems: "center", justifyContent: "center", marginLeft: i ? -8 : 0, borderWidth: 2, borderColor: colors.black }}>
                  <Ionicons name={ic} size={14} color="#fff" />
                </View>
              ))}
            </View>
            <View style={{ flex: 1 }}>
              <T>Track Your Health</T>
              <P size={11}>Calories, water, weight & activity</P>
            </View>
            <CultButton label="Connect" variant="dark" small full={false} onPress={() => router.push("/food")} />
            <Pressable onPress={() => setHealth(false)} accessibilityRole="button" accessibilityLabel="Dismiss" hitSlop={10}>
              <Ionicons name="close" size={18} color={colors.muted} />
            </Pressable>
          </Pane>
        ) : null}
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
          <Label style={{ marginTop: 4, color: colors.white }}>{dm(weekStart)} – {dm(weekEnd)}</Label>
        </View>
        <Pressable onPress={() => setOffset((o) => Math.min(0, o + 1))} disabled={offset >= 0} accessibilityRole="button" accessibilityLabel="Next week" hitSlop={10} style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center", opacity: offset >= 0 ? 0.3 : 1 }}>
          <Ionicons name="chevron-forward" size={22} color={colors.white} />
        </Pressable>
      </View>

      {/* ---------- Moments ---------- */}
      {memory ? (
        <View style={{ marginTop: GAP }}>
          <SectionHead title="Moments" onMore={() => router.push("/activities/memories")} />
          <View style={{ paddingHorizontal: 16 }}>
            <Pane padding={16}>
              <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
                <View>
                  <P style={{ color: colors.white }}>• {dm(memory.date)} • {to12(memory.time).replace(":00", "").replace(/^0/, "")}</P>
                  <T style={{ marginTop: 2 }}>{className(memory.classId)}</T>
                </View>
                <Ionicons name="camera-outline" size={20} color={colors.white} />
              </View>
              <PressScale onPress={() => router.push({ pathname: "/activities/memory", params: { id: memory.id } })} scale={0.98} accessibilityRole="button" accessibilityLabel="Open memory" style={{ alignItems: "center", marginTop: 16 }}>
                <View style={{ width: SCREEN_W - 96, height: 200, backgroundColor: "#fff", padding: 6, transform: [{ rotate: "-2deg" }] }}>
                  <Image source={photo(memory.photo)} style={{ width: "100%", height: "100%" }} resizeMode="cover" accessibilityIgnoresInvertColors />
                  {[-6, 1].map((r, i) => (
                    <View key={i} style={{ position: "absolute", [i ? "right" : "left"]: -14, [i ? "bottom" : "top"]: -8, width: 46, height: 14, backgroundColor: "rgba(255,225,200,0.85)", transform: [{ rotate: `${i ? -40 : 40 + r}deg` }] }} />
                  ))}
                </View>
              </PressScale>
              <CultButton label="Share" variant="dark" onPress={() => shareText(`${className(memory.classId)} at ${brand.name} • ${dm(memory.date)} #WEAREF7`)} style={{ marginTop: 18 }} />
            </Pane>
          </View>
        </View>
      ) : null}

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
            <Pressable key={id} onPress={() => router.push(`/class/${id}`)} accessibilityRole="button" accessibilityLabel={`${className(id)} ${n}`} style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingLeft: 10, paddingRight: 4, paddingVertical: 4, borderRadius: 999, backgroundColor: colors.surface2 }}>
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
          <View style={{ marginTop: 22 }}>
            <P>You've been regular for</P>
            <Text style={{ color: colors.white, fontSize: 18, fontWeight: "900", marginTop: 2 }}>
              {weeksActive} WEEK{weeksActive === 1 ? "" : "S"} <Text style={{ color: colors.muted, fontSize: 12, fontWeight: "400" }}>in a row</Text>
            </Text>
          </View>
        </Pane>
      </View>
    </ScrollView>
  );
}

function Counter({ value, label, onPress }: { value: number; label: string; onPress: () => void }) {
  const colors = useColors();
  return (
    <Pane onPress={onPress} accessibilityLabel={`${value} ${label}`} style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "rgba(255,255,255,0.12)" }}>
      <Ionicons name="flash" size={18} color={colors.gold} />
      <View>
        <Text style={{ color: "#fff", fontSize: 20, fontWeight: "900" }}>{value}</Text>
        <P size={11} style={{ color: "rgba(255,255,255,0.8)" }}>{label}</P>
      </View>
    </Pane>
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
      <Path d={arc(from, to)} stroke="rgba(255,255,255,0.18)" strokeWidth={8} strokeLinecap="round" fill="none" />
      {p > 0 ? <Path d={arc(from, fillTo)} stroke={colors.success} strokeWidth={8} strokeLinecap="round" fill="none" /> : null}
    </Svg>
  );
}
