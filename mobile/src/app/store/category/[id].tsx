import { useMemo } from "react";
import { ScrollView, Text, View, useWindowDimensions } from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { productsIn, storeCategories } from "@f7/content";
import { store as sc } from "@/theme/ThemeProvider";
import { CartPill, ProductCard } from "@/components/ProductCard";
import { BackHeader, IconButton, ST, StorePane } from "@/components/StoreUI";

/**
 * Category page = Zepto's "Bloom" page (v1 t=21–33): a deep-green band that
 * fades to white with the category as a big wordmark + tagline, a "Why
 * Fitness 7 …?" pane with three illustrated rows, then "High Quality …"
 * with leaf ornaments and the 2-col product grid. Floating cart pills below.
 */

const GREEN = "#1d4d2f";
const TAGLINE: Record<string, string> = {
  womens: "Made to move, made to last",
  mens: "Built for the floor",
  footwear: "Grip, bounce and go",
  recovery: "Recover faster, train harder",
  cardio: "Freshest gear for the floor",
  weights: "Iron that outlasts you",
  bottles: "Hydration, sorted",
  yoga: "Breathe, bend, balance",
  nutrition: "Fuel that counts",
};

const WHY = [
  { icon: "ribbon-outline" as const, title: "Finest quality", sub: "Every piece checked before it reaches the floor" },
  { icon: "cube-outline" as const, title: "Handled with care", sub: "Packed at the gym, delivered the same day" },
  { icon: "shield-checkmark-outline" as const, title: "Consistent quality", sub: "Rigorously tested with zero compromises" },
];

export default function CategoryPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const cat = storeCategories.find((c) => c.id === id) ?? storeCategories[0];
  const items = useMemo(() => productsIn(cat.id), [cat.id]);
  const colW = (width - 24 - 12) / 2;

  return (
    <View style={{ flex: 1, backgroundColor: sc.bg }}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <LinearGradient colors={[GREEN, GREEN, "#e9f2ea", sc.bg]} locations={[0, 0.45, 0.85, 1]} style={{ paddingBottom: 12 }}>
          <BackHeader dark title={cat.name} right={<IconButton icon="search-outline" label="Search" color="#fff" onPress={() => router.push("/(tabs)/store")} />} />
          <View style={{ alignItems: "center", paddingTop: 4, paddingBottom: 18 }}>
            <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 4 }}>
              <Text style={{ color: "#fff", fontSize: 40, fontWeight: "900", letterSpacing: -1.5, lineHeight: 44 }}>{cat.name.toLowerCase()}</Text>
              <Ionicons name="leaf" size={16} color={sc.gold} style={{ marginBottom: 10 }} />
            </View>
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600", opacity: 0.9 }}>{TAGLINE[cat.id] ?? cat.blurb}</Text>
          </View>

          <StorePane padding={0} style={{ overflow: "hidden" }}>
            <View style={{ alignItems: "center", paddingTop: 12 }}>
              <View style={{ backgroundColor: "#f4f7f4", paddingHorizontal: 14, paddingVertical: 4, borderRadius: 14 }}>
                <ST size={13} weight="800">Why <ST size={13} weight="800" color={GREEN}>Fitness 7 {cat.name}</ST>?</ST>
              </View>
            </View>
            <View style={{ padding: 14, gap: 14 }}>
              {WHY.map((w, i) => (
                <View key={w.title} style={{ flexDirection: i % 2 ? "row-reverse" : "row", alignItems: "center", gap: 12 }}>
                  <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: cat.tint, alignItems: "center", justifyContent: "center" }}>
                    <Ionicons name={w.icon} size={26} color={GREEN} />
                  </View>
                  <View style={{ flex: 1, alignItems: i % 2 ? "flex-end" : "flex-start" }}>
                    <ST size={13} weight="800">{w.title}</ST>
                    <ST size={11} muted style={{ textAlign: i % 2 ? "right" : "left" }}>{w.sub}</ST>
                  </View>
                </View>
              ))}
            </View>
          </StorePane>
        </LinearGradient>

        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 18, marginBottom: 12 }}>
          <Ionicons name="leaf-outline" size={14} color={GREEN} />
          <ST size={15} weight="800">High Quality <ST size={15} weight="800" color={GREEN}>{cat.name}</ST></ST>
          <Ionicons name="leaf-outline" size={14} color={GREEN} style={{ transform: [{ scaleX: -1 }] }} />
        </View>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, paddingHorizontal: 12 }}>
          {items.map((p) => <ProductCard key={p.id} p={p} width={colW} />)}
        </View>
        {items.length === 0 ? <ST muted center style={{ marginTop: 20 }}>Nothing in this aisle yet.</ST> : null}
      </ScrollView>
      <CartPill bottom={24} />
    </View>
  );
}
