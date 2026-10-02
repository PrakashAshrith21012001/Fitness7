import { useMemo, useState } from "react";
import { Pressable, ScrollView, TextInput, View, useWindowDimensions } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { FOOD_BY_ID, RECIPE_CATEGORIES, recipesIn, searchRecipes, type HealthyRecipe, type RecipeCategory } from "@f7/content";
import { CIRCLE_TINTS, HMHeader, HT, LetterCircle, hm, tap } from "@/components/hm";

const CAT_ICON: Record<RecipeCategory, keyof typeof Ionicons.glyphMap> = {
  sabzi: "leaf", roti: "disc", rice: "restaurant", salad: "nutrition", juice: "wine", breakfast: "sunny", protein: "barbell",
};

/** Healthy Recipes — search, category banners, then a row of recipes per category with See All. */
export default function Recipes() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{ cat?: string }>();
  const cat = RECIPE_CATEGORIES.find((c) => c.id === params.cat);
  const [q, setQ] = useState("");
  const found = useMemo(() => (q.trim() ? searchRecipes(q) : null), [q]);
  const open = (r: HealthyRecipe) => { tap(); router.push(`/food/recipe?id=${r.id}` as never); };

  const tile = (r: HealthyRecipe, i: number, size = 84) => (
    <Pressable key={r.id} onPress={() => open(r)} accessibilityRole="button" accessibilityLabel={`${r.name}, ${FOOD_BY_ID[r.foodId]?.per100.kcal ?? ""} calories per 100 grams`} style={{ width: size + 24, alignItems: "center" }}>
      <LetterCircle letter={r.name[0]} color={CIRCLE_TINTS[(i + r.id.length) % CIRCLE_TINTS.length]} size={size} />
      <HT size={12} color={hm.ink2} center numberOfLines={2} style={{ marginTop: 8 }}>{r.name}</HT>
    </Pressable>
  );

  const grid = (list: HealthyRecipe[]) => (
    <View style={{ flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 8, rowGap: 18 }}>
      {list.map((r, i) => (
        <View key={r.id} style={{ width: (width - 16) / 3, alignItems: "center" }}>{tile(r, i)}</View>
      ))}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: hm.card }}>
      <HMHeader title={cat ? cat.label : "Healthy Recipes"} onBack={() => router.back()} />
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginHorizontal: 14, marginBottom: 10, height: 40, borderRadius: 10, backgroundColor: "#f4f5f7", paddingHorizontal: 10 }}>
        <Ionicons name="search" size={17} color={hm.sub} />
        <TextInput value={q} onChangeText={setQ} placeholder="Search for a recipe" placeholderTextColor={hm.faint} accessibilityLabel="Search for a recipe" style={{ flex: 1, fontSize: 14, color: hm.ink, height: 38 }} />
        {q ? (
          <Pressable onPress={() => setQ("")} accessibilityRole="button" accessibilityLabel="Clear" hitSlop={8}>
            <Ionicons name="close-circle" size={17} color={hm.faint} />
          </Pressable>
        ) : null}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {found ? (
          found.length ? grid(found) : <HT size={14} color={hm.sub} center style={{ marginTop: 30 }}>No recipe matches “{q.trim()}”.</HT>
        ) : cat ? (
          grid(recipesIn(cat.id))
        ) : (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingHorizontal: 14 }}>
              {RECIPE_CATEGORIES.map((c) => (
                <Pressable key={c.id} onPress={() => { tap(); router.push(`/food/recipes?cat=${c.id}` as never); }} accessibilityRole="button" accessibilityLabel={c.label} style={{ width: 170, height: 160, borderRadius: 10, overflow: "hidden", justifyContent: "flex-end" }}>
                  <LinearGradient colors={[c.tint, "#1c1c1e"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />
                  <Ionicons name={CAT_ICON[c.id]} size={64} color="rgba(255,255,255,0.22)" style={{ position: "absolute", right: 12, top: 14 }} />
                  <HT size={14} weight="600" color="#fff" style={{ padding: 10 }}>{c.label}</HT>
                </Pressable>
              ))}
            </ScrollView>
            {RECIPE_CATEGORIES.map((c) => (
              <View key={c.id} style={{ marginTop: 22 }}>
                <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 14, marginBottom: 12 }}>
                  <HT size={15} weight="500" style={{ flex: 1 }}>{c.label}</HT>
                  <Pressable onPress={() => router.push(`/food/recipes?cat=${c.id}` as never)} accessibilityRole="button" accessibilityLabel={`See all ${c.label}`} hitSlop={8}>
                    <HT size={12} weight="500" color={hm.orange}>See All</HT>
                  </Pressable>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 4, paddingHorizontal: 6 }}>
                  {recipesIn(c.id).map((r, i) => tile(r, i))}
                </ScrollView>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}
