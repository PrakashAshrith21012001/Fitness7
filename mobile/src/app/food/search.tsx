import { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { isMealSlot, searchFood, warmFoodSearch, type MealSlot, type SearchHit } from "@f7/content";
import { today } from "@/state/session";
import { useFood } from "@/state/food";
import { Divider, HT, hm, tap } from "@/components/hm";

/**
 * Food search — type-ahead over ~2,000 foods and plates, on the phone.
 * Rows show the name with what you typed in bold and a chevron; tapping
 * opens the food page (quantity, measure, macros, Add).
 */
export default function FoodSearch() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ meal?: string; date?: string; q?: string }>();
  const { defaultSlot, history, recentIds } = useFood();
  const slot: MealSlot = isMealSlot(params.meal) ? params.meal : defaultSlot();
  const date = params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date) ? params.date : today();
  const [q, setQ] = useState(params.q ?? "");

  useEffect(() => {
    warmFoodSearch();
  }, []);

  const res = useMemo(() => (q.trim().length ? searchFood(q, { limit: 30, slot, history, recent: recentIds }) : null), [q, slot, history, recentIds]);
  const dq = date !== today() ? `&date=${date}` : "";
  const qty = res && (res.qty || res.unitWord) ? `&qty=${res.qty ?? 1}${res.unitWord ? `&unit=${encodeURIComponent(res.unitWord)}` : ""}` : "";

  const open = (h: SearchHit) => {
    tap();
    if (h.kind === "combo") router.push(`/food/item?combo=${h.id}&meal=${slot}${dq}${qty}&from=search` as never);
    else router.push(`/food/item?id=${h.id}&meal=${slot}${dq}${qty}&from=search` as never);
  };

  const words = q.toLowerCase().split(/\s+/).filter((w) => w.length > 1 && !/^\d/.test(w));
  const bold = (name: string) => {
    const lower = name.toLowerCase();
    const marks: [number, number][] = [];
    for (const w of words) {
      const i = lower.indexOf(w);
      if (i >= 0) marks.push([i, i + w.length]);
    }
    if (!marks.length) return <Text style={{ color: hm.ink }}>{name}</Text>;
    marks.sort((a, b) => a[0] - b[0]);
    const out: React.ReactNode[] = [];
    let at = 0;
    marks.forEach(([s, e], k) => {
      if (s < at) return;
      if (s > at) out.push(<Text key={`n${k}`} style={{ color: hm.ink }}>{name.slice(at, s)}</Text>);
      out.push(<Text key={`b${k}`} style={{ color: hm.ink, fontWeight: "700" }}>{name.slice(s, e)}</Text>);
      at = e;
    });
    if (at < name.length) out.push(<Text key="tail" style={{ color: hm.ink }}>{name.slice(at)}</Text>);
    return out;
  };

  return (
    <View style={{ flex: 1, backgroundColor: hm.card }}>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 12, paddingBottom: 8, flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8, height: 42, borderRadius: 10, borderWidth: 1, borderColor: "#d9dbe0", paddingHorizontal: 10 }}>
          <Ionicons name="search" size={18} color={hm.sub} />
          <TextInput
            value={q}
            onChangeText={setQ}
            autoFocus
            placeholder="Search by Food Name/Dish"
            placeholderTextColor={hm.faint}
            returnKeyType="search"
            autoCorrect={false}
            accessibilityLabel="Search food"
            style={{ flex: 1, fontSize: 15, color: hm.ink, height: 40 }}
          />
          {q ? (
            <Pressable onPress={() => setQ("")} accessibilityRole="button" accessibilityLabel="Clear search" hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={hm.faint} />
            </Pressable>
          ) : null}
        </View>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Cancel" hitSlop={8}>
          <HT size={15} color={hm.ink}>Cancel</HT>
        </Pressable>
      </View>

      <FlatList
        data={res?.hits ?? []}
        keyExtractor={(h) => `${h.kind}:${h.id}`}
        keyboardShouldPersistTaps="handled"
        ItemSeparatorComponent={() => <Divider style={{ marginLeft: 16 }} />}
        ListHeaderComponent={
          res?.didYouMean ? (
            <Pressable onPress={() => setQ(res.didYouMean!)} accessibilityRole="button" accessibilityLabel={`Did you mean ${res.didYouMean}`} style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
              <HT size={13} color={hm.sub}>Did you mean <HT size={13} weight="600" color={hm.teal}>{res.didYouMean}</HT>?</HT>
            </Pressable>
          ) : res?.intent ? (
            <HT size={12} color={hm.sub} style={{ paddingHorizontal: 16, paddingVertical: 8 }}>{res.intent.label}</HT>
          ) : null
        }
        renderItem={({ item: h }) => {
          const name = h.food?.name ?? h.combo?.name ?? h.id;
          return (
            <Pressable onPress={() => open(h)} accessibilityRole="button" accessibilityLabel={`${name}${h.food?.brand ? `, ${h.food.brand}` : ""}`} style={({ pressed }) => [{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, minHeight: 46 }, pressed && { backgroundColor: "#f6f7f9" }]}>
              <View style={{ flex: 1, paddingVertical: 10 }}>
                <Text style={{ fontSize: 14 }} numberOfLines={1}>{bold(name)}</Text>
                {h.food?.brand ? <HT size={11} color={hm.sub}>{h.food.brand}</HT> : h.kind === "combo" ? <HT size={11} color={hm.sub}>Plate · {h.combo!.parts.length} items</HT> : null}
              </View>
              <Ionicons name="chevron-forward" size={18} color={hm.ink2} />
            </Pressable>
          );
        }}
        ListEmptyComponent={
          q.trim().length > 1 ? (
            <View style={{ padding: 24, alignItems: "center" }}>
              <HT size={14} color={hm.sub} center>No match for “{q.trim()}”.</HT>
            </View>
          ) : (
            <View style={{ padding: 24 }}>
              <HT size={13} color={hm.sub}>Try “2 idli”, “chicken biryani”, “high protein snacks” or a brand like “Amul”.</HT>
            </View>
          )
        }
      />

      {q.trim().length > 1 ? (
        <Pressable onPress={() => router.push(`/food/add?meal=${slot}&text=${encodeURIComponent(q.trim())}` as never)} accessibilityRole="button" accessibilityLabel="Can't find your food? Describe it" style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, paddingBottom: Math.max(insets.bottom, 14), borderTopWidth: 1, borderTopColor: hm.line, backgroundColor: hm.tealSoft }}>
          <HT size={14} weight="500" color={hm.teal} style={{ flex: 1 }}>Can't find your food?</HT>
          <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: hm.teal, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="arrow-forward" size={14} color="#fff" />
          </View>
        </Pressable>
      ) : null}
    </View>
  );
}
