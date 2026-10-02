import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MEAL_LABEL, isMealSlot, type MealSlot } from "@f7/content";
import { today } from "@/state/session";
import { useFood } from "@/state/food";
import { useTracker, type SavedMeal } from "@/state/tracker";
import { Btn, Card, Divider, HMHeader, HMSheet, HT, PlusBtn, hm } from "@/components/hm";
import { fmt } from "@/lib/tracker-day";

/** My Meals — meals you saved with "Save as Meal". One tap adds the whole meal. */
export default function MyMeals() {
  const router = useRouter();
  const params = useLocalSearchParams<{ meal?: string; date?: string }>();
  const { addItems, defaultSlot } = useFood();
  const { state, removeMeal } = useTracker();
  const slot: MealSlot = isMealSlot(params.meal) ? params.meal : defaultSlot();
  const date = params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date) ? params.date : today();
  const [open, setOpen] = useState<SavedMeal | null>(null);
  const [added, setAdded] = useState<string[]>([]);

  return (
    <View style={{ flex: 1, backgroundColor: hm.bg }}>
      <View style={{ backgroundColor: hm.card }}>
        <HMHeader title="My Meals" onBack={() => router.back()} />
      </View>
      {state.savedMeals.length ? (
        <ScrollView contentContainerStyle={{ padding: 12, gap: 10 }}>
          <HT size={12} color={hm.sub} style={{ marginBottom: 2 }}>Adds to {MEAL_LABEL[slot]}{date !== today() ? ` · ${date}` : ""}</HT>
          {state.savedMeals.map((m) => {
            const kcal = m.items.reduce((a, b) => a + b.kcal, 0);
            const done = added.includes(m.id);
            return (
              <Card key={m.id} padding={14} onPress={() => setOpen(m)} accessibilityLabel={`${m.name}, ${fmt(kcal)} calories. Details`}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={{ flex: 1 }}>
                    <HT size={15} weight="500">{m.name}</HT>
                    <HT size={12} color={hm.sub} numberOfLines={2}>{m.items.map((x) => x.name).join(", ")}</HT>
                    <HT size={11} color={hm.faint} style={{ marginTop: 4 }}>Saved from {MEAL_LABEL[m.slot]} · {m.items.length} item{m.items.length === 1 ? "" : "s"}</HT>
                  </View>
                  <HT size={13} weight="500" style={{ marginRight: 4 }}>{fmt(kcal)} Cal</HT>
                  {done ? <Ionicons name="checkmark-circle" size={26} color={hm.teal} style={{ margin: 5 }} /> : <PlusBtn label={`Add ${m.name} to ${MEAL_LABEL[slot]}`} onPress={async () => { await addItems(m.items, slot, date); setAdded((a) => [...a, m.id]); }} />}
                </View>
              </Card>
            );
          })}
        </ScrollView>
      ) : (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32 }}>
          <Ionicons name="bookmark-outline" size={46} color={hm.faint} />
          <HT size={16} weight="500" center style={{ marginTop: 12 }}>No saved meals yet</HT>
          <HT size={13} color={hm.sub} center style={{ marginTop: 6 }}>On the Diet page, tap “Save as Meal” under any meal you eat often. Next time it's one tap.</HT>
          <Btn label="Go to Diet" onPress={() => router.replace("/food/day")} style={{ marginTop: 20, alignSelf: "stretch" }} />
        </View>
      )}

      <HMSheet open={!!open} onClose={() => setOpen(null)} title={open?.name} scroll>
        {open?.items.map((x, i) => (
          <View key={i}>
            {i ? <Divider /> : null}
            <View style={{ flexDirection: "row", paddingVertical: 10 }}>
              <View style={{ flex: 1 }}>
                <HT size={14}>{x.name}</HT>
                <HT size={11} color={hm.sub}>{x.portionLabel}</HT>
              </View>
              <HT size={13} color={hm.ink2}>{fmt(x.kcal)} Cal</HT>
            </View>
          </View>
        ))}
        <Pressable onPress={async () => { if (open) await removeMeal(open.id); setOpen(null); }} accessibilityRole="button" accessibilityLabel="Delete this saved meal" style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 14 }}>
          <Ionicons name="trash-outline" size={18} color={hm.red} />
          <HT size={14} color={hm.red}>Delete saved meal</HT>
        </Pressable>
      </HMSheet>
    </View>
  );
}
