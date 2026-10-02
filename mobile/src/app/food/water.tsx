import { useState } from "react";
import { Pressable, ScrollView, View, useWindowDimensions } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { last7 } from "@f7/content";
import { useSession, today } from "@/state/session";
import { useDay } from "@/state/day";
import { Card, HMHeader, HMSheet, HT, WeekBars, hm, tap } from "@/components/hm";
import { dayLabel, weekdayLetter } from "@/lib/tracker-day";

/** Water — tap a glass to fill up to it, ± a glass, the goal, and the last 7 days. */
export default function Water() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{ date?: string }>();
  const date = params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date) ? params.date : today();
  const { update } = useSession();
  const { waterMl, waterGoal, glassMl, setWater, addGlass, removeGlass } = useDay();
  const [goalOpen, setGoalOpen] = useState(false);
  const glasses = Math.round(waterMl(date) / glassMl);
  const goal = Math.max(1, Math.round(waterGoal(date) / glassMl));
  const slots = Math.max(goal, glasses + 1);
  const size = Math.min(64, (width - 64) / 5);

  return (
    <View style={{ flex: 1, backgroundColor: hm.bg }}>
      <View style={{ backgroundColor: hm.card }}>
        <HMHeader title={`Water · ${dayLabel(date)}`} onBack={() => router.back()} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 40 }}>
        <Card>
          <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
            <View style={{ flex: 1 }}>
              <HT size={30} weight="500">{glasses}<HT size={14} color={hm.sub}> of {goal} glasses</HT></HT>
              <HT size={12} color={hm.sub}>{(glasses * glassMl) / 1000} L · {glassMl} ml a glass</HT>
            </View>
            <Pressable onPress={() => setGoalOpen(true)} accessibilityRole="button" accessibilityLabel={`Goal ${goal} glasses. Change`} hitSlop={8}>
              <HT size={13} weight="500" color={hm.teal}>Edit goal</HT>
            </Pressable>
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 18 }}>
            {Array.from({ length: slots }, (_, i) => {
              const full = i < glasses;
              return (
                <Pressable key={i} onPress={() => { tap(); void setWater((full && i === glasses - 1 ? i : i + 1) * glassMl, date); }} accessibilityRole="button" accessibilityLabel={full ? `Glass ${i + 1}, filled` : `Fill to glass ${i + 1}`} style={{ width: size, height: size * 1.15, borderRadius: 10, borderWidth: 1.5, borderColor: full ? hm.blue : "#d5dbe5", backgroundColor: full ? "#e6f2ff" : "#fff", alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name={full ? "water" : "water-outline"} size={size * 0.42} color={full ? hm.blue : "#b8c2d3"} />
                </Pressable>
              );
            })}
          </View>
          <View style={{ flexDirection: "row", gap: 12, marginTop: 20 }}>
            <Pressable onPress={() => { tap(); void removeGlass(date); }} disabled={!glasses} accessibilityRole="button" accessibilityLabel="Remove a glass" style={{ flex: 1, height: 48, borderRadius: 10, borderWidth: 1, borderColor: hm.line, alignItems: "center", justifyContent: "center", opacity: glasses ? 1 : 0.4 }}>
              <Ionicons name="remove" size={22} color={hm.ink} />
            </Pressable>
            <Pressable onPress={() => { tap(); void addGlass(date); }} accessibilityRole="button" accessibilityLabel="Add a glass" style={{ flex: 2, height: 48, borderRadius: 10, backgroundColor: hm.blue, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 6 }}>
              <Ionicons name="add" size={22} color="#fff" />
              <HT size={15} weight="600" color="#fff">Add a glass</HT>
            </Pressable>
          </View>
        </Card>

        <Card style={{ marginTop: 12 }}>
          <HT size={14} weight="500">Last 7 days</HT>
          <View style={{ marginTop: 12 }}>
            <WeekBars width={width - 56} values={last7(date).map((d) => Math.round(waterMl(d) / glassMl))} labels={last7(date).map(weekdayLetter)} goal={goal} goalLabel={`Goal: ${goal}`} color={hm.blue} />
          </View>
        </Card>
        <HT size={11} color={hm.sub} style={{ marginTop: 12, paddingHorizontal: 4 }}>The goal grows with your weight and the minutes you train that day. Set your own to override it.</HT>
      </ScrollView>

      <HMSheet open={goalOpen} onClose={() => setGoalOpen(false)} title="Daily water goal">
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {[6, 7, 8, 9, 10, 11, 12, 14, 16].map((g) => (
            <Pressable key={g} onPress={() => { void update({ waterGoalMl: g * glassMl }); setGoalOpen(false); }} accessibilityRole="radio" accessibilityState={{ checked: g === goal }} aria-checked={g === goal} accessibilityLabel={`${g} glasses`} style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: g === goal ? hm.blue : hm.chip }}>
              <HT size={14} weight="600" color={g === goal ? "#fff" : hm.ink}>{g}</HT>
            </Pressable>
          ))}
        </View>
        <Pressable onPress={() => { void update({ waterGoalMl: undefined }); setGoalOpen(false); }} accessibilityRole="button" accessibilityLabel="Use the automatic goal" style={{ marginTop: 14, paddingVertical: 8 }}>
          <HT size={13} weight="500" color={hm.teal}>Use the automatic goal</HT>
        </Pressable>
      </HMSheet>
    </View>
  );
}
