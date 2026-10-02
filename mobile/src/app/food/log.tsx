import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { FOOD_BY_ID, MEAL_LABEL, USUAL_BY_SLOT, alsoHad, isMealSlot, type Food, type MealSlot } from "@f7/content";
import { today } from "@/state/session";
import { useFood } from "@/state/food";
import { useTracker, type SavedMeal } from "@/state/tracker";
import { AddedBar, Btn, Divider, Footer, HT, PlusBtn, hm, tap } from "@/components/hm";
import { draftFromFood } from "@/lib/food-picks";
import { fmt } from "@/lib/tracker-day";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * "Track for Breakfast" — HealthifyMe's log screen: the search bar, Track
 * with Images, My Meals, then "Did you also have…" (after the first add)
 * and Frequently Tracked Foods, each with an orange +. Adds save straight
 * away; the green bar counts them with Undo, and the button finishes.
 */
export default function MealLog() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ meal?: string; date?: string }>();
  const { defaultSlot, entries, addItems, remove, history } = useFood();
  const { state } = useTracker();
  const slot: MealSlot = isMealSlot(params.meal) ? params.meal : defaultSlot();
  const date = params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date) ? params.date : today();
  const label = MEAL_LABEL[slot];
  const opened = useRef(new Date().toISOString()).current;
  const [lastBatch, setLastBatch] = useState<string[]>([]);

  const inMeal = entries.filter((e) => e.date === date && e.meal === slot);
  const addedHere = inMeal.filter((e) => e.loggedAt >= opened);
  const loggedIds = new Set(inMeal.map((e) => e.foodId).filter(Boolean) as string[]);

  const frequent = useMemo(() => {
    const mine = Object.entries(history)
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => id)
      .filter((id) => FOOD_BY_ID[id]);
    const out: string[] = [];
    for (const id of [...mine, ...USUAL_BY_SLOT[slot]]) if (!out.includes(id)) out.push(id);
    return out.slice(0, 12).map((id) => FOOD_BY_ID[id]).filter(Boolean) as Food[];
  }, [history, slot]);

  const also = useMemo(() => (addedHere.length ? alsoHad(addedHere.map((e) => e.foodId).filter(Boolean) as string[], slot, [...loggedIds]).map((id) => FOOD_BY_ID[id]) : []), [addedHere, slot, loggedIds]);

  const myMeals = [...state.savedMeals].sort((a, b) => Number(b.slot === slot) - Number(a.slot === slot)).slice(0, 3);

  // Ids present before the latest add; the effect below turns the difference into the Undo batch.
  const before = useRef<Set<string> | null>(null);
  const add = async (items: Parameters<typeof addItems>[0]) => {
    before.current = new Set(entries.map((e) => e.id));
    await addItems(items, slot, date);
  };
  useEffect(() => {
    const prev = before.current;
    if (!prev) return;
    const created = entries.filter((e) => !prev.has(e.id)).map((e) => e.id);
    if (created.length) {
      before.current = null;
      setLastBatch(created);
    }
  }, [entries]);

  const undo = async () => {
    const ids = lastBatch;
    setLastBatch([]);
    for (const id of ids) await remove(id);
  };

  const addFood = (f: Food) => add([draftFromFood(f)]);
  const addMeal = (m: SavedMeal) => add(m.items);
  const openItem = (f: Food) => router.push(`/food/item?id=${f.id}&meal=${slot}${date !== today() ? `&date=${date}` : ""}` as never);

  const foodRow = (f: Food, i: number) => {
    const d = draftFromFood(f);
    const done = loggedIds.has(f.id);
    return (
      <View key={f.id}>
        {i ? <Divider style={{ marginLeft: 16 }} /> : null}
        <Pressable onPress={() => { tap(); openItem(f); }} accessibilityRole="button" accessibilityLabel={`${f.name}, ${d.portionLabel}, ${d.kcal} calories. Open`} style={({ pressed }) => [{ flexDirection: "row", alignItems: "center", paddingLeft: 16, paddingRight: 6, minHeight: 56 }, pressed && { backgroundColor: "#f7f8fa" }]}>
          <View style={{ flex: 1 }}>
            <HT size={14} weight="500" numberOfLines={1}>{f.name}</HT>
            <HT size={11} color={hm.sub}>{d.portionLabel}</HT>
          </View>
          <HT size={12} color={hm.sub}>{fmt(d.kcal)} Cal</HT>
          {done ? (
            <View style={{ width: 36, height: 36, alignItems: "center", justifyContent: "center" }} accessibilityLabel={`${f.name} added`}>
              <Ionicons name="checkmark" size={20} color={hm.teal} />
            </View>
          ) : (
            <PlusBtn label={`Add ${f.name} to ${label}`} color="#8e8e93" onPress={() => addFood(f)} />
          )}
        </Pressable>
      </View>
    );
  };

  const added = addedHere;
  const barText = added.length ? `${added[added.length - 1].name.length > 20 ? added[added.length - 1].name.slice(0, 18) + "…" : added[added.length - 1].name}${added.length > 1 ? ` + ${added.length - 1} more food${added.length > 2 ? "s" : ""}` : ""} added` : "";

  return (
    <View style={{ flex: 1, backgroundColor: hm.bg }}>
      <View style={{ paddingTop: insets.top + 6, paddingHorizontal: 8, paddingBottom: 10, backgroundColor: hm.card, flexDirection: "row", alignItems: "center", gap: 4 }}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back" hitSlop={10} style={{ width: 40, height: 44, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="chevron-back" size={24} color={hm.ink} />
        </Pressable>
        <Pressable onPress={() => { tap(); router.push(`/food/search?meal=${slot}${date !== today() ? `&date=${date}` : ""}` as never); }} accessibilityRole="search" accessibilityLabel="Search by food name or dish" style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8, height: 42, borderRadius: 10, borderWidth: 1, borderColor: "#d9dbe0", paddingHorizontal: 12, marginRight: 8 }}>
          <Ionicons name="search" size={18} color={hm.sub} />
          <HT size={14} color={hm.faint}>Search by Food Name/Dish</HT>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <Pressable onPress={() => { tap(); router.push(`/food/snap?meal=${slot}${date !== today() ? `&date=${date}` : ""}` as never); }} accessibilityRole="button" accessibilityLabel="Track with images. You click, we scan and track" style={({ pressed }) => [{ margin: 12, borderRadius: 12, backgroundColor: hm.tealSoft, borderWidth: 1, borderColor: hm.tealLine, padding: 14, flexDirection: "row", alignItems: "center" }, pressed && { opacity: 0.85 }]}>
          <View style={{ flex: 1 }}>
            <HT size={14} weight="500" color={hm.teal}>Track with Images</HT>
            <HT size={12} color={hm.teal} style={{ marginTop: 2, opacity: 0.8 }}>You click. We scan and track!</HT>
          </View>
          <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: hm.teal, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="camera-outline" size={20} color="#fff" />
          </View>
        </Pressable>

        {myMeals.length ? (
          <View style={{ backgroundColor: hm.card, marginTop: 4 }}>
            <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 }}>
              <HT size={12} color={hm.sub} style={{ flex: 1 }}>My Meals</HT>
              <Pressable onPress={() => router.push(`/food/meals?meal=${slot}${date !== today() ? `&date=${date}` : ""}` as never)} accessibilityRole="button" accessibilityLabel="View all my meals" hitSlop={8}>
                <HT size={12} weight="500" color={hm.teal}>View All</HT>
              </Pressable>
            </View>
            {myMeals.map((m, i) => {
              const kcal = m.items.reduce((a, b) => a + b.kcal, 0);
              const done = m.items.every((it) => it.foodId && loggedIds.has(it.foodId));
              return (
                <View key={m.id}>
                  {i ? <Divider style={{ marginLeft: 16 }} /> : null}
                  <View style={{ flexDirection: "row", alignItems: "center", paddingLeft: 16, paddingRight: 6, minHeight: 58 }}>
                    <View style={{ flex: 1 }}>
                      <HT size={14} weight="500" numberOfLines={1}>{m.name}</HT>
                      <HT size={11} color={hm.sub} numberOfLines={1}>{m.items.map((x) => x.name).join(", ")}</HT>
                    </View>
                    <HT size={12} color={hm.sub}>{fmt(kcal)} Cal</HT>
                    {done ? (
                      <View style={{ width: 36, height: 36, alignItems: "center", justifyContent: "center" }}>
                        <Ionicons name="checkmark" size={20} color={hm.teal} />
                      </View>
                    ) : (
                      <PlusBtn label={`Add ${m.name}`} color="#8e8e93" onPress={() => addMeal(m)} />
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        ) : null}

        {also.length ? (
          <View style={{ backgroundColor: hm.card, marginTop: 10 }}>
            <HT size={12} color={hm.sub} style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 }}>Did you also have...</HT>
            {also.map(foodRow)}
          </View>
        ) : null}

        <View style={{ backgroundColor: hm.card, marginTop: 10 }}>
          <HT size={12} color={hm.sub} style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 }}>Frequently Tracked Foods</HT>
          {frequent.filter((f) => !also.includes(f)).map(foodRow)}
        </View>

        <Pressable onPress={() => router.push(`/food/add?meal=${slot}` as never)} accessibilityRole="button" accessibilityLabel="Describe your meal in words instead" style={{ flexDirection: "row", alignItems: "center", gap: 8, padding: 16 }}>
          <Ionicons name="create-outline" size={16} color={hm.teal} />
          <HT size={13} weight="500" color={hm.teal}>Describe your meal in words instead</HT>
        </Pressable>
      </ScrollView>

      {added.length ? <AddedBar text={barText} onUndo={lastBatch.length ? undo : undefined} /> : null}
      <Footer style={{ borderTopWidth: added.length ? 0 : 1 }}>
        <Btn label={`Track For ${label}`} onPress={() => router.replace(`/food/day${date !== today() ? `?date=${date}` : ""}` as never)} />
      </Footer>
    </View>
  );
}

