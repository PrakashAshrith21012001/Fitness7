import { Image, Pressable, ScrollView, View, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MEAL_LABEL } from "@f7/content";
import { useTracker } from "@/state/tracker";
import { Btn, HMHeader, HT, hm } from "@/components/hm";
import { fmt, shortDate } from "@/lib/tracker-day";

/** Past snaps — every plate photo you tracked, newest first (thumbnails kept on this phone). */
export default function Snaps() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { state } = useTracker();
  const w = (width - 36) / 2;
  return (
    <View style={{ flex: 1, backgroundColor: hm.bg }}>
      <View style={{ backgroundColor: hm.card }}>
        <HMHeader title="Your Snaps" onBack={() => router.back()} />
      </View>
      {state.snaps.length ? (
        <ScrollView contentContainerStyle={{ flexDirection: "row", flexWrap: "wrap", gap: 12, padding: 12 }}>
          {state.snaps.map((s) => (
            <Pressable key={s.id} onPress={() => router.push(`/food/day?date=${s.date}` as never)} accessibilityRole="button" accessibilityLabel={`${MEAL_LABEL[s.meal]} on ${shortDate(s.date)}, ${s.kcal} calories`} style={{ width: w, backgroundColor: hm.card, borderRadius: 12, overflow: "hidden" }}>
              <Image source={{ uri: s.thumb }} style={{ width: w, height: w, backgroundColor: hm.chip }} />
              <View style={{ padding: 10 }}>
                <HT size={12} weight="600">{MEAL_LABEL[s.meal]} · {fmt(s.kcal)} Cal</HT>
                <HT size={11} color={hm.sub} numberOfLines={1}>{s.names.join(", ")}</HT>
                <HT size={10} color={hm.faint} style={{ marginTop: 2 }}>{shortDate(s.date)}</HT>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      ) : (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32 }}>
          <Ionicons name="camera-outline" size={48} color={hm.faint} />
          <HT size={16} weight="500" center style={{ marginTop: 12 }}>No snaps yet</HT>
          <HT size={13} color={hm.sub} center style={{ marginTop: 6 }}>Photograph your plate — we read the food and log it. Your snaps collect here.</HT>
          <Btn label="Snap a plate" icon="camera" onPress={() => router.push("/food/snap")} style={{ marginTop: 20, alignSelf: "stretch" }} />
        </View>
      )}
    </View>
  );
}
