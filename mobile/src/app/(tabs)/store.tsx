import { useMemo, useRef, useState } from "react";
import { Image, Linking, Pressable, ScrollView, Text, TextInput, View, useWindowDimensions, type NativeScrollEvent, type NativeSyntheticEvent } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { dealProducts, products, productsIn, storeBanners, storeCategories, waLink, type Product } from "@f7/content";
import { store as sc } from "@/theme/ThemeProvider";
import { productImage } from "@/lib/storeImages";
import { CartPill, DealCard, ProductCard } from "@/components/ProductCard";
import { SectionTitle, ST, StoreBar, StoreHeader, shadow } from "@/components/StoreUI";

/**
 * Store home — the cult store carbon copy (v4 t=77–89): black free-delivery
 * strip, ☰ 🔍 wordmark 🛒, PRICE DROP hero carousel, "Everything Fitness 7"
 * 3×3 grid with a WhatsApp FAB, "bigger drops, better prices" banner, Deal of
 * the Day rail, category sections, and the store's own Back · Home · Deals ·
 * Account · F7 Express bar pinned above the app tab bar.
 */

const SECTIONS: { title: string; categories: string[]; tiles: [string, string] }[] = [
  { title: "Women's Activewear", categories: ["womens"], tiles: ["New arrivals", "T-Shirts"] },
  { title: "Footwear", categories: ["footwear"], tiles: ["Trainers", "Runners"] },
  { title: "Recovery Zone", categories: ["recovery"], tiles: ["Massage Guns", "Rollers"] },
  { title: "Accessories", categories: ["bottles", "yoga", "weights"], tiles: ["Bottles", "Sports & Gym"] },
  { title: "Cardio Equipment", categories: ["cardio"], tiles: ["Walkpads", "Ropes & Bands"] },
];

export default function StoreHome() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const scroller = useRef<ScrollView>(null);
  const input = useRef<TextInput>(null);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [slide, setSlide] = useState(0);
  const [dealsY, setDealsY] = useState(0);
  const heroW = width - 24;
  const tile = (width - 24 - 16) / 3;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [] as Product[];
    return products.filter((p) => `${p.name} ${p.brand} ${p.category}`.toLowerCase().includes(q));
  }, [query]);

  const deals = useMemo(() => dealProducts(), []);
  const onHeroScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => setSlide(Math.round(e.nativeEvent.contentOffset.x / heroW));
  const openSearch = () => {
    setSearching(true);
    scroller.current?.scrollTo({ y: 0, animated: true });
    setTimeout(() => input.current?.focus(), 50);
  };
  const whatsapp = () => Linking.openURL(waLink("Hi Fitness 7! I want to order from the store. Could you help me with availability and delivery?")).catch(() => {});

  return (
    <View style={{ flex: 1, backgroundColor: sc.bg }}>
      <StatusBar style="dark" />
      <StoreHeader onSearch={openSearch} />
      <ScrollView ref={scroller} contentContainerStyle={{ paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
        {searching ? (
          <View style={{ paddingHorizontal: 12, paddingTop: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderColor: sc.line, borderRadius: 10, paddingHorizontal: 12, height: 44, backgroundColor: sc.bg2 }}>
              <Ionicons name="search-outline" size={18} color={sc.muted} />
              <TextInput ref={input} value={query} onChangeText={setQuery} placeholder='Search "whey protein"' placeholderTextColor={sc.muted} style={{ flex: 1, fontSize: 15, color: sc.ink }} accessibilityLabel="Search products" returnKeyType="search" />
              <Pressable onPress={() => { setQuery(""); setSearching(false); }} accessibilityRole="button" accessibilityLabel="Close search" hitSlop={8}>
                <Ionicons name="close-circle" size={18} color={sc.muted} />
              </Pressable>
            </View>
            {query.trim() ? (
              results.length ? (
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 14 }}>
                  {results.map((p) => <ProductCard key={p.id} p={p} width={(width - 36) / 2} />)}
                </View>
              ) : (
                <ST muted style={{ marginTop: 14 }}>No products match “{query}”.</ST>
              )
            ) : null}
          </View>
        ) : null}

        {/* PRICE DROP hero carousel */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} onMomentumScrollEnd={onHeroScroll} snapToAlignment="start" contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 14 }} snapToInterval={heroW} decelerationRate="fast">
          {storeBanners.map((b) => (
            <Pressable key={b.id} onPress={() => router.push({ pathname: "/store/category/[id]", params: { id: b.categoryId } })} accessibilityRole="button" accessibilityLabel={`${b.eyebrow}: ${b.title}`} style={{ width: heroW }}>
              <View style={{ alignItems: "center", paddingBottom: 6 }}>
                {b.id === "price-drop" ? (
                  <View style={{ alignItems: "center" }}>
                    <Text style={{ fontSize: 30, fontWeight: "900", color: sc.gold, letterSpacing: 1, lineHeight: 32 }}>PRICE</Text>
                    <Text style={{ fontSize: 30, fontWeight: "900", color: sc.ink, letterSpacing: 1, lineHeight: 32 }}>DROP</Text>
                    <Text style={{ fontSize: 9, fontWeight: "800", color: sc.ink, letterSpacing: 2 }}>• SALE •</Text>
                  </View>
                ) : (
                  <View style={{ alignItems: "center", paddingTop: 10 }}>
                    <Text style={{ fontSize: 12, fontWeight: "800", color: sc.pink, letterSpacing: 2 }}>{b.eyebrow}</Text>
                    <Text style={{ fontSize: 22, fontWeight: "900", color: sc.ink, textAlign: "center" }}>{b.title}</Text>
                  </View>
                )}
              </View>
              <View style={{ marginHorizontal: 8, borderRadius: 8, overflow: "hidden", backgroundColor: b.tint }}>
                <Image source={productImage(b.image)} style={{ width: heroW - 16, height: (heroW - 16) * 0.66 }} resizeMode="cover" />
                <View style={{ position: "absolute", top: 12, left: 0, right: 0, alignItems: "center" }}>
                  <View style={{ backgroundColor: "#fff", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 3 }}>
                    <Text style={{ fontSize: 10, fontWeight: "900", color: "#c8541f", letterSpacing: 1.5 }}>LOWEST PRICES ↘</Text>
                  </View>
                </View>
                <View style={{ position: "absolute", right: 10, bottom: 10, backgroundColor: "#111", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 3 }}>
                  <Text style={{ color: "#fff", fontSize: 9, fontWeight: "800", letterSpacing: 1 }}>{b.cta.toUpperCase()}</Text>
                </View>
              </View>
              <View style={{ marginHorizontal: 8, marginTop: 8, backgroundColor: sc.goldSoft, paddingVertical: 7, alignItems: "center", borderRadius: 3 }}>
                <Text style={{ fontSize: 11, fontWeight: "800", color: sc.ink }}>{b.sub.toUpperCase()}</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 7, marginTop: 14 }}>
          {storeBanners.map((b, i) => <View key={b.id} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: i === slide ? sc.ink : "#fff", borderWidth: 1, borderColor: sc.ink }} />)}
        </View>

        {/* Everything Fitness 7 */}
        <SectionTitle title="Everything Fitness 7" />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 12 }}>
          {storeCategories.map((c) => (
            <Pressable key={c.id} onPress={() => router.push({ pathname: "/store/category/[id]", params: { id: c.id } })} accessibilityRole="button" accessibilityLabel={c.name} style={({ pressed }) => [{ width: tile }, pressed && { opacity: 0.8 }]}>
              <View style={{ width: tile, height: tile, borderRadius: 4, overflow: "hidden", backgroundColor: c.tint }}>
                <Image source={productImage(c.image)} style={{ width: tile, height: tile }} resizeMode="cover" />
              </View>
              <ST size={11} weight="600" style={{ marginTop: 6 }} numberOfLines={1}>{c.name}</ST>
            </Pressable>
          ))}
        </View>

        {/* bigger drops banner */}
        <View style={{ marginHorizontal: 12, marginTop: 20, backgroundColor: sc.goldSoft, borderRadius: 4, paddingVertical: 14, alignItems: "center" }}>
          <Text style={{ fontSize: 22, fontStyle: "italic", fontWeight: "800", color: "#e08a00" }}>bigger drops, better prices</Text>
        </View>
        <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: 12, marginTop: 8 }}>
          <Pressable onPress={() => router.push({ pathname: "/store/category/[id]", params: { id: "womens" } })} accessibilityRole="button" accessibilityLabel="Best value guaranteed" style={{ flex: 1, height: 150, borderRadius: 4, backgroundColor: "#f4d6df", justifyContent: "flex-end", padding: 10, overflow: "hidden" }}>
            <Image source={productImage("p-tights")} style={{ position: "absolute", right: -20, top: -10, width: 130, height: 130, opacity: 0.9 }} />
            <Text style={{ fontSize: 13, fontWeight: "900", color: sc.ink }}>BEST VALUE{"\n"}GUARANTEED</Text>
            <Text style={{ fontSize: 9, fontWeight: "700", color: sc.ink, marginTop: 4 }}>MIN. 50% OFF ON NEW ARRIVALS</Text>
          </Pressable>
          <View style={{ flex: 1, gap: 8 }}>
            <Pressable onPress={() => router.push({ pathname: "/store/category/[id]", params: { id: "recovery" } })} accessibilityRole="button" accessibilityLabel="Massagers only at ₹3,499" style={{ flex: 1, borderRadius: 4, backgroundColor: "#e5f1ff", padding: 10, justifyContent: "flex-end", overflow: "hidden" }}>
              <Image source={productImage("p-massagegun")} style={{ position: "absolute", right: -10, top: -6, width: 80, height: 80 }} />
              <Text style={{ fontSize: 9, fontWeight: "700", color: sc.ink }}>FOOT & CALF MASSAGERS ONLY AT</Text>
              <Text style={{ fontSize: 13, fontWeight: "900", color: sc.ink }}>₹3,499 ONLY*</Text>
            </Pressable>
            <Pressable onPress={() => scroller.current?.scrollTo({ y: dealsY, animated: true })} accessibilityRole="button" accessibilityLabel="Clearance deals" style={{ flex: 1, borderRadius: 4, backgroundColor: sc.goldSoft, padding: 10, justifyContent: "flex-end", overflow: "hidden" }}>
              <Image source={productImage("p-shoe")} style={{ position: "absolute", right: -10, top: -6, width: 80, height: 80 }} />
              <Text style={{ fontSize: 9, fontWeight: "700", color: sc.ink }}>CLEARANCE DEALS</Text>
              <Text style={{ fontSize: 13, fontWeight: "900", color: sc.ink }}>MIN. 60% OFF</Text>
            </Pressable>
          </View>
        </View>

        {/* Deal of the Day */}
        <View onLayout={(e) => setDealsY(e.nativeEvent.layout.y)}>
          <DealRail deals={deals} />
        </View>

        {/* Sections */}
        {SECTIONS.map((s) => {
          const items = s.categories.flatMap((c) => productsIn(c));
          const cats = storeCategories.filter((c) => s.categories.includes(c.id));
          return (
            <View key={s.title}>
              <SectionTitle title={s.title} />
              <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: 12, marginBottom: 12 }}>
                {s.tiles.map((label, i) => {
                  const c = cats[Math.min(i, cats.length - 1)];
                  const img = items[i * 2]?.image ?? c.image;
                  return (
                    <Pressable key={label} onPress={() => router.push({ pathname: "/store/category/[id]", params: { id: c.id } })} accessibilityRole="button" accessibilityLabel={label} style={({ pressed }) => [{ flex: 1, height: 200, borderRadius: 4, overflow: "hidden", backgroundColor: c.tint }, pressed && { opacity: 0.85 }]}>
                      <Image source={productImage(img)} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                      <View style={{ position: "absolute", top: 10, left: 10, backgroundColor: "#fff", paddingHorizontal: 8, paddingVertical: 4 }}>
                        <ST size={13} weight="700">{label}</ST>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, gap: 10 }}>
                {items.slice(0, 6).map((p) => <DealCard key={p.id} p={p} width={150} />)}
              </ScrollView>
            </View>
          );
        })}
        <View style={{ height: 24 }} />
      </ScrollView>

      {/* WhatsApp FAB */}
      <Pressable onPress={whatsapp} accessibilityRole="button" accessibilityLabel="Order on WhatsApp" style={[{ position: "absolute", right: 14, bottom: 80, width: 46, height: 46, borderRadius: 23, backgroundColor: sc.whatsapp, alignItems: "center", justifyContent: "center" }, shadow.card]}>
        <Ionicons name="logo-whatsapp" size={26} color="#fff" />
      </Pressable>
      <CartPill bottom={74} />
      <StoreBar tab active="home" onDeals={() => scroller.current?.scrollTo({ y: dealsY, animated: true })} />
    </View>
  );
}

function DealRail({ deals }: { deals: Product[] }) {
  const ref = useRef<ScrollView>(null);
  const [x, setX] = useState(0);
  const step = 178;
  const scrollBy = (dx: number) => {
    const nx = Math.max(0, x + dx);
    setX(nx);
    ref.current?.scrollTo({ x: nx, animated: true });
  };
  return (
    <View style={{ marginTop: 22 }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 8, marginBottom: 10 }}>
        <Pressable onPress={() => scrollBy(-step * 2)} accessibilityRole="button" accessibilityLabel="Previous deals" hitSlop={8} style={{ width: 36, height: 36, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="chevron-back" size={20} color={sc.ink} />
        </Pressable>
        <ST size={17} weight="700" center style={{ flex: 1 }}>Deal of the Day - Price Drop</ST>
        <Pressable onPress={() => scrollBy(step * 2)} accessibilityRole="button" accessibilityLabel="Next deals" hitSlop={8} style={{ width: 36, height: 36, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="chevron-forward" size={20} color={sc.ink} />
        </Pressable>
      </View>
      <ScrollView ref={ref} horizontal showsHorizontalScrollIndicator={false} onMomentumScrollEnd={(e) => setX(e.nativeEvent.contentOffset.x)} contentContainerStyle={{ paddingHorizontal: 12, gap: 10 }}>
        {deals.map((p) => <DealCard key={p.id} p={p} />)}
      </ScrollView>
    </View>
  );
}
