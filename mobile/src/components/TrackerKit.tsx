import { useState } from "react";
import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TRACKER_MEALS, addDays, type MealSlot } from "@f7/content";
import { today } from "@/state/session";
import { HMSheet, HT, PlusBtn, hm, tap, Divider } from "@/components/hm";
import { dayLabel, fmt, type TrackerDay } from "@/lib/tracker-day";

/**
 * Bits every tracker page shares: the bottom bar (Home · Diet · + · Coach ·
 * Insights), the "Select a Meal" sheet behind every +, and the date sheet
 * behind "Today ⌄".
 */

export type TrackerTab = "home" | "diet" | "coach" | "insights";

export function TrackerTabBar({ active, onPlus, date }: { active: TrackerTab; onPlus: () => void; date?: string }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const q = date && date !== today() ? `?date=${date}` : "";
  const item = (id: TrackerTab, label: string, icon: keyof typeof Ionicons.glyphMap, go: () => void) => {
    const on = id === active;
    return (
      <Pressable key={id} onPress={() => { if (!on) { tap(); go(); } }} accessibilityRole="tab" accessibilityState={{ selected: on }} aria-selected={on} accessibilityLabel={label} style={{ flex: 1, alignItems: "center", paddingTop: 8, minHeight: 50 }}>
        <Ionicons name={icon} size={22} color={on ? hm.teal : "#8e8e93"} />
        <HT size={10} weight={on ? "600" : "400"} color={on ? hm.teal : "#8e8e93"} style={{ marginTop: 2 }}>{label}</HT>
      </Pressable>
    );
  };
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start", backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: hm.line, paddingBottom: Math.max(insets.bottom, 6) }}>
      {item("home", "Home", active === "home" ? "home" : "home-outline", () => router.replace(`/food${q}` as never))}
      {item("diet", "Diet", "restaurant-outline", () => router.replace(`/food/day${q}` as never))}
      <View style={{ flex: 1, alignItems: "center", paddingTop: 6 }}>
        <Pressable onPress={() => { tap(); onPlus(); }} accessibilityRole="button" accessibilityLabel="Track a meal" style={({ pressed }) => [{ width: 44, height: 44, borderRadius: 22, backgroundColor: hm.teal, alignItems: "center", justifyContent: "center", borderWidth: 4, borderColor: "#e6f0ed" }, pressed && { opacity: 0.85 }]}>
          <Ionicons name="add" size={24} color="#fff" />
        </Pressable>
      </View>
      {item("coach", "Coach", "people-outline", () => router.push("/chat"))}
      {item("insights", "Insights", "trophy-outline", () => router.push(`/food/insights${q}` as never))}
    </View>
  );
}

/** "Select a Meal You Would Like to Track" — five meals with 0/375 Cal and an orange +. */
export function MealPickerSheet({ open, onClose, day, onPick }: { open: boolean; onClose: () => void; day: TrackerDay; onPick: (slot: MealSlot) => void }) {
  return (
    <HMSheet open={open} onClose={onClose} title="Select a Meal You Would Like to Track">
      {TRACKER_MEALS.map((m, i) => (
        <View key={m.id}>
          {i ? <Divider /> : null}
          <Pressable onPress={() => { onClose(); onPick(m.id); }} accessibilityRole="button" accessibilityLabel={`Track ${m.label}, ${fmt(day.mealTotals[m.id].kcal)} of ${fmt(day.mealBudgets[m.id])} calories`} style={{ flexDirection: "row", alignItems: "center", minHeight: 54 }}>
            <HT size={15} style={{ flex: 1 }}>{m.label}</HT>
            <HT size={12} color={hm.sub}>{fmt(day.mealTotals[m.id].kcal)}/{fmt(day.mealBudgets[m.id])} Cal</HT>
            <PlusBtn label={`Add to ${m.label}`} filled onPress={() => { onClose(); onPick(m.id); }} />
          </Pressable>
        </View>
      ))}
    </HMSheet>
  );
}

/** "Today ⌄" → the last two weeks, newest first. */
export function DateSheet({ open, onClose, value, onPick }: { open: boolean; onClose: () => void; value: string; onPick: (date: string) => void }) {
  const t = today();
  const days = Array.from({ length: 14 }, (_, i) => addDays(t, -i));
  return (
    <HMSheet open={open} onClose={onClose} title="Choose a day" scroll maxHeight={0.7}>
      {days.map((d, i) => (
        <View key={d}>
          {i ? <Divider /> : null}
          <Pressable onPress={() => { onClose(); onPick(d); }} accessibilityRole="radio" accessibilityState={{ checked: d === value }} aria-checked={d === value} accessibilityLabel={dayLabel(d)} style={{ flexDirection: "row", alignItems: "center", minHeight: 50 }}>
            <HT size={15} weight={d === value ? "600" : "400"} style={{ flex: 1 }}>{dayLabel(d)}</HT>
            {d === value ? <Ionicons name="checkmark" size={20} color={hm.teal} /> : null}
          </Pressable>
        </View>
      ))}
    </HMSheet>
  );
}

/** The "Today ⌄" chip. */
export function DateChip({ date, onPress, dark }: { date: string; onPress: () => void; dark?: boolean }) {
  return (
    <Pressable onPress={() => { tap(); onPress(); }} accessibilityRole="button" accessibilityLabel={`Date: ${dayLabel(date)}. Change`} hitSlop={6} style={{ flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: dark ? "transparent" : "#fff", borderWidth: dark ? 0 : 1, borderColor: hm.line }}>
      <HT size={13} weight="500" color={dark ? "#fff" : hm.ink}>{dayLabel(date)}</HT>
      <Ionicons name="chevron-down" size={14} color={dark ? "#fff" : hm.ink} />
    </Pressable>
  );
}

/** Hook: meal sheet open state + push to the log screen. */
export function useMealPicker(date: string) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const q = date !== today() ? `&date=${date}` : "";
  return {
    open,
    show: () => setOpen(true),
    close: () => setOpen(false),
    go: (slot: MealSlot) => router.push(`/food/log?meal=${slot}${q}` as never),
  };
}
