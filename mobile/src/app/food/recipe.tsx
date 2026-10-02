import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RECIPE_BY_ID, RECIPE_CATEGORIES, fibrePer100, recipeNutrition, similarRecipes } from "@f7/content";
import { Btn, CIRCLE_TINTS, Divider, Footer, HT, LetterCircle, hm, tap } from "@/components/hm";

/** One recipe: time · serves · Cal, nutrition per 100 g, ingredients, method, similar recipes, and Track. */
export default function Recipe() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const r = id ? RECIPE_BY_ID[id] : undefined;
  const [open, setOpen] = useState<Record<string, boolean>>({ nutrition: true });

  if (!r) {
    return (
      <View style={{ flex: 1, backgroundColor: hm.card, paddingTop: insets.top + 60, paddingHorizontal: 24 }}>
        <HT size={16} weight="500" center>Recipe not found.</HT>
        <Btn label="All recipes" onPress={() => router.replace("/food/recipes")} style={{ marginTop: 16 }} />
      </View>
    );
  }
  const n = recipeNutrition(r, fibrePer100);
  const cat = RECIPE_CATEGORIES.find((c) => c.id === r.category)!;
  const toggle = (k: string) => { tap(); setOpen((o) => ({ ...o, [k]: !o[k] })); };

  const section = (k: string, title: string, body: React.ReactNode) => (
    <View>
      <Pressable onPress={() => toggle(k)} accessibilityRole="button" accessibilityState={{ expanded: !!open[k] }} aria-expanded={!!open[k]} accessibilityLabel={title} style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, minHeight: 52 }}>
        <HT size={15} weight="500" style={{ flex: 1 }}>{title}</HT>
        <Ionicons name={open[k] ? "chevron-up" : "chevron-down"} size={18} color={hm.ink} />
      </Pressable>
      {open[k] ? <View style={{ paddingHorizontal: 16, paddingBottom: 14 }}>{body}</View> : null}
      <View style={{ height: 8, backgroundColor: hm.bg }} />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: hm.card }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={{ height: 230 + insets.top, justifyContent: "center", alignItems: "center" }}>
          <LinearGradient colors={[cat.tint, "#2b2b2e"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />
          <View style={{ marginTop: insets.top }}>
            <LetterCircle letter={r.name[0]} color="rgba(255,255,255,0.18)" size={110} />
          </View>
          <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back" hitSlop={10} style={{ position: "absolute", top: insets.top + 6, left: 8, width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(0,0,0,0.25)", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </Pressable>
        </View>
        <View style={{ padding: 16 }}>
          <HT size={18} weight="500">{r.name}</HT>
          <View style={{ flexDirection: "row", gap: 18, marginTop: 10 }}>
            <Meta icon="time-outline" text={`${r.minutes}m`} />
            <Meta icon="person-outline" text={`Serves ${r.serves}`} />
            {n ? <Meta icon="restaurant-outline" text={`${n.perServing.kcal} Cal / serving`} /> : null}
          </View>
        </View>
        <View style={{ height: 8, backgroundColor: hm.bg }} />
        {n
          ? section(
              "nutrition",
              "Nutritional Information (per 100g)",
              <>
                {([["barbell-outline", "Protein", n.per100.protein], ["water-outline", "Fats", n.per100.fats], ["cloud-outline", "Carbs", n.per100.carbs], ["leaf-outline", "Fiber (est.)", n.per100.fibre]] as const).map(([icon, l, v]) => (
                  <View key={l} style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8 }}>
                    <Ionicons name={icon} size={16} color={hm.ink} />
                    <HT size={14} style={{ flex: 1 }}>{l}</HT>
                    <HT size={14} color={hm.ink2}>{v} g</HT>
                  </View>
                ))}
                <HT size={11} color={hm.sub} style={{ marginTop: 4 }}>{n.per100.kcal} Cal per 100 g · one serving ≈ {n.perServing.grams} g</HT>
              </>,
            )
          : null}
        {section(
          "ing",
          "Ingredients",
          r.ingredients.map((x) => (
            <View key={x} style={{ flexDirection: "row", gap: 8, paddingVertical: 4 }}>
              <HT size={14} color={hm.sub}>•</HT>
              <HT size={14} style={{ flex: 1 }}>{x}</HT>
            </View>
          )),
        )}
        {section(
          "method",
          "Preparation Method",
          r.steps.map((x, i) => (
            <View key={i} style={{ flexDirection: "row", gap: 10, paddingVertical: 6 }}>
              <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: hm.tealSoft, alignItems: "center", justifyContent: "center" }}>
                <HT size={11} weight="600" color={hm.teal}>{i + 1}</HT>
              </View>
              <HT size={14} style={{ flex: 1 }}>{x}</HT>
            </View>
          )),
        )}
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, marginTop: 8, marginBottom: 12 }}>
          <HT size={15} weight="500" style={{ flex: 1 }}>Similar Recipes</HT>
          <Pressable onPress={() => router.push(`/food/recipes?cat=${r.category}` as never)} accessibilityRole="button" accessibilityLabel="See all similar recipes" hitSlop={8}>
            <HT size={12} weight="500" color={hm.orange}>See All</HT>
          </Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingHorizontal: 10 }}>
          {similarRecipes(r).map((s, i) => (
            <Pressable key={s.id} onPress={() => { tap(); router.replace(`/food/recipe?id=${s.id}` as never); }} accessibilityRole="button" accessibilityLabel={s.name} style={{ width: 100, alignItems: "center" }}>
              <LetterCircle letter={s.name[0]} color={CIRCLE_TINTS[(i + 3) % CIRCLE_TINTS.length]} size={76} />
              <HT size={12} color={hm.ink2} center numberOfLines={2} style={{ marginTop: 6 }}>{s.name}</HT>
            </Pressable>
          ))}
        </ScrollView>
        <Divider style={{ marginTop: 20 }} />
        <HT size={11} color={hm.sub} style={{ padding: 16 }}>Nutrition is from the same dish in the Fitness 7 food table, so what you track matches what you cooked. Home kitchens vary.</HT>
      </ScrollView>
      <Footer>
        <Btn label="Track this recipe" icon="add" onPress={() => router.push(`/food/item?id=${r.foodId}` as never)} />
      </Footer>
    </View>
  );
}

function Meta({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
      <Ionicons name={icon} size={14} color={hm.sub} />
      <HT size={12} color={hm.sub}>{text}</HT>
    </View>
  );
}
