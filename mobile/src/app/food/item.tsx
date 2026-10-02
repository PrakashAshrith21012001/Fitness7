import { useMemo, useState } from "react";
import { Pressable, ScrollView, Share, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COMBO_BY_ID, FOOD_BY_ID, MEAL_LABEL, UNITS, fibrePer100, gramsFor, isMealSlot, macrosFor, type Food, type MealSlot } from "@f7/content";
import { today } from "@/state/session";
import { useFood, type DraftItem } from "@/state/food";
import { Btn, Card, Divider, Footer, HMSheet, HT, LockedRows, hm, tap } from "@/components/hm";
import { draftsFromCombo, portionLabel } from "@/lib/food-picks";
import { fmt } from "@/lib/tracker-day";

const QTYS = [0.25, 0.5, 0.75, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
const SRC: Record<Food["src"], string> = { ifct: "IFCT 2017 (ICMR-NIN)", usda: "USDA FoodData Central", label: "Pack label", recipe: "Standard recipe — kitchens vary" };

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** "1 katori" → "Katori", "100 g" → "Gram (100 g)" */
function measureName(label: string): string {
  const m = label.match(/^[\d½¼¾.]+\s*(?:×\s*)?(.*)$/);
  const rest = (m ? m[1] : label).trim();
  return cap(rest || label);
}

/**
 * The food page: name on a dark card, Quantity × Measure pickers, the
 * Macronutrients Breakdown (calories, net weight, protein, fats, carbs,
 * fibre), the micronutrients card, and Add. Opened from search, the log
 * screen, or a logged item's ⋮ → Edit (then Add becomes Update).
 */
export default function FoodItem() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string; combo?: string; meal?: string; date?: string; qty?: string; unit?: string; entry?: string; from?: string }>();
  const { addItems, replace, entries, defaultSlot } = useFood();
  const editing = params.entry ? entries.find((e) => e.id === params.entry) : undefined;
  const food = FOOD_BY_ID[(editing?.foodId ?? params.id) || ""] as Food | undefined;
  const combo = params.combo ? COMBO_BY_ID[params.combo] : undefined;
  const slot: MealSlot = editing?.meal ?? (isMealSlot(params.meal) ? params.meal : defaultSlot());
  const date = editing?.date ?? (params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date) ? params.date : today());

  // Starting quantity × measure: the edited line, else what was typed ("2 idli"), else 1 × the default portion.
  const initial = useMemo(() => {
    if (!food) return { qty: 1, m: 0 };
    const grams = editing ? editing.grams : params.qty || params.unit ? gramsFor(food, params.qty ? Number(params.qty) : null, params.unit ? UNITS[params.unit] ?? null : null).grams : food.servings[0]?.grams ?? food.portion.grams;
    const servings = food.servings.length ? food.servings : [food.portion];
    // the measure whose multiple of quantity lands closest to a tidy number
    let best = { qty: 1, m: 0, err: Infinity };
    servings.forEach((s, m) => {
      const q = Math.round((grams / s.grams) * 4) / 4;
      if (q <= 0 || q > 10) return;
      const err = Math.abs(q * s.grams - grams) + (m === 0 ? 0 : 0.5);
      if (err < best.err) best = { qty: q, m, err };
    });
    return { qty: best.qty, m: best.m };
  }, [food, editing, params.qty, params.unit]);

  const [qty, setQty] = useState(initial.qty);
  const [m, setM] = useState(initial.m);
  const [picker, setPicker] = useState<null | "qty" | "measure">(null);
  const [times, setTimes] = useState(1);
  const [busy, setBusy] = useState(false);

  if (!food && !combo) {
    return (
      <View style={{ flex: 1, backgroundColor: hm.bg, paddingTop: insets.top + 60, alignItems: "center", paddingHorizontal: 24 }}>
        <HT size={16} weight="500" center>We couldn't find that food.</HT>
        <Btn label="Back to search" onPress={() => router.back()} style={{ marginTop: 18, alignSelf: "stretch" }} />
      </View>
    );
  }

  // ---- numbers
  let draft: DraftItem[] = [];
  let title = "";
  let grams = 0;
  if (food) {
    const servings = food.servings.length ? food.servings : [food.portion];
    const s = servings[Math.min(m, servings.length - 1)];
    grams = Math.max(1, Math.round(qty * s.grams));
    const mac = macrosFor(food, grams);
    title = food.name;
    draft = [{ name: food.name, foodId: food.id, grams, portionLabel: qty === 1 ? s.label : `${qty} × ${s.label.replace(/^1 /, "")}`, ...mac, confidence: 1, source: "table", needsConfirm: false, estimate: !!food.estimate }];
    if (/^\d+ ?g$|^100 ml$/.test(s.label)) draft[0].portionLabel = portionLabel(food, grams);
  } else if (combo) {
    title = combo.name;
    draft = draftsFromCombo(combo, times);
    grams = draft.reduce((a, d) => a + d.grams, 0);
  }
  const kcal = draft.reduce((a, d) => a + d.kcal, 0);
  const p = draft.reduce((a, d) => a + d.proteinG, 0);
  const f = draft.reduce((a, d) => a + d.fatG, 0);
  const c = draft.reduce((a, d) => a + d.carbsG, 0);
  const fib = draft.reduce((a, d) => {
    const ff = d.foodId ? FOOD_BY_ID[d.foodId] : undefined;
    return a + (ff ? (fibrePer100(ff) * d.grams) / 100 : 0);
  }, 0);
  const drink = food?.category === "drink";
  const r1 = (n: number) => (Math.round(n * 10) / 10).toFixed(1);

  const save = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (editing && draft[0]) await replace(editing.id, draft[0]);
      else await addItems(draft, slot, date);
      // From search, land back on the meal's log screen (like the reference), not on the results.
      if (params.from === "search" && router.canDismiss()) router.dismiss(2);
      else router.back();
    } finally {
      setBusy(false);
    }
  };

  const servings = food ? (food.servings.length ? food.servings : [food.portion]) : [];

  return (
    <View style={{ flex: 1, backgroundColor: hm.bg }}>
      <View style={{ paddingTop: insets.top + 6, paddingHorizontal: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: hm.card }}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back" hitSlop={10} style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="chevron-back" size={24} color={hm.ink} />
        </Pressable>
        <Pressable onPress={() => { tap(); Share.share({ message: `${title}: ${fmt(kcal)} Cal for ${draft.map((d) => d.portionLabel).join(" + ")} — ${r1(p)} g protein, ${r1(c)} g carbs, ${r1(f)} g fat. Tracked on the Fitness 7 app.` }).catch(() => {}); }} accessibilityRole="button" accessibilityLabel="Share" hitSlop={10} style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="share-outline" size={22} color={hm.ink} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 30 }}>
        <View style={{ height: 112, borderRadius: 14, overflow: "hidden", justifyContent: "flex-end", padding: 14 }}>
          <LinearGradient colors={["#5a5a5e", "#1c1c1e"]} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />
          <HT size={17} weight="600" color="#fff" numberOfLines={2}>{title}</HT>
          {food?.brand ? <HT size={12} color="rgba(255,255,255,0.75)">{food.brand}</HT> : null}
        </View>

        {food ? (
          <Card style={{ marginTop: 14 }} padding={12}>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <HT size={12} color={hm.sub}>Quantity</HT>
                <Pressable onPress={() => { tap(); setPicker("qty"); }} accessibilityRole="button" accessibilityLabel={`Quantity ${qty}. Change`} style={{ marginTop: 6, height: 44, borderRadius: 8, backgroundColor: "#f4f5f7", flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12 }}>
                  <HT size={15}>{qty % 1 ? String(qty) : qty.toFixed(1)}</HT>
                  <Ionicons name="chevron-down" size={16} color={hm.ink} />
                </Pressable>
              </View>
              <View style={{ flex: 2 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <HT size={12} color={hm.sub}>Measure</HT>
                  <Ionicons name="help-circle-outline" size={15} color={hm.teal} accessibilityLabel={`One ${servings[m]?.label} is ${servings[m]?.grams} ${drink ? "ml" : "g"}`} />
                </View>
                <Pressable onPress={() => { tap(); setPicker("measure"); }} accessibilityRole="button" accessibilityLabel={`Measure ${servings[m]?.label}. Change`} style={{ marginTop: 6, height: 44, borderRadius: 8, backgroundColor: "#f4f5f7", flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12 }}>
                  <HT size={15} numberOfLines={1} style={{ flex: 1 }}>{measureName(servings[m]?.label ?? "")}</HT>
                  <Ionicons name="chevron-down" size={16} color={hm.ink} />
                </Pressable>
              </View>
            </View>
          </Card>
        ) : combo ? (
          <Card style={{ marginTop: 14 }} padding={12}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <HT size={14} weight="500" style={{ flex: 1 }}>Plates</HT>
              <Pressable onPress={() => setTimes((t) => Math.max(0.5, t - 0.5))} accessibilityRole="button" accessibilityLabel="Fewer" hitSlop={8} style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: "#f4f5f7", alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="remove" size={18} color={hm.ink} />
              </Pressable>
              <HT size={16} weight="600" style={{ width: 44, textAlign: "center" }}>{times}</HT>
              <Pressable onPress={() => setTimes((t) => Math.min(5, t + 0.5))} accessibilityRole="button" accessibilityLabel="More" hitSlop={8} style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: "#f4f5f7", alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="add" size={18} color={hm.ink} />
              </Pressable>
            </View>
            <Divider style={{ marginVertical: 10 }} />
            {draft.map((d) => (
              <View key={d.foodId ?? d.name} style={{ flexDirection: "row", paddingVertical: 6 }}>
                <HT size={13} style={{ flex: 1 }}>{d.name} <HT size={12} color={hm.sub}>· {d.portionLabel}</HT></HT>
                <HT size={13} color={hm.sub}>{fmt(d.kcal)} Cal</HT>
              </View>
            ))}
          </Card>
        ) : null}

        <HT size={15} weight="600" style={{ marginTop: 22, marginBottom: 10 }}>Macronutrients Breakdown</HT>
        <Card padding={14}>
          <HT size={12} color={hm.sub}>Calories</HT>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <HT size={28} weight="500">{fmt(kcal)} Cal</HT>
            <View style={{ backgroundColor: "#f4f5f7", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 }}>
              <HT size={11} color={hm.ink2}>Net wt: {fmt(grams)} {drink ? "ml" : "g"}</HT>
            </View>
          </View>
          <Divider style={{ marginVertical: 12 }} />
          {([
            ["barbell-outline", "Proteins", p],
            ["water-outline", "Fats", f],
            ["cloud-outline", "Carbs", c],
            ["leaf-outline", "Fiber (est.)", fib],
          ] as const).map(([icon, l, v]) => (
            <View key={l} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 9 }} accessible accessibilityLabel={`${l} ${r1(v)} grams`}>
              <Ionicons name={icon} size={16} color={hm.ink} />
              <HT size={14} style={{ flex: 1 }}>{l}</HT>
              <HT size={14} color={hm.ink2}>{r1(v)} g</HT>
            </View>
          ))}
        </Card>

        <HT size={15} weight="600" style={{ marginTop: 22, marginBottom: 10 }}>Micronutrients Breakdown</HT>
        <Card padding={14}>
          <LockedRows title="MicroNutrients Breakdown" line="Iron, calcium, vitamins and more are on the way for the Indian food table." rows={5} />
        </Card>

        {food ? (
          <HT size={11} color={hm.sub} style={{ marginTop: 16 }}>
            Source: {SRC[food.src]}{food.estimate ? " · cooked dish, an estimate" : ""}. Per 100 {drink ? "ml" : "g"}: {food.per100.kcal} Cal · P {food.per100.protein} g · C {food.per100.carbs} g · F {food.per100.fat} g.
          </HT>
        ) : null}
      </ScrollView>

      <Footer>
        <Btn label={editing ? "Update" : "Add"} busy={busy} onPress={save} />
        {!editing ? <HT size={11} color={hm.sub} center style={{ marginTop: 6 }}>Adds to {MEAL_LABEL[slot]}{date !== today() ? ` · ${date}` : ""}</HT> : null}
      </Footer>

      <HMSheet open={picker === "qty"} onClose={() => setPicker(null)} title="Quantity" scroll maxHeight={0.6}>
        {QTYS.map((q) => (
          <Pressable key={q} onPress={() => { setQty(q); setPicker(null); }} accessibilityRole="radio" accessibilityState={{ checked: q === qty }} aria-checked={q === qty} accessibilityLabel={String(q)} style={{ flexDirection: "row", alignItems: "center", minHeight: 46, borderBottomWidth: 1, borderBottomColor: hm.line }}>
            <HT size={15} weight={q === qty ? "600" : "400"} style={{ flex: 1 }}>{q}</HT>
            {q === qty ? <Ionicons name="checkmark" size={18} color={hm.teal} /> : null}
          </Pressable>
        ))}
      </HMSheet>
      <HMSheet open={picker === "measure"} onClose={() => setPicker(null)} title="Measure" scroll maxHeight={0.6}>
        {servings.map((s, i) => (
          <Pressable key={s.label + i} onPress={() => { setM(i); setPicker(null); }} accessibilityRole="radio" accessibilityState={{ checked: i === m }} aria-checked={i === m} accessibilityLabel={s.label} style={{ flexDirection: "row", alignItems: "center", minHeight: 50, borderBottomWidth: 1, borderBottomColor: hm.line }}>
            <View style={{ flex: 1 }}>
              <HT size={15} weight={i === m ? "600" : "400"}>{measureName(s.label)}</HT>
              <HT size={11} color={hm.sub}>{s.label} = {s.grams} {drink ? "ml" : "g"}</HT>
            </View>
            {i === m ? <Ionicons name="checkmark" size={18} color={hm.teal} /> : null}
          </Pressable>
        ))}
      </HMSheet>
    </View>
  );
}
