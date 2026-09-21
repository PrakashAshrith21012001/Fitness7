import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeOut, LinearTransition } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COMBOS, FOOD_BY_ID, fmtKcal, normalise, searchFoods, type Combo, type Food, type MealSlot } from "@f7/content";
import { radius, type } from "@/theme";
import { useColors } from "@/theme/ThemeProvider";
import { useSession } from "@/state/session";
import { MEALS, useFood, type DraftItem, type ParseResponse } from "@/state/food";
import { PlateRow } from "@/components/PlateRow";
import { FoodLine, FoodTile } from "@/components/FoodPick";
import { rescale } from "@/components/FoodItemRow";
import { Body, Eyebrow, LimeButton } from "@/components/ui";
import { ScreenHeader } from "@/components/Screen";
import { Segmented } from "@/components/Pickers";
import { CATEGORY_ICON, SHELVES, draftFromFood, draftsFromCombo, looksLikeSentence, portionsOf, shelfFoods, usualFor } from "@/lib/food-picks";

/**
 * Add food — one screen, three ways in, zero forms.
 *
 *   tap      a tile (recent, usual for this meal, or a shelf) → it's on the plate
 *   search   "idl" → Idli, Idli sambar plate… → tap +
 *   sentence "2 idli, sambar, oru coffee" → read by the table (and the model
 *            for anything it can't), then one tap to add the lot
 *
 * The plate sits at the top with − n + steppers in the food's own unit, and
 * one green button lands it in the meal. Nothing is saved until then.
 */

const DEFAULT_SHELF: Record<MealSlot, string> = { breakfast: "tiffin", lunch: "rice", snacks: "snacks", dinner: "rice" };

export default function AddFood() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ text?: string; meal?: MealSlot }>();
  const { member } = useSession();
  const { parseText, addItems, defaultSlot, recent } = useFood();
  const hide = !!member?.hideCalories;

  const [slot, setSlot] = useState<MealSlot>(params.meal && MEALS.some((m) => m.id === params.meal) ? params.meal : defaultSlot());
  const [q, setQ] = useState(params.text ?? "");
  const [plate, setPlate] = useState<DraftItem[]>([]);
  const [shelf, setShelf] = useState<string>(DEFAULT_SHELF[slot]);
  const [read, setRead] = useState<ParseResponse | null>(null);
  const [pending, setPending] = useState(false);
  const [comboCount, setComboCount] = useState<Record<string, number>>({});
  const seq = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<TextInput>(null);

  const query = q.trim();
  const sentence = query.length >= 2 && looksLikeSentence(query);

  /* ---- reading a sentence: table instantly, model for the rest, debounced ---- */
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!sentence) {
      setRead(null);
      setPending(false);
      return;
    }
    timer.current = setTimeout(async () => {
      const id = ++seq.current;
      const local = await parseText(query, { allowApi: false });
      if (seq.current !== id) return;
      setRead(local);
      setPending(true);
      try {
        const full = await parseText(query);
        if (seq.current === id) setRead(full);
      } finally {
        if (seq.current === id) setPending(false);
      }
    }, 500);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, sentence]);

  /* ---- plate ---- */
  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const it of plate) if (it.foodId) m[it.foodId] = (m[it.foodId] ?? 0) + portionsOf(it);
    return m;
  }, [plate]);

  const addFood = useCallback((food: Food) => {
    setPlate((list) => {
      const i = list.findIndex((x) => x.foodId === food.id);
      if (i < 0) return [...list, draftFromFood(food)];
      const cur = list[i];
      return list.map((x, j) => (j === i ? rescale(cur, cur.grams + food.portion.grams) : x));
    });
  }, []);

  const addCombo = useCallback((combo: Combo) => {
    setPlate((list) => {
      let next = list;
      for (const part of draftsFromCombo(combo)) {
        const i = next.findIndex((x) => x.foodId === part.foodId);
        next = i < 0 ? [...next, part] : next.map((x, j) => (j === i ? rescale(x, x.grams + part.grams) : x));
      }
      return next;
    });
    setComboCount((c) => ({ ...c, [combo.id]: (c[combo.id] ?? 0) + 1 }));
  }, []);

  const addDrafts = useCallback((items: DraftItem[]) => {
    setPlate((list) => {
      let next = list;
      for (const it of items) {
        const i = it.foodId ? next.findIndex((x) => x.foodId === it.foodId) : -1;
        next = i < 0 ? [...next, { ...it }] : next.map((x, j) => (j === i ? rescale(x, x.grams + it.grams) : x));
      }
      return next;
    });
  }, []);

  const addRead = () => {
    if (!read?.items.length) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    addDrafts(read.items);
    setQ("");
    setRead(null);
  };

  const total = plate.reduce((a, b) => a + b.kcal, 0);
  const protein = plate.reduce((a, b) => a + b.proteinG, 0);
  const mealLabel = MEALS.find((m) => m.id === slot)?.label ?? slot;

  const save = async () => {
    if (!plate.length) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    await addItems(plate, slot);
    router.back();
  };

  /* ---- search results (instant, from the table) ---- */
  const results = useMemo(() => {
    if (query.length < 1 || sentence) return { foods: [] as Food[], combos: [] as Combo[] };
    const key = normalise(query);
    const combos = COMBOS.filter((c) => normalise(c.name).includes(key) || c.aliases.some((a) => normalise(a).startsWith(key))).slice(0, 4);
    return { foods: searchFoods(query, 12), combos };
  }, [query, sentence]);

  const usual = useMemo(() => usualFor(slot), [slot]);
  const shelfList = useMemo(() => shelfFoods(SHELVES.find((s) => s.id === shelf) ?? SHELVES[0]), [shelf]);
  const comboKcal = (c: Combo) => Math.round(draftsFromCombo(c).reduce((a, b) => a + b.kcal, 0));

  const tileFor = (p: ReturnType<typeof usualFor>[number], key: string) =>
    p.kind === "food" ? (
      <FoodTile key={key} name={p.food.name} detail={p.food.portion.label} kcal={hide ? null : Math.round(draftFromFood(p.food).kcal)} icon={CATEGORY_ICON[p.food.category]} count={Math.ceil(counts[p.food.id] ?? 0)} onAdd={() => addFood(p.food)} />
    ) : (
      <FoodTile key={key} name={p.combo.name} detail="plate" kcal={hide ? null : comboKcal(p.combo)} icon="restaurant-outline" count={comboCount[p.combo.id] ?? 0} onAdd={() => addCombo(p.combo)} />
    );

  const section = (title: string, right?: string) => (
    <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginTop: 22, marginBottom: 10 }}>
      <Eyebrow>{title}</Eyebrow>
      {right ? <Body size="micro">{right}</Body> : null}
    </View>
  );

  const listBox = { borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, overflow: "hidden" as const };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: colors.black }}>
      <ScreenHeader title="Add food" />

      {/* Meal */}
      <View style={{ marginHorizontal: 20 }}>
        <Segmented
          value={slot}
          options={MEALS}
          onChange={(m) => {
            setSlot(m);
            setShelf(DEFAULT_SHELF[m]);
          }}
        />
      </View>

      {/* Search */}
      <View style={{ marginTop: 12, marginHorizontal: 20, flexDirection: "row", alignItems: "center", gap: 10, minHeight: 54, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, paddingLeft: 16, paddingRight: 6 }}>
        <Ionicons name="search" size={18} color={colors.muted} />
        <TextInput
          ref={inputRef}
          value={q}
          onChangeText={setQ}
          placeholder="Search or type what you ate"
          placeholderTextColor={colors.muted}
          autoFocus={!params.text && !params.meal}
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={() => (sentence ? addRead() : results.foods[0] ? (addFood(results.foods[0]), setQ("")) : undefined)}
          accessibilityLabel="Search food or type what you ate"
          style={{ flex: 1, color: colors.white, ...type.title, paddingVertical: 12 }}
        />
        {q ? (
          <Pressable onPress={() => setQ("")} accessibilityRole="button" accessibilityLabel="Clear" hitSlop={6} style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="close-circle" size={20} color={colors.muted} />
          </Pressable>
        ) : (
          <Pressable onPress={() => router.push("/food/snap")} accessibilityRole="button" accessibilityLabel="Snap a photo instead" style={{ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface2 }}>
            <Ionicons name="camera-outline" size={18} color={colors.lime} />
          </Pressable>
        )}
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: plate.length ? 150 : insets.bottom + 40 }} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
        {/* Plate */}
        {plate.length ? (
          <Animated.View entering={FadeInDown.duration(220)} exiting={FadeOut.duration(150)} layout={LinearTransition.duration(220)}>
            {section(`Your plate · ${plate.length}`, hide ? undefined : `${fmtKcal(total)} KCAL · ${Math.round(protein)} G PROTEIN`)}
            <View style={[listBox, { borderColor: "rgba(46,204,113,0.45)" }]}>
              {plate.map((it, i) => (
                <Animated.View key={`${it.foodId ?? it.name}`} entering={FadeInDown.duration(200)} layout={LinearTransition.duration(200)}>
                  <PlateRow item={it} first={i === 0} hideCalories={hide} onChange={(next) => setPlate((l) => l.map((x, j) => (j === i ? next : x)))} onRemove={() => setPlate((l) => l.filter((_, j) => j !== i))} />
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        ) : null}

        {/* Sentence read */}
        {sentence ? (
          <View>
            {section("Read from your text", pending ? "READING…" : read?.items.length ? `${read.items.length} ITEM${read.items.length === 1 ? "" : "S"}` : undefined)}
            {read?.items.length ? (
              <>
                <View style={listBox}>
                  {read.items.map((it, i) => {
                    const f = it.foodId ? FOOD_BY_ID[it.foodId] : undefined;
                    return <FoodLine key={`${it.name}-${i}`} first={i === 0} name={it.name} detail={it.portionLabel} kcal={hide ? null : Math.round(it.kcal)} icon={f ? CATEGORY_ICON[f.category] : "sparkles-outline"} onAdd={() => addDrafts([it])} />;
                  })}
                </View>
                <LimeButton label={`Add all to plate${hide ? "" : ` · ${fmtKcal(read.items.reduce((a, b) => a + b.kcal, 0))} kcal`}`} icon="add" onPress={addRead} style={{ marginTop: 12, paddingVertical: 13 }} />
              </>
            ) : !pending ? (
              <Body size="small">Nothing recognised yet — try dish names, e.g. “sambar rice, appalam”.</Body>
            ) : null}
            {read?.notes ? (
              <View style={{ flexDirection: "row", gap: 10, alignItems: "flex-start", marginTop: 12, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, padding: 12 }}>
                <Ionicons name={read.handoff ? "people-outline" : "information-circle-outline"} size={18} color={colors.lime} />
                <Body size="small" muted={false} style={{ flex: 1 }}>{read.notes}</Body>
              </View>
            ) : null}
          </View>
        ) : query.length ? (
          /* Search results */
          <View>
            {section("Results", `${results.foods.length + results.combos.length}`)}
            {results.foods.length + results.combos.length ? (
              <View style={listBox}>
                {results.combos.map((c, i) => (
                  <FoodLine key={c.id} first={i === 0} name={c.name} detail="plate" kcal={hide ? null : comboKcal(c)} icon="restaurant-outline" count={comboCount[c.id] ?? 0} onAdd={() => addCombo(c)} />
                ))}
                {results.foods.map((f, i) => (
                  <FoodLine key={f.id} first={i === 0 && !results.combos.length} name={f.name} detail={f.portion.label} kcal={hide ? null : Math.round(draftFromFood(f).kcal)} icon={CATEGORY_ICON[f.category]} count={Math.ceil(counts[f.id] ?? 0)} onAdd={() => addFood(f)} />
                ))}
              </View>
            ) : (
              <Body size="small">No match in the food table. Type it as a meal — “{query} 1 plate” — and it will be read for you.</Body>
            )}
          </View>
        ) : (
          /* Browse */
          <View>
            {recent.length ? (
              <>
                {section("Recent")}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }} style={{ marginHorizontal: -20, paddingHorizontal: 20 }}>
                  {recent.slice(0, 10).map((it, i) => {
                    const f = it.foodId ? FOOD_BY_ID[it.foodId] : undefined;
                    return <FoodTile key={`${it.foodId ?? it.name}-${i}`} name={it.name} detail={it.portionLabel} kcal={hide ? null : Math.round(it.kcal)} icon={f ? CATEGORY_ICON[f.category] : "time-outline"} count={f ? Math.ceil(counts[f.id] ?? 0) : 0} onAdd={() => addDrafts([it])} />;
                  })}
                  <View style={{ width: 10 }} />
                </ScrollView>
              </>
            ) : null}

            {section(`Usual for ${mealLabel.toLowerCase()}`)}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }} style={{ marginHorizontal: -20, paddingHorizontal: 20 }}>
              {usual.map((p, i) => tileFor(p, `${slot}-${i}`))}
              <View style={{ width: 10 }} />
            </ScrollView>

            {section("Browse")}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }} style={{ marginHorizontal: -20, paddingHorizontal: 20 }}>
              {SHELVES.map((s) => {
                const on = s.id === shelf;
                return (
                  <Pressable
                    key={s.id}
                    onPress={() => {
                      Haptics.selectionAsync().catch(() => {});
                      setShelf(s.id);
                    }}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: on }}
                    style={{ minHeight: 38, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 6, borderRadius: radius.pill, borderWidth: 1, borderColor: on ? colors.green : colors.line, backgroundColor: on ? colors.limeSoft : colors.surface }}
                  >
                    <Ionicons name={s.icon} size={14} color={on ? colors.lime : colors.muted} />
                    <Body size="small" muted={!on} style={{ fontWeight: "600" }}>{s.label}</Body>
                  </Pressable>
                );
              })}
              <View style={{ width: 10 }} />
            </ScrollView>
            <View style={[listBox, { marginTop: 12 }]}>
              {shelfList.map((f, i) => (
                <FoodLine key={f.id} first={i === 0} name={f.name} detail={f.portion.label} kcal={hide ? null : Math.round(draftFromFood(f).kcal)} icon={CATEGORY_ICON[f.category]} count={Math.ceil(counts[f.id] ?? 0)} onAdd={() => addFood(f)} />
              ))}
            </View>
            <Body size="micro" style={{ marginTop: 16, textAlign: "center" }}>TAMIL NAMES WORK · “RENDU IDLI”, “ORU CUP”, “SAMBAR SADAM”</Body>
          </View>
        )}
      </ScrollView>

      {/* Sticky action */}
      {plate.length ? (
        <Animated.View entering={FadeInDown.duration(220)} exiting={FadeOut.duration(150)} style={{ position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 12, paddingBottom: insets.bottom + 14, backgroundColor: colors.black, borderTopWidth: 1, borderTopColor: colors.line }}>
          <LimeButton label={hide ? `Add ${plate.length} to ${mealLabel.toLowerCase()}` : `Add to ${mealLabel.toLowerCase()} · ${fmtKcal(total)} kcal`} icon="checkmark" onPress={save} />
        </Animated.View>
      ) : null}
    </KeyboardAvoidingView>
  );
}
