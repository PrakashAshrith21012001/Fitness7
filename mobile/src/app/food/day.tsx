import { useState } from "react";
import { Alert, Platform, Pressable, ScrollView, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TRACKER_MEALS, MEAL_LABEL, macrosFor, mealIdeas, pct, type MealSlot } from "@f7/content";
import { today } from "@/state/session";
import { useFood, type DraftItem, type FoodEntry } from "@/state/food";
import { useTracker } from "@/state/tracker";
import { ArcRing, Btn, Card, Divider, HMSheet, HT, PlusBtn, Wash, hm, hmShadow, tap } from "@/components/hm";
import { DateChip, DateSheet, MealPickerSheet, TrackerTabBar, useMealPicker } from "@/components/TrackerKit";
import { fmt, useTrackerDay } from "@/lib/tracker-day";

function toDraft(e: FoodEntry): DraftItem {
  return { name: e.name, foodId: e.foodId, grams: e.grams, portionLabel: e.portionLabel ?? `${e.grams} g`, kcal: e.kcal, proteinG: e.proteinG, carbsG: e.carbsG, fatG: e.fatG, confidence: e.confidence, source: e.source, needsConfirm: false };
}

/**
 * Diet — the day by meal: the calorie arc, Insights / Recipes / Snap,
 * then Breakfast · Morning Snack · Lunch · Evening Snack · Dinner with
 * "352 of 375 Cal ⊕", each food with ⋮ (edit, move, delete) and Save as
 * Meal. Empty snacks show healthy suggestions you can add in one tap.
 */
export default function DietDay() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ date?: string }>();
  const date = params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date) ? params.date : today();
  const day = useTrackerDay(date);
  const { remove, replace, addItems } = useFood();
  const { saveMeal } = useTracker();
  const meal = useMealPicker(date);
  const [dateOpen, setDateOpen] = useState(false);
  const [menu, setMenu] = useState<FoodEntry | null>(null);
  const [moving, setMoving] = useState<FoodEntry | null>(null);
  const [saving, setSaving] = useState<MealSlot | null>(null);
  const [mealName, setMealName] = useState("");
  const [more, setMore] = useState(false);
  const [savedNote, setSavedNote] = useState<string | null>(null);
  const t = day.totals;
  const q = date !== today() ? `?date=${date}` : "";
  const dq = date !== today() ? `&date=${date}` : "";

  const del = (e: FoodEntry) => {
    const go = () => void remove(e.id);
    if (Platform.OS === "web") go();
    else Alert.alert("Delete this food?", `${e.name} will be removed from ${MEAL_LABEL[e.meal]}.`, [{ text: "Cancel", style: "cancel" }, { text: "Delete", style: "destructive", onPress: go }]);
  };

  const chip = (icon: keyof typeof Ionicons.glyphMap, label: string, go: () => void) => (
    <Pressable key={label} onPress={() => { tap(); go(); }} accessibilityRole="button" accessibilityLabel={label} style={({ pressed }) => [{ flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#fff", borderRadius: 12, paddingVertical: 10, paddingLeft: 10, paddingRight: 18 }, hmShadow, pressed && { opacity: 0.85 }]}>
      <View style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: "#1c1c1e", alignItems: "center", justifyContent: "center" }}>
        <Ionicons name={icon} size={16} color="#fff" />
      </View>
      <HT size={14} weight="500">{label}</HT>
    </Pressable>
  );

  return (
    <Wash>
      <View style={{ paddingTop: insets.top + 6, paddingHorizontal: 8, flexDirection: "row", alignItems: "center" }}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back" hitSlop={10} style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="chevron-back" size={24} color={hm.ink} />
        </Pressable>
        <View style={{ flex: 1, alignItems: "center" }}>
          <DateChip date={date} onPress={() => setDateOpen(true)} />
        </View>
        <Pressable onPress={() => router.push("/food/setup")} accessibilityRole="button" accessibilityLabel="Tracker settings" hitSlop={8} style={{ width: 40, height: 44, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="settings-sharp" size={20} color={hm.ink} />
        </Pressable>
        <Pressable onPress={() => setMore(true)} accessibilityRole="button" accessibilityLabel="More options" hitSlop={8} style={{ width: 40, height: 44, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="ellipsis-horizontal" size={20} color={hm.ink} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <Card style={{ marginHorizontal: 12, marginTop: 8 }} padding={14}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            <ArcRing size={52} stroke={3.5} progress={pct(t.kcal, day.targets.kcal)} over={t.kcal > day.targets.kcal * 1.1}>
              <Ionicons name="restaurant-outline" size={20} color={hm.orange} />
            </ArcRing>
            <View style={{ flex: 1 }}>
              <HT size={17} weight="500">{fmt(t.kcal)} of {fmt(day.targets.kcal)}</HT>
              <HT size={12} color={hm.sub}>Cal Eaten</HT>
            </View>
            <Pressable onPress={() => router.push(`/food/insights${q}` as never)} accessibilityRole="button" accessibilityLabel="Open insights" hitSlop={8} style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: hm.orangeSoft, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="stats-chart" size={16} color={hm.orange} />
            </Pressable>
          </View>
        </Card>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingHorizontal: 12, paddingVertical: 14 }}>
          {chip("stats-chart", "Insights", () => router.push(`/food/insights${q}` as never))}
          {chip("restaurant", "Recipes", () => router.push("/food/recipes"))}
          {chip("camera", "Snap", () => router.push(`/food/snap${q}` as never))}
          {chip("bookmark", "My Meals", () => router.push(`/food/meals${q}` as never))}
        </ScrollView>

        {TRACKER_MEALS.map((m) => {
          const list = day.byMeal[m.id];
          const mt = day.mealTotals[m.id];
          const budget = day.mealBudgets[m.id];
          const over = mt.kcal > budget * 1.1;
          const ideas = list.length ? [] : mealIdeas(m.id);
          return (
            <View key={m.id} style={{ marginBottom: 18 }}>
              <View style={{ flexDirection: "row", alignItems: "center", paddingLeft: 16, paddingRight: 8 }}>
                <HT size={16} weight="500" style={{ flex: 1 }}>{m.label}</HT>
                <HT size={12} color={over ? hm.red : hm.sub}>{fmt(mt.kcal)} of {fmt(budget)} Cal</HT>
                <PlusBtn label={`Add to ${m.label}`} filled onPress={() => meal.go(m.id)} />
              </View>
              {list.length ? (
                <Card style={{ marginHorizontal: 12, marginTop: 6 }} padding={0}>
                  {list.map((e, i) => (
                    <View key={e.id}>
                      {i ? <Divider style={{ marginLeft: 14 }} /> : null}
                      <Pressable onPress={() => { tap(); setMenu(e); }} accessibilityRole="button" accessibilityLabel={`${e.name}, ${e.portionLabel ?? ""}, ${e.kcal} calories. Options`} style={{ flexDirection: "row", alignItems: "center", paddingLeft: 14, paddingRight: 4, minHeight: 58 }}>
                        <View style={{ flex: 1 }}>
                          <HT size={14} numberOfLines={1}>{e.name}</HT>
                          <HT size={11} color={hm.sub}>{e.portionLabel ?? `${e.grams} g`}</HT>
                        </View>
                        <HT size={12} color={hm.sub}>{fmt(e.kcal)} Cal</HT>
                        <View style={{ width: 34, alignItems: "center" }}>
                          <Ionicons name="ellipsis-vertical" size={16} color={hm.ink} />
                        </View>
                      </Pressable>
                    </View>
                  ))}
                  <Divider />
                  <Pressable onPress={() => { tap(); setMealName(`My ${m.label} ${list[0].name.split(" ")[0]}`); setSaving(m.id); }} accessibilityRole="button" accessibilityLabel={`Save ${m.label} as a meal`} style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 14, minHeight: 50 }}>
                    <HT size={14} weight="500" style={{ flex: 1 }}>Save as Meal</HT>
                    <Ionicons name="chevron-forward" size={18} color={hm.ink} />
                  </Pressable>
                </Card>
              ) : (
                <View style={{ marginTop: 6 }}>
                  <HT size={12} color={hm.sub} style={{ marginHorizontal: 16, marginBottom: 8 }}>
                    {m.id === "morning_snack" || m.id === "snacks" ? "Hey, here are some Healthy Snack Suggestions for you" : `Nothing tracked for ${m.label} yet — here are a few ideas`}
                  </HT>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingHorizontal: 12, paddingBottom: 4 }}>
                    {ideas.map((idea) => (
                      <Card key={idea.title} padding={12} style={{ width: 210, borderLeftWidth: 3, borderLeftColor: hm.orange }}>
                        <HT size={13} weight="600" numberOfLines={1}>{idea.title}</HT>
                        <HT size={11} color={hm.sub} numberOfLines={2} style={{ marginTop: 2, minHeight: 30 }}>{idea.items.map((x) => `${x.food.name} (${x.label})`).join(", ")}</HT>
                        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
                          <HT size={12} weight="500" style={{ flex: 1 }}>{fmt(idea.kcal)} Cal · {Math.round(idea.proteinG)} g protein</HT>
                          <PlusBtn label={`Add ${idea.title} to ${m.label}`} onPress={() => addItems(idea.items.map((x) => ({ name: x.food.name, foodId: x.food.id, grams: x.grams, portionLabel: x.label, ...macrosFor(x.food, x.grams), confidence: 1, source: "table" as const, needsConfirm: false })), m.id, date)} />
                        </View>
                      </Card>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      <Pressable onPress={() => { tap(); router.push(`/food/snap${q}` as never); }} accessibilityRole="button" accessibilityLabel="Snap a plate" style={[{ position: "absolute", right: 16, bottom: insets.bottom + 76, flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#1c1c1e", borderRadius: 22, paddingHorizontal: 16, height: 44 }, hmShadow]}>
        <Ionicons name="camera" size={16} color="#fff" />
        <HT size={14} weight="600" color="#fff">Snap</HT>
      </Pressable>

      <TrackerTabBar active="diet" onPlus={meal.show} date={date} />
      <MealPickerSheet open={meal.open} onClose={meal.close} day={day} onPick={meal.go} />
      <DateSheet open={dateOpen} onClose={() => setDateOpen(false)} value={date} onPick={(d) => router.setParams({ date: d === today() ? "" : d })} />

      <HMSheet open={!!menu} onClose={() => setMenu(null)} title={menu?.name}>
        {menu ? (
          <>
            <HT size={12} color={hm.sub} style={{ marginTop: -6, marginBottom: 8 }}>{menu.portionLabel} · {fmt(menu.kcal)} Cal · P {Math.round(menu.proteinG)} g · C {Math.round(menu.carbsG)} g · F {Math.round(menu.fatG)} g</HT>
            {menu.foodId ? (
              <MenuRow icon="create-outline" label="Edit quantity" onPress={() => { const e = menu; setMenu(null); router.push(`/food/item?entry=${e.id}` as never); }} />
            ) : null}
            <MenuRow icon="swap-horizontal-outline" label="Move to another meal" onPress={() => { setMoving(menu); setMenu(null); }} />
            <MenuRow icon="copy-outline" label="Add again" onPress={() => { const e = menu; setMenu(null); void addItems([toDraft(e)], e.meal, date); }} />
            <MenuRow icon="trash-outline" label="Delete" danger onPress={() => { const e = menu; setMenu(null); del(e); }} />
          </>
        ) : null}
      </HMSheet>

      <HMSheet open={!!moving} onClose={() => setMoving(null)} title="Move to">
        {TRACKER_MEALS.filter((m) => m.id !== moving?.meal).map((m) => (
          <MenuRow key={m.id} icon="arrow-forward-outline" label={m.label} onPress={() => { const e = moving!; setMoving(null); void replace(e.id, toDraft(e), m.id); }} />
        ))}
      </HMSheet>

      <HMSheet open={!!saving} onClose={() => setSaving(null)} title="Save as Meal">
        <HT size={13} color={hm.sub}>Save these {saving ? day.byMeal[saving].length : 0} foods as one meal. Next time it's one tap under My Meals.</HT>
        <TextInput value={mealName} onChangeText={setMealName} maxLength={60} placeholder="Meal name" placeholderTextColor={hm.faint} accessibilityLabel="Meal name" style={{ borderWidth: 1, borderColor: "#d6d8dd", borderRadius: 8, paddingHorizontal: 12, height: 46, fontSize: 15, color: hm.ink, marginTop: 12 }} />
        <Btn
          label="Save"
          disabled={!mealName.trim()}
          style={{ marginTop: 14 }}
          onPress={async () => {
            if (!saving) return;
            const saved = await saveMeal(mealName, saving, day.byMeal[saving].map(toDraft));
            setSaving(null);
            if (saved) {
              setSavedNote(`Saved “${saved.name}” to My Meals`);
              setTimeout(() => setSavedNote(null), 2500);
            }
          }}
        />
      </HMSheet>

      <HMSheet open={more} onClose={() => setMore(false)} title="More">
        <MenuRow icon="analytics-outline" label="Today's insights" onPress={() => { setMore(false); router.push(`/food/insights${q}` as never); }} />
        <MenuRow icon="bookmark-outline" label="My meals" onPress={() => { setMore(false); router.push(`/food/meals${q}` as never); }} />
        <MenuRow icon="book-outline" label="Healthy recipes" onPress={() => { setMore(false); router.push("/food/recipes"); }} />
        <MenuRow icon="create-outline" label="Describe a meal in words" onPress={() => { setMore(false); router.push(`/food/add${dq ? `?${dq.slice(1)}` : ""}` as never); }} />
        <MenuRow icon="settings-outline" label="Tracker setup" onPress={() => { setMore(false); router.push("/food/setup"); }} />
      </HMSheet>

      {savedNote ? (
        <View pointerEvents="none" style={{ position: "absolute", left: 16, right: 16, bottom: insets.bottom + 130, backgroundColor: "#1c1c1e", borderRadius: 10, padding: 12 }}>
          <HT size={13} color="#fff" center>{savedNote}</HT>
        </View>
      ) : null}
    </Wash>
  );
}

function MenuRow({ icon, label, onPress, danger }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void; danger?: boolean }) {
  return (
    <Pressable onPress={() => { tap(); onPress(); }} accessibilityRole="button" accessibilityLabel={label} style={({ pressed }) => [{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 50 }, pressed && { opacity: 0.7 }]}>
      <Ionicons name={icon} size={20} color={danger ? hm.red : hm.ink} />
      <HT size={15} color={danger ? hm.red : hm.ink} style={{ flex: 1 }}>{label}</HT>
    </Pressable>
  );
}
