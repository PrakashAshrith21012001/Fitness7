import { useMemo } from "react";
import { Image, Platform, ScrollView, Share, View, useWindowDimensions } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { inr, offPct, productById, products, storeCategories } from "@f7/content";
import { store as sc } from "@/theme/ThemeProvider";
import { useCart } from "@/state/cart";
import { productImage } from "@/lib/storeImages";
import { ProductRail, Stepper } from "@/components/ProductCard";
import { BackHeader, IconButton, SectionTitle, ST, StoreButton, StorePane } from "@/components/StoreUI";

/** Product page: big image, name, brand, rating, price, notes, highlights, sticky ADD, "You might also like". */
export default function ProductPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { qty, bill, add } = useCart();
  const p = productById(id ?? "") ?? products[0];
  const cat = storeCategories.find((c) => c.id === p.category);
  const also = useMemo(() => products.filter((x) => x.id !== p.id && x.category === p.category).concat(products.filter((x) => x.category !== p.category)).slice(0, 8), [p]);
  const n = qty(p.id);

  const share = () => {
    if (Platform.OS === "web") return;
    Share.share({ message: `${p.name} — ${inr(p.priceINR)} (MRP ${inr(p.mrpINR)}) at the Fitness 7 store` }).catch(() => {});
  };

  const highlights = [
    ["Brand", p.brand],
    ["Pack size", p.unit],
    ["Category", cat?.name ?? p.category],
    ["Delivery", "45 mins · pick up at the gym"],
    ["Returns", "7-day easy returns"],
  ];

  return (
    <View style={{ flex: 1, backgroundColor: sc.bg }}>
      <StatusBar style="dark" />
      <BackHeader right={<View style={{ flexDirection: "row" }}><IconButton icon="share-social-outline" label="Share" onPress={share} /><IconButton icon="cart-outline" label="Cart" badge={bill.count} onPress={() => router.push("/store/cart")} /></View>} />
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
        <View style={{ width, height: width * 0.9, backgroundColor: sc.bg2, alignItems: "center", justifyContent: "center" }}>
          <Image source={productImage(p.image)} style={{ width: width * 0.8, height: width * 0.8 }} resizeMode="contain" />
          {p.tag ? (
            <View style={{ position: "absolute", top: 12, left: 12, backgroundColor: p.tag === "select" ? "#efe6ff" : "#111", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 }}>
              <ST size={10} weight="800" color={p.tag === "select" ? "#6b3fd6" : "#fff"}>{p.tag === "select" ? "select ›" : p.tag.toUpperCase()}</ST>
            </View>
          ) : null}
        </View>
        <View style={{ padding: 16, gap: 6 }}>
          <ST size={12} muted weight="600">{p.brand}</ST>
          <ST size={20} weight="800">{p.name}</ST>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: sc.greenSoft, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
              <ST size={12} weight="800" color={sc.green}>{p.rating.toFixed(1)}</ST>
              <Ionicons name="star" size={11} color={sc.green} />
            </View>
            <ST size={12} muted>{p.reviews} reviews</ST>
          </View>
          <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8, marginTop: 6 }}>
            <ST size={26} weight="900">{inr(p.priceINR)}</ST>
            <ST size={14} muted strike style={{ marginBottom: 4 }}>MRP {inr(p.mrpINR)}</ST>
            <ST size={14} weight="800" color={sc.pink} style={{ marginBottom: 4 }}>{offPct(p)}% OFF</ST>
          </View>
          <ST size={12} muted>{p.unit} · Inclusive of all taxes</ST>
          {p.notes?.length ? (
            <View style={{ marginTop: 10, gap: 4 }}>
              {p.notes.map((nte) => (
                <View key={nte} style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                  <Ionicons name="checkmark-circle" size={16} color={sc.green} />
                  <ST size={13}>{nte}</ST>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        <StorePane style={{ marginTop: 4 }}>
          <ST size={15} weight="800" style={{ marginBottom: 8 }}>Highlights</ST>
          {highlights.map(([k, v], i) => (
            <View key={k} style={{ flexDirection: "row", paddingVertical: 8, borderTopWidth: i ? 1 : 0, borderTopColor: sc.line }}>
              <ST size={13} muted style={{ width: 110 }}>{k}</ST>
              <ST size={13} weight="600" style={{ flex: 1 }}>{v}</ST>
            </View>
          ))}
        </StorePane>

        <StorePane style={{ marginTop: 12, flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Ionicons name="bicycle-outline" size={22} color={sc.ink} />
          <View style={{ flex: 1 }}>
            <ST size={13} weight="700">Delivered in 45 mins</ST>
            <ST size={11} muted>Free delivery on orders above ₹999 · or collect at Fitness 7 Gym, Dharmapuri</ST>
          </View>
        </StorePane>

        <SectionTitle title="You might also like" />
        <ProductRail items={also} />
      </ScrollView>

      <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: sc.bg, borderTopWidth: 1, borderTopColor: sc.line, padding: 12, paddingBottom: Math.max(insets.bottom, 12), flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={{ flex: 1 }}>
          <ST size={11} muted>{n > 0 ? `${n} in cart` : "Price"}</ST>
          <ST size={18} weight="900">{inr(p.priceINR * Math.max(1, n))}</ST>
        </View>
        {n > 0 ? (
          <>
            <Stepper id={p.id} style={{ minWidth: 110, height: 44 }} />
            <StoreButton label="Go to cart" onPress={() => router.push("/store/cart")} style={{ minHeight: 44 }} />
          </>
        ) : (
          <StoreButton label="Add to cart" onPress={() => add(p.id)} icon="cart-outline" style={{ flex: 1, minHeight: 48 }} />
        )}
      </View>
    </View>
  );
}
