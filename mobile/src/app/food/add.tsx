import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from "react-native";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeOut, LinearTransition } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COMBOS, FOOD_BY_ID, fmtKcal, normalise, searchFoods, type Combo, type Food, type MealSlot } from "@f7/content";
import { radius, type } from "@/theme";
import { useColors } from "@/theme/ThemeProvider";
import { useSession, today } from "@/state/session";
import { MEALS, useFood, type DraftItem, type ParseResponse } from "@/state/food";
import { useDay } from "@/state/day";
import { missingNumbers, targetFor } from "@/components/TargetCard";
import { PlateRow } from "@/components/PlateRow";
import { FoodLine } from "@/components/FoodPick";
import { rescale } from "@/components/FoodItemRow";
import { Body, Eyebrow, LimeButton } from "@/components/ui";
import { ScreenHeader } from "@/components/Screen";
import { Segmented } from "@/components/Pickers";
import { Enter, Glass, GlassTarget, PressScale } from "@/components/motion";
import { CATEGORY_ICON, draftFromFood, draftsFromCombo, looksLikeSentence, portionsOf, usualFor } from "@/lib/food-picks";
import { MEAL_SHARE } from "@/components/MealCard";
import { Kcal } from "@/components/Kcal";

/**
 * Add food — one box, and the answer appears under it.
 *
 *   type "idl"                 → Idli, Idli sambar plate… tap + to add
 *   type "2 idli, sambar, tea" → read into lines, one button adds them all
 *   type "kuska"               → not in the table? one tap asks the assistant
 *
 * Before you type: your recent foods and the usual things for this meal as
 * small chips — one tap each. No catalogue to scroll. The plate builds at
 * the top with − n + steppers; the meal's budget line keeps you honest.
 */

export default function AddFood() {
  const colors = useColors();
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ text?: string; meal?: MealSlot }>();
  const { member } = useSession();
  const { parseText, addItems, defaultSlot, recent, totals, forDate } = useFood();
  const { burned } = useDay();
  const hide = !!member?.hideCalories;

  const [slot, setSlot] = useState<MealSlot>(params.meal && MEALS.some((m) => m.id === params.meal) ? params.meal : defaultSlot());
  const [q, setQ] = useState(params.text ?? "");
  const [plate, setPlate] = useState<DraftItem[]>([]);
  const [read, setRead] = useState<ParseResponse | null>(null);
  const [pending, setPending] = useState(false);
  const [askedModel, setAskedModel] = useState(false);
  const [comboCount, setComboCount] = useState<Record<string, number>>({});
  const seq = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<TextInput>(null);
  const blurTarget = useRef<View>(null);
  const [keyboardUp, setKeyboardUp] = useState(false);
  useEffect(() => {
    const a = Keyboard.addListener("keyboardDidShow", () => setKeyboardUp(true));
    const b = Keyboard.addListener("keyboardDidHide", () => setKeyboardUp(false));
    return () => {
      a.remove();
      b.remove();
    };
  }, []);

  const query = q.trim();
  const sentence = query.length >= 2 && looksLikeSentence(query);

  /* ---- budget for this meal ---- */
  const date = today();
  const target = targetFor(member);
  const dayBudget = target ? target.kcal + burned(date) : null;
  const mealSoFar = forDate(date).filter((e) => e.meal === slot).reduce((a, b) => a + b.kcal, 0);
  const mealGuide = dayBudget ? Math.round(dayBudget * MEAL_SHARE[slot]) : null;
  const dayLeft = dayBudget ? dayBudget - totals(date).kcal : null;

  /* ---- reading text: table instantly, model for the rest (sentences automatically, single words on request) ---- */
  const runRead = useCallback(
    async (text: string, allowApi: boolean) => {
      const id = ++seq.current;
      const local = await parseText(text, { allowApi: false });
      if (seq.current !== id) return;
      setRead(local);
      if (!allowApi) return;
      setPending(true);
      try {
        const full = await parseText(text);
        if (seq.current === id) setRead(full);
      } finally {
        if (seq.current === id) setPending(false);
      }
    },
    [parseText],
  );

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    setAskedModel(false);
    if (!sentence) {
      setRead(null);
      setPending(false);
      return;
    }
    timer.current = setTimeout(() => void runRead(query, true), 500);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [query, sentence, runRead]);

  /* ---- plate ---- */
  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const it of plate) if (it.foodId) m[it.foodId] = (m[it.foodId] ?? 0) + portionsOf(it);
    return m;
  }, [plate]);

  const addDrafts = useCallback((items: DraftItem[]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setPlate((list) => {
      let next = list;
      for (const it of items) {
        const i = it.foodId ? next.findIndex((x) => x.foodId === it.foodId) : -1;
        next = i < 0 ? [...next, { ...it }] : next.map((x, j) => (j === i ? rescale(x, x.grams + it.grams) : x));
      }
      return next;
    });
  }, []);
  const addFood = useCallback((food: Food) => addDrafts([draftFromFood(food)]), [addDrafts]);
  const addCombo = useCallback(
    (combo: Combo) => {
      addDrafts(draftsFromCombo(combo));
      setComboCount((c) => ({ ...c, [combo.id]: (c[combo.id] ?? 0) + 1 }));
    },
    [addDrafts],
  );
  const addRead = () => {
    if (!read?.items.length) return;
    addDrafts(read.items);
    setQ("");
    setRead(null);
  };

  const total = plate.reduce((a, b) => a + b.kcal, 0);
  const protein = plate.reduce((a, b) => a + b.proteinG, 0);
  const mealLabel = MEALS.find((m) => m.id === slot)?.label ?? slot;

  const leaving = useRef(false);
  const leave = () => {
    leaving.current = true;
    if (router.canGoBack()) router.back();
    else router.replace("/food");
  };
  const save = async () => {
    if (!plate.length) return;
    Keyboard.dismiss();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    await addItems(plate, slot);
    leave();
  };
  /** Back with food on the plate — header arrow, Android back or swipe — never loses it silently. */
  const plateRef = useRef(plate);
  plateRef.current = plate;
  const askRef = useRef<() => void>(() => {});
  askRef.current = () => {
    if (Platform.OS === "web") {
      // react-native-web has no Alert buttons; a plain confirm keeps the guard working there.
      // eslint-disable-next-line no-alert
      if (typeof window !== "undefined" && window.confirm(`Add ${plate.length} item${plate.length === 1 ? "" : "s"} to ${mealLabel.toLowerCase()} before leaving?`)) void save();
      else leave();
      return;
    }
    Alert.alert(`Add to ${mealLabel.toLowerCase()}?`, `${plate.length} item${plate.length === 1 ? "" : "s"} on your plate${hide ? "" : ` · ${fmtKcal(total)} kcal`}.`, [
      { text: "Discard", style: "destructive", onPress: leave },
      { text: `Add to ${mealLabel.toLowerCase()}`, onPress: () => void save() },
    ]);
  };
  const onBack = () => (plateRef.current.length ? askRef.current() : leave());
  useEffect(() => {
    const sub = navigation.addListener("beforeRemove", (e) => {
      if (leaving.current || !plateRef.current.length) return;
      e.preventDefault();
      askRef.current();
    });
    return sub;
  }, [navigation]);

  /* ---- instant results from the table ---- */
  const results = useMemo(() => {
    if (query.length < 1 || sentence) return { foods: [] as Food[], combos: [] as Combo[] };
    const key = normalise(query);
    const combos = COMBOS.filter((c) => normalise(c.name).includes(key) || c.aliases.some((a) => normalise(a).startsWith(key))).slice(0, 4);
    return { foods: searchFoods(query, 10), combos };
  }, [query, sentence]);
  const noMatch = query.length >= 3 && !sentence && results.foods.length + results.combos.length === 0;

  const usual = useMemo(() => usualFor(slot), [slot]);
  const comboKcal = (c: Combo) => Math.round(draftsFromCombo(c).reduce((a, b) => a + b.kcal, 0));

  const listBox = { borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, overflow: "hidden" as const };
  const section = (title: string, right?: string) => (
    <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginTop: 22, marginBottom: 10 }}>
      <Eyebrow>{title}</Eyebrow>
      {right ? <Body size="micro">{right}</Body> : null}
    </View>
  );

  /** A one-tap chip: name · kcal, with a count once it's on the plate. */
  const chip = (key: string, name: string, kcal: number | null, count: number, onPress: () => void, icon?: keyof typeof Ionicons.glyphMap) => (
    <PressScale key={key} onPress={onPress} scale={0.95} accessibilityRole="button" accessibilityLabel={`Add ${name}${kcal != null ? `, ${kcal} kcal` : ""}`} style={{ flexDirection: "row", alignItems: "center", gap: 8, minHeight: 44, paddingLeft: 12, paddingRight: 6, borderRadius: radius.pill, backgroundColor: count ? colors.limeSoft : colors.surface, borderWidth: 1, borderColor: count ? colors.accentBorder : colors.line }}>
      {icon ? <Ionicons name={icon} size={15} color={colors.lime} /> : null}
      <Body size="small" muted={false} style={{ fontWeight: "600" }} numberOfLines={1}>{name}</Body>
      {kcal != null ? <Kcal value={kcal} size="micro" weight="500" color={colors.muted} /> : null}
      <View style={{ width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: count ? colors.green : colors.surface2 }}>
        {count ? <Body size="micro" style={{ fontWeight: "800", color: colors.onAccent }}>{count}</Body> : <Ionicons name="add" size={16} color={colors.white} />}
      </View>
    </PressScale>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: colors.black }}>
      <ScreenHeader title="Add food" onBack={onBack} />

      <View style={{ marginHorizontal: 20 }}>
        <Segmented value={slot} options={MEALS} onChange={setSlot} />
        {!hide ? (
          <Body size="small" style={{ marginTop: 10, textAlign: "center" }}>
            {mealGuide
              ? `${mealLabel} ${fmtKcal(mealSoFar + total)} / ${fmtKcal(mealGuide)} kcal${dayLeft !== null && dayBudget ? ` · today ${fmtKcal(dayBudget - dayLeft + total)} / ${fmtKcal(dayBudget)}` : ""}`
              : mealSoFar
                ? `${mealLabel} so far: ${fmtKcal(mealSoFar)} kcal`
                : `No budget yet — add your ${missingNumbers(member).join(", ")} in Settings`}
          </Body>
        ) : null}
      </View>

      {/* The one box */}
      <View style={{ marginTop: 12, marginHorizontal: 20, flexDirection: "row", alignItems: "center", gap: 10, minHeight: 56, borderRadius: radius.pill, borderWidth: 1, borderColor: query ? colors.accentBorder : colors.line, backgroundColor: colors.surface, paddingLeft: 16, paddingRight: 6 }}>
        <Ionicons name="search" size={18} color={colors.muted} />
        <TextInput
          ref={inputRef}
          value={q}
          onChangeText={setQ}
          placeholder="What did you eat?"
          placeholderTextColor={colors.muted}
          autoFocus={!!params.text}
          autoCorrect={false}
          maxLength={200}
          returnKeyType="done"
          blurOnSubmit={false}
          onSubmitEditing={() => {
            if (sentence) addRead();
            else if (results.combos[0]) { addCombo(results.combos[0]); setQ(""); }
            else if (results.foods[0]) { addFood(results.foods[0]); setQ(""); }
            else if (noMatch) { setAskedModel(true); void runRead(query, true); }
          }}
          accessibilityLabel="What did you eat"
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
      {!query ? <Body size="micro" style={{ marginHorizontal: 20, marginTop: 8 }}>Type a dish, or a whole meal — “2 idli sambar, oru coffee”. Tamil names work.</Body> : null}

      <GlassTarget targetRef={blurTarget}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: plate.length ? 150 : insets.bottom + 40 }} keyboardShouldPersistTaps="always" keyboardDismissMode="on-drag">
        {/* Plate */}
        {plate.length ? (
          <Animated.View entering={FadeInDown.duration(220)} exiting={FadeOut.duration(150)} layout={LinearTransition.duration(220)}>
            {section(`Your plate · ${plate.length}`, hide ? undefined : `${fmtKcal(total)} kcal · ${Math.round(protein)} g protein`)}
            <View style={[listBox, { borderColor: colors.accentBorder }]}>
              {plate.map((it, i) => (
                <Animated.View key={`${it.foodId ?? it.name}`} entering={FadeInDown.duration(200)} layout={LinearTransition.duration(200)}>
                  <PlateRow item={it} first={i === 0} hideCalories={hide} onChange={(next) => setPlate((l) => l.map((x, j) => (j === i ? next : x)))} onRemove={() => setPlate((l) => l.filter((_, j) => j !== i))} />
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        ) : null}
        {/* The save button also lives right under the plate — the sticky one is behind the keyboard while you type. */}
        {plate.length && keyboardUp ? (
          <LimeButton label={hide ? `Add ${plate.length} to ${mealLabel.toLowerCase()}` : `Add to ${mealLabel.toLowerCase()} · ${fmtKcal(total)} kcal`} icon="checkmark" onPress={save} style={{ marginTop: 12, paddingVertical: 13 }} />
        ) : null}

        {sentence || (askedModel && read) ? (
          /* Read from text */
          <View>
            {section(pending ? "Reading…" : "Read from your text", read?.items.length ? `${read.items.length} item${read.items.length === 1 ? "" : "s"}` : undefined)}
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
          /* Instant results */
          <View>
            {section("Tap to add", results.foods.length + results.combos.length ? `${results.foods.length + results.combos.length}` : undefined)}
            {results.foods.length + results.combos.length ? (
              <View style={listBox}>
                {results.combos.map((c, i) => (
                  <FoodLine key={c.id} first={i === 0} name={c.name} detail="full plate" kcal={hide ? null : comboKcal(c)} icon="restaurant-outline" count={comboCount[c.id] ?? 0} onAdd={() => addCombo(c)} />
                ))}
                {results.foods.map((f, i) => (
                  <FoodLine key={f.id} first={i === 0 && !results.combos.length} name={f.name} detail={f.portion.label} kcal={hide ? null : Math.round(draftFromFood(f).kcal)} icon={CATEGORY_ICON[f.category]} count={Math.ceil(counts[f.id] ?? 0)} onAdd={() => addFood(f)} />
                ))}
              </View>
            ) : noMatch ? (
              <View style={[listBox, { padding: 16 }]}>
                <Body size="body" muted={false} style={{ fontWeight: "600" }}>“{query}” isn't in the food table</Body>
                <Body size="small" style={{ marginTop: 4 }}>The assistant can read it and estimate a portion — you can adjust before adding.</Body>
                <LimeButton label={pending ? "Reading…" : `Read “${query}”`} icon="sparkles-outline" variant="soft" disabled={pending} onPress={() => { setAskedModel(true); void runRead(query, true); }} style={{ marginTop: 12, paddingVertical: 12 }} />
              </View>
            ) : (
              <Body size="small">Keep typing…</Body>
            )}
          </View>
        ) : (
          /* Nothing typed yet — one-tap chips, no catalogue */
          <View>
            {recent.length ? (
              <Enter index={0}>
                {section("Recent")}
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {recent.slice(0, 8).map((it, i) => {
                    const f = it.foodId ? FOOD_BY_ID[it.foodId] : undefined;
                    return chip(`r-${it.foodId ?? it.name}-${i}`, it.name, hide ? null : Math.round(it.kcal), f ? Math.ceil(counts[f.id] ?? 0) : 0, () => addDrafts([it]), f ? CATEGORY_ICON[f.category] : "time-outline");
                  })}
                </View>
              </Enter>
            ) : null}
            <Enter index={1}>
              {section(`Usual for ${mealLabel.toLowerCase()}`)}
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {usual.map((p, i) =>
                  p.kind === "food"
                    ? chip(`u-${i}`, p.food.name, hide ? null : Math.round(draftFromFood(p.food).kcal), Math.ceil(counts[p.food.id] ?? 0), () => addFood(p.food), CATEGORY_ICON[p.food.category])
                    : chip(`u-${i}`, p.combo.name, hide ? null : comboKcal(p.combo), comboCount[p.combo.id] ?? 0, () => addCombo(p.combo), "restaurant-outline"),
                )}
              </View>
            </Enter>
            <Enter index={2}>
              <Body size="micro" style={{ marginTop: 22, textAlign: "center" }}>Anything else — just type it. 300+ Indian dishes are matched instantly; the rest is read for you.</Body>
            </Enter>
          </View>
        )}
      </ScrollView>
      </GlassTarget>

      {/* Sticky action */}
      {plate.length && !keyboardUp ? (
        <Animated.View entering={FadeInDown.duration(220)} exiting={FadeOut.duration(150)} style={{ position: "absolute", left: 16, right: 16, bottom: insets.bottom + 12 }}>
          <Glass strength="light" intensity={60} radius={radius.pill} target={blurTarget} style={{ padding: 6 }}>
            <LimeButton label={hide ? `Add ${plate.length} to ${mealLabel.toLowerCase()}` : `Add to ${mealLabel.toLowerCase()} · ${fmtKcal(total)} kcal`} icon="checkmark" onPress={save} />
          </Glass>
        </Animated.View>
      ) : null}
    </KeyboardAvoidingView>
  );
}
