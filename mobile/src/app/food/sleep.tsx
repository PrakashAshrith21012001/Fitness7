import { useEffect, useState } from "react";
import { Pressable, ScrollView, Switch, View, useWindowDimensions } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Path } from "react-native-svg";
import { fmtClock, fmtDuration, hm as hmTime, last7, sleepMinutes, weeklySleepDeficit } from "@f7/content";
import { useSession, today } from "@/state/session";
import { useTracker } from "@/state/tracker";
import { useBookings } from "@/state/bookings";
import { Btn, HMSheet, HT, WeekBars, hm, tap } from "@/components/hm";
import { DateSheet } from "@/components/TrackerKit";
import { dayLabelLong, weekdayLetter } from "@/lib/tracker-day";

const TIPS = [
  "Increase your water intake throughout the day. Dehydration, which is the leading cause of daytime fatigue, can also disrupt your sleep patterns.",
  "Finish your last heavy meal 2–3 hours before bed. A late biryani keeps your gut busy when your body wants to repair muscle.",
  "Keep the phone away for the last 30 minutes. Dim light tells your brain it's night.",
  "Train hard, but not right before bed — evening sessions should end at least 2 hours before sleep.",
  "Same bed time on weekends too. A steady rhythm makes waking up for the 6 am batch easy.",
];

/**
 * Sleep Tracker — navy, like the reference: the welcome screen once, then
 * "0h of 8h", the "Did you sleep at 11:30 PM?" check-in (Yes / Edit),
 * My Sleep, bed-time and wake-up reminders, the 7-day analysis, the weekly
 * deficit and a tip.
 */
export default function SleepTracker() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{ date?: string }>();
  const date = params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date) ? params.date : today();
  const { member } = useSession();
  const { health } = useBookings();
  const { state, patch, logSleep, removeSleep } = useTracker();
  const [dateOpen, setDateOpen] = useState(false);
  const [edit, setEdit] = useState<null | "log" | "bedRemind" | "wakeRemind">(null);
  const [goalOpen, setGoalOpen] = useState(false);
  const log = state.sleep[date];
  const mins = log?.mins ?? 0;
  const goal = state.sleepGoalH;
  const name = member?.name.split(" ")[0] ?? "there";
  const days = last7(date);
  const values = days.map((d) => (state.sleep[d]?.mins ?? 0) / 60);
  const deficit = weeklySleepDeficit(Object.fromEntries(Object.entries(state.sleep).map(([d, l]) => [d, l.mins])), date, goal);
  const tip = TIPS[new Date(date + "T12:00:00").getDate() % TIPS.length];

  if (!state.sleepWelcomed) {
    return (
      <View style={{ flex: 1, backgroundColor: "#141a3c" }}>
        <StatusBar style="light" />
        <Stars width={width} />
        <View style={{ flex: 1, alignItems: "center", paddingTop: insets.top + 90 }}>
          <HT size={34} weight="500" color="#fff" center style={{ lineHeight: 42 }}>Welcome to{"\n"}Sleep Tracker</HT>
          <Svg width={180} height={160} viewBox="0 0 180 160" style={{ marginTop: 40 }}>
            <Path d="M70 20 a50 50 0 1 0 50 70 a40 40 0 1 1 -50 -70z" fill="#f8e7b0" />
            <Path d="M110 75 h40 a12 12 0 0 0 -6 -22 a16 16 0 0 0 -30 4 a10 10 0 0 0 -4 18z" fill="#4a5694" />
            <Path d="M40 140 h60 a14 14 0 0 0 -8 -26 a20 20 0 0 0 -38 6 a12 12 0 0 0 -14 20z" fill="#4a5694" />
          </Svg>
        </View>
        <View style={{ paddingHorizontal: 40, paddingBottom: insets.bottom + 40 }}>
          <HT size={13} color="rgba(255,255,255,0.7)" center style={{ marginBottom: 16 }}>Recovery is where muscle is built. Log your sleep every morning in one tap.</HT>
          <Btn label="Get Started" tone="white" onPress={() => patch({ sleepWelcomed: true })} />
          <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Not now" style={{ alignItems: "center", paddingVertical: 14 }}>
            <HT size={13} color="rgba(255,255,255,0.7)">Not now</HT>
          </Pressable>
        </View>
      </View>
    );
  }

  const section = (title: string, right?: React.ReactNode) => (
    <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 18, paddingBottom: 12 }}>
      <HT size={15} weight="500" color="#fff" style={{ flex: 1 }}>{title}</HT>
      {right}
    </View>
  );
  const band = <View style={{ height: 8, backgroundColor: "#121735" }} />;

  return (
    <View style={{ flex: 1, backgroundColor: hm.navy }}>
      <StatusBar style="light" />
      <View style={{ paddingTop: insets.top + 6, paddingHorizontal: 8, flexDirection: "row", alignItems: "center" }}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back" hitSlop={10} style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </Pressable>
        <Pressable onPress={() => setDateOpen(true)} accessibilityRole="button" accessibilityLabel={`${dayLabelLong(date)}. Change day`} style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4 }}>
          <HT size={15} weight="500" color="#fff">{dayLabelLong(date)}</HT>
          <Ionicons name="caret-down" size={12} color="#fff" />
        </Pressable>
        <Pressable onPress={() => setGoalOpen(true)} accessibilityRole="button" accessibilityLabel="Sleep goal" hitSlop={10} style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="star" size={20} color="#fff" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 14 }}>
          <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
            <HT size={24} weight="500" color="#fff" style={{ flex: 1 }}>{fmtDuration(mins)}<HT size={13} color="rgba(255,255,255,0.65)"> of {goal}h</HT></HT>
            <Pressable onPress={() => setGoalOpen(true)} accessibilityRole="button" accessibilityLabel="Edit sleep goal" hitSlop={8}>
              <Ionicons name="pencil" size={18} color={hm.sleepBlue} />
            </Pressable>
          </View>
          <View style={{ height: 4, borderRadius: 2, backgroundColor: "#323b70", marginTop: 10, overflow: "hidden" }}>
            <View style={{ width: `${Math.min(100, (mins / 60 / goal) * 100)}%`, height: 4, backgroundColor: mins / 60 >= goal ? "#5ad18f" : hm.sleepBlue }} />
          </View>
        </View>

        {!log ? (
          <View style={{ marginHorizontal: 12, backgroundColor: hm.navy2, borderRadius: 12, padding: 16 }}>
            <HT size={17} weight="500" color="#fff" center>Hi {name}!</HT>
            <HT size={14} color="rgba(255,255,255,0.75)" center style={{ marginTop: 16 }}>Did you sleep at <HT size={14} weight="600" color="#fff">{fmtClock(state.bed)}</HT>?</HT>
            <HT size={14} color="rgba(255,255,255,0.75)" center style={{ marginTop: 8 }}>Did you wake up at <HT size={14} weight="600" color="#fff">{fmtClock(state.wake)}</HT>?</HT>
            <View style={{ flexDirection: "row", marginTop: 18 }}>
              <Pressable onPress={() => { tap(); setEdit("log"); }} accessibilityRole="button" accessibilityLabel="Edit sleep times" style={{ flex: 1, alignItems: "center", paddingVertical: 8 }}>
                <HT size={13} weight="600" color="#fff">EDIT</HT>
              </Pressable>
              <Pressable onPress={() => { tap(); void logSleep(state.bed, state.wake, "confirm", date); }} accessibilityRole="button" accessibilityLabel={`Yes, slept ${fmtClock(state.bed)} to ${fmtClock(state.wake)}`} style={{ flex: 1, alignItems: "center", paddingVertical: 8 }}>
                <HT size={13} weight="600" color={hm.sleepBlue}>YES</HT>
              </Pressable>
            </View>
          </View>
        ) : null}

        {health.apple || health.fitbit ? (
          <>
            {section("You are connected to")}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 16 }}>
              <View style={{ width: 26, height: 26, borderRadius: 6, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="heart" size={16} color="#ff2d55" />
              </View>
              <View style={{ flex: 1 }}>
                <HT size={13} color="#fff">{health.apple ? "Apple Health / Health Connect" : "Fitbit"}</HT>
                <HT size={11} color="rgba(255,255,255,0.55)">Automatic sleep sync is coming — log manually meanwhile</HT>
              </View>
            </View>
          </>
        ) : null}
        {band}

        {section(
          "My Sleep",
          <Pressable onPress={() => { tap(); setEdit("log"); }} accessibilityRole="button" accessibilityLabel="Add sleep log" hitSlop={8} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <HT size={13} weight="500" color={hm.sleepBlue}>{log ? "Edit Log" : "Add Logs"}</HT>
            <Ionicons name="add-circle" size={20} color={hm.sleepBlue} />
          </Pressable>,
        )}
        {log ? (
          <View style={{ marginHorizontal: 16, marginBottom: 16, flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: hm.navy2, borderRadius: 12, padding: 14 }}>
            <Ionicons name="bed" size={26} color={hm.sleepBlue} />
            <View style={{ flex: 1 }}>
              <HT size={18} weight="500" color="#fff">{fmtDuration(log.mins)}</HT>
              <HT size={12} color="rgba(255,255,255,0.65)">{fmtClock(log.bed)} → {fmtClock(log.wake)}</HT>
            </View>
            <Pressable onPress={() => removeSleep(date)} accessibilityRole="button" accessibilityLabel="Delete sleep log" hitSlop={10}>
              <Ionicons name="trash-outline" size={18} color="rgba(255,255,255,0.6)" />
            </Pressable>
          </View>
        ) : (
          <View style={{ alignItems: "center", paddingBottom: 22 }}>
            <SleepyClock />
            <HT size={14} color="rgba(255,255,255,0.75)" style={{ marginTop: 12 }}>No sleep tracked yet!</HT>
          </View>
        )}
        {band}

        {section("Reminders")}
        {([["Bed time", state.bed, state.remindBed, "remindBed", "bedRemind"], ["Track Sleep", state.wake, state.remindWake, "remindWake", "wakeRemind"]] as const).map(([l, t, on, key, ed]) => (
          <View key={l} style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, minHeight: 50 }}>
            <HT size={13} color="#fff" style={{ flex: 1 }}>{l}</HT>
            <Pressable onPress={() => setEdit(ed)} accessibilityRole="button" accessibilityLabel={`${l} at ${fmtClock(t)}. Change`} hitSlop={6} style={{ marginRight: 10 }}>
              <HT size={12} color="rgba(255,255,255,0.75)">{fmtClock(t)}</HT>
            </Pressable>
            <Switch value={on} onValueChange={(v) => patch({ [key]: v } as never)} accessibilityLabel={`${l} reminder`} trackColor={{ true: hm.sleepBlue, false: "#3a4378" }} thumbColor="#fff" />
          </View>
        ))}
        <View style={{ height: 12 }} />
        {band}

        {section("Sleep Analysis", <HT size={11} color={hm.sleepBlue}>Last 7 days</HT>)}
        <View style={{ paddingHorizontal: 16 }}>
          <WeekBars width={width - 32} height={180} values={values} labels={days.map(weekdayLetter)} goal={goal} goalLabel={`Goal: ${goal}h`} color={hm.sleepBlue} ink="rgba(255,255,255,0.6)" valueLabel={(v) => `${Math.round(v * 10) / 10}`} />
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6, marginBottom: 14 }}>
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: "#ff4f8b" }} />
            <HT size={11} color="rgba(255,255,255,0.75)">{values.some((v) => v >= goal) ? `Met your goal on ${values.filter((v) => v >= goal).length} of 7 nights` : "Not meeting your goal"}</HT>
          </View>
        </View>
        {band}

        {section("Weekly Sleep Deficit", <HT size={15} weight="500" color={deficit ? "#ff8aa8" : "#5ad18f"}>{deficit ? `${deficit}h` : "—"}</HT>)}
        <HT size={11} color="rgba(255,255,255,0.55)" style={{ paddingHorizontal: 16, marginTop: -6, paddingBottom: 16 }}>Your Sleep Goal ({goal}h) · counted on the nights you logged</HT>
        {band}

        {section("Tips To Sleep Better")}
        <HT size={13} color="rgba(255,255,255,0.75)" style={{ paddingHorizontal: 16, lineHeight: 20 }}>💧 {tip}</HT>
      </ScrollView>

      <DateSheet open={dateOpen} onClose={() => setDateOpen(false)} value={date} onPick={(d) => router.setParams({ date: d === today() ? "" : d })} />
      <TimesSheet
        open={edit !== null}
        mode={edit}
        bed={log?.bed ?? state.bed}
        wake={log?.wake ?? state.wake}
        onClose={() => setEdit(null)}
        onSave={async (bed, wake) => {
          if (edit === "log") await logSleep(bed, wake, "manual", date);
          else await patch({ bed, wake });
          setEdit(null);
        }}
      />
      <HMSheet open={goalOpen} onClose={() => setGoalOpen(false)} title="Sleep goal" dark>
        <HT size={13} color="rgba(255,255,255,0.7)">Most people who train need 7–9 hours.</HT>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
          {[6, 6.5, 7, 7.5, 8, 8.5, 9].map((h) => (
            <Pressable key={h} onPress={() => { void patch({ sleepGoalH: h }); setGoalOpen(false); }} accessibilityRole="radio" accessibilityState={{ checked: h === goal }} aria-checked={h === goal} accessibilityLabel={`${h} hours`} style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: h === goal ? hm.sleepBlue : "#2e3768" }}>
              <HT size={14} weight="600" color="#fff">{h}h</HT>
            </Pressable>
          ))}
        </View>
      </HMSheet>
    </View>
  );
}

function TimesSheet({ open, mode, bed, wake, onClose, onSave }: { open: boolean; mode: null | "log" | "bedRemind" | "wakeRemind"; bed: string; wake: string; onClose: () => void; onSave: (bed: string, wake: string) => void }) {
  const [b, setB] = useState(bed);
  const [w, setW] = useState(wake);
  useEffect(() => {
    if (open) {
      setB(bed);
      setW(wake);
    }
  }, [open, bed, wake]);
  const showBed = mode !== "wakeRemind";
  const showWake = mode !== "bedRemind";
  return (
    <HMSheet open={open} onClose={onClose} title={mode === "log" ? "When did you sleep?" : mode === "bedRemind" ? "Bed time reminder" : "Wake-up reminder"} dark scroll>
      {showBed ? <TimeRow label={mode === "log" ? "Slept at" : "Bed time"} value={b} onChange={setB} /> : null}
      {showWake ? <TimeRow label={mode === "log" ? "Woke up at" : "Wake up"} value={w} onChange={setW} /> : null}
      {mode === "log" ? <HT size={13} color="rgba(255,255,255,0.75)" style={{ marginTop: 12 }}>That's {fmtDuration(sleepMinutes(b, w))} of sleep.</HT> : null}
      <Btn label="Save" tone="white" style={{ marginTop: 16 }} onPress={() => onSave(b, w)} />
    </HMSheet>
  );
}

function TimeRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const mins = hmTime(value);
  const h24 = Math.floor(mins / 60);
  const m = mins % 60;
  const pm = h24 >= 12;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const set = (h: number, mm: number, isPm: boolean) => {
    const hh = (h % 12) + (isPm ? 12 : 0);
    onChange(`${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`);
  };
  const pill = (text: string, on: boolean, onPress: () => void, a11y: string) => (
    <Pressable key={a11y} onPress={() => { tap(); onPress(); }} accessibilityRole="radio" accessibilityState={{ checked: on }} aria-checked={on} accessibilityLabel={a11y} style={{ minWidth: 40, paddingHorizontal: 8, paddingVertical: 8, borderRadius: 8, backgroundColor: on ? hm.sleepBlue : "#2e3768", alignItems: "center" }}>
      <HT size={13} weight="600" color="#fff">{text}</HT>
    </Pressable>
  );
  return (
    <View style={{ marginTop: 10 }}>
      <HT size={13} color="rgba(255,255,255,0.7)">{label} · <HT size={13} weight="600" color="#fff">{fmtClock(value)}</HT></HT>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
        {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => pill(String(h), h === h12, () => set(h, m, pm), `${label} hour ${h}`))}
      </View>
      <View style={{ flexDirection: "row", gap: 6, marginTop: 6 }}>
        {[0, 15, 30, 45].map((mm) => pill(`:${String(mm).padStart(2, "0")}`, mm === m, () => set(h12, mm, pm), `${label} minute ${mm}`))}
        <View style={{ width: 10 }} />
        {pill("AM", !pm, () => set(h12, m, false), `${label} AM`)}
        {pill("PM", pm, () => set(h12, m, true), `${label} PM`)}
      </View>
    </View>
  );
}

function Stars({ width }: { width: number }) {
  const pts = Array.from({ length: 40 }, (_, i) => ({ x: (i * 97) % width, y: (i * 173) % 800, r: (i % 3) + 1 }));
  return (
    <Svg width={width} height={800} style={{ position: "absolute" }} pointerEvents="none">
      {pts.map((p, i) => (
        <Circle key={i} cx={p.x} cy={p.y} r={p.r * 0.8} fill="#ffffff" opacity={0.25 + (i % 4) * 0.12} />
      ))}
    </Svg>
  );
}

function SleepyClock() {
  return (
    <Svg width={92} height={92} viewBox="0 0 100 100">
      <Path d="M20 22 l12 10 M80 22 l-12 10" stroke="#9aa3d6" strokeWidth={8} strokeLinecap="round" />
      <Circle cx={50} cy={56} r={32} fill="#7c86c4" />
      <Circle cx={50} cy={56} r={24} fill="#b8bfe8" />
      <Path d="M50 40 v16 h12" stroke="#2b3366" strokeWidth={4} strokeLinecap="round" fill="none" />
      <Path d="M76 18 h10 l-10 10 h10" stroke="#c9cff2" strokeWidth={3} fill="none" />
    </Svg>
  );
}
