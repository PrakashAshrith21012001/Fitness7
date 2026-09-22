import { useState } from "react";
import { Image, Pressable, ScrollView, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { inr, offPct, type Product } from "@f7/content";
import { store as sc } from "@/theme/ThemeProvider";
import { useCart } from "@/state/cart";
import { productImage } from "@/lib/storeImages";
import { ST, shadow } from "@/components/StoreUI";

/**
 * Zepto's product surfaces, one for one:
 *
 *   Stepper      pink outlined "ADD" pill → pink filled "− 1 +"
 *   ProductCard  portrait tile: pale image with "select ›" chip + ♡, ADD over
 *                the image corner, green price badge + struck MRP, "₹X OFF",
 *                name, unit, two tiny notes
 *   DealCard     cult store's deal tile: image, BESTSELLER tag, name, ★ 4.7 |
 *                20 Reviews, price MRP % OFF, ADD
 *   ProductRow   cart line: thumb, name, unit, − n + right, price with struck MRP
 *   ProductRail  horizontal scroller of ProductCards
 *   CartPill     floating "Unlock free delivery" black pill + pink "Cart · N items"
 */

const TAG: Record<NonNullable<Product["tag"]>, { label: string; bg: string; fg: string }> = {
  select: { label: "select ›", bg: "#efe6ff", fg: "#6b3fd6" },
  bestseller: { label: "BESTSELLER", bg: "#111", fg: "#fff" },
  new: { label: "NEW", bg: sc.greenSoft, fg: sc.green },
  deal: { label: "DEAL", bg: sc.goldSoft, fg: "#9a6b00" },
};

export function Stepper({ id, compact, style }: { id: string; compact?: boolean; style?: StyleProp<ViewStyle> }) {
  const { qty, add, remove } = useCart();
  const n = qty(id);
  const h = compact ? 28 : 32;
  if (n === 0) {
    return (
      <Pressable onPress={() => add(id)} accessibilityRole="button" accessibilityLabel="Add to cart" hitSlop={8} style={({ pressed }) => [{ height: h, minWidth: compact ? 64 : 72, borderRadius: 6, borderWidth: 1, borderColor: sc.pink, backgroundColor: sc.bg, alignItems: "center", justifyContent: "center", paddingHorizontal: 12 }, shadow.card, pressed && { opacity: 0.7 }, style]}>
        <Text style={{ color: sc.pink, fontSize: 12, fontWeight: "800", letterSpacing: 0.4 }}>ADD</Text>
      </Pressable>
    );
  }
  return (
    <View style={[{ height: h, minWidth: compact ? 64 : 72, borderRadius: 6, backgroundColor: sc.pink, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 4 }, shadow.card, style]}>
      <Pressable onPress={() => remove(id)} accessibilityRole="button" accessibilityLabel="Remove one" hitSlop={8} style={{ width: 24, height: h, alignItems: "center", justifyContent: "center" }}>
        <Ionicons name="remove" size={16} color="#fff" />
      </Pressable>
      <Text style={{ color: "#fff", fontSize: 13, fontWeight: "800" }}>{n}</Text>
      <Pressable onPress={() => add(id)} accessibilityRole="button" accessibilityLabel="Add one" hitSlop={8} style={{ width: 24, height: h, alignItems: "center", justifyContent: "center" }}>
        <Ionicons name="add" size={16} color="#fff" />
      </Pressable>
    </View>
  );
}

function Heart({ size = 16 }: { size?: number }) {
  const [on, setOn] = useState(false);
  return (
    <Pressable onPress={() => setOn((v) => !v)} accessibilityRole="button" accessibilityLabel={on ? "Remove from wishlist" : "Add to wishlist"} hitSlop={8} style={{ width: 28, height: 28, alignItems: "center", justifyContent: "center" }}>
      <Ionicons name={on ? "heart" : "heart-outline"} size={size} color={on ? sc.pink : sc.muted} />
    </Pressable>
  );
}

export function PriceLine({ p, big }: { p: Product; big?: boolean }) {
  const off = p.mrpINR - p.priceINR;
  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <View style={{ backgroundColor: sc.green, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 }}>
          <Text style={{ color: "#fff", fontSize: big ? 15 : 12, fontWeight: "800" }}>{inr(p.priceINR)}</Text>
        </View>
        <ST size={big ? 13 : 11} muted strike>{inr(p.mrpINR)}</ST>
      </View>
      {off > 0 ? <ST size={big ? 12 : 10} weight="800" color={sc.pink} style={{ marginTop: 2 }}>{inr(off)} OFF</ST> : null}
    </View>
  );
}

export function ProductCard({ p, width = 160, style }: { p: Product; width?: number; style?: StyleProp<ViewStyle> }) {
  const router = useRouter();
  const tag = p.tag ? TAG[p.tag] : null;
  return (
    <View style={[{ width, backgroundColor: sc.bg }, style]}>
      <Pressable onPress={() => router.push({ pathname: "/store/product/[id]", params: { id: p.id } })} accessibilityRole="button" accessibilityLabel={p.name}>
        <View style={{ width, height: width, borderRadius: 12, backgroundColor: sc.bg2, overflow: "visible" }}>
          <Image source={productImage(p.image)} style={{ width, height: width, borderRadius: 12 }} resizeMode="cover" />
          {tag ? (
            <View style={{ position: "absolute", top: 6, left: 6, backgroundColor: tag.bg, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 }}>
              <Text style={{ color: tag.fg, fontSize: 9, fontWeight: "800" }}>{tag.label}</Text>
            </View>
          ) : null}
          <View style={{ position: "absolute", top: 2, right: 2 }}>
            <Heart />
          </View>
          <View style={{ position: "absolute", right: 6, bottom: -10 }}>
            <Stepper id={p.id} compact />
          </View>
        </View>
      </Pressable>
      <View style={{ paddingTop: 16, paddingHorizontal: 2 }}>
        <PriceLine p={p} />
        <ST size={12} weight="600" numberOfLines={2} style={{ marginTop: 5, minHeight: 32 }}>{p.name}</ST>
        <ST size={11} muted style={{ marginTop: 2 }}>{p.unit}</ST>
        {p.notes?.length ? (
          <ST size={10} color="#b0641c" numberOfLines={1} style={{ marginTop: 3 }}>{p.notes.join(" · ")}</ST>
        ) : null}
      </View>
    </View>
  );
}

/** cult store's tile: image, tag, name, rating | reviews, price MRP % OFF, ADD */
export function DealCard({ p, width = 168 }: { p: Product; width?: number }) {
  const router = useRouter();
  return (
    <View style={{ width, backgroundColor: sc.bg, borderWidth: 1, borderColor: sc.line, borderRadius: 8, overflow: "hidden" }}>
      <Pressable onPress={() => router.push({ pathname: "/store/product/[id]", params: { id: p.id } })} accessibilityRole="button" accessibilityLabel={p.name}>
        <View style={{ width, height: width * 1.1, backgroundColor: sc.bg2 }}>
          <Image source={productImage(p.image)} style={{ width, height: width * 1.1 }} resizeMode="cover" />
          {p.tag === "bestseller" ? (
            <View style={{ position: "absolute", top: 8, left: 8, backgroundColor: "#111", paddingHorizontal: 6, paddingVertical: 3 }}>
              <Text style={{ color: "#fff", fontSize: 8, fontWeight: "800", letterSpacing: 0.6 }}>BESTSELLER</Text>
            </View>
          ) : null}
        </View>
        <View style={{ padding: 10, gap: 4 }}>
          <ST size={13} weight="600" numberOfLines={1}>{p.name}</ST>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Ionicons name="star" size={11} color={sc.gold} />
            <ST size={11} weight="700">{p.rating.toFixed(1)}</ST>
            <ST size={11} muted>| {p.reviews} Reviews</ST>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <ST size={14} weight="800">{inr(p.priceINR)}</ST>
            <ST size={10} muted>MRP: <ST size={10} muted strike>{inr(p.mrpINR)}</ST></ST>
          </View>
          <ST size={11} weight="700" color={sc.pink}>{offPct(p)}% OFF</ST>
        </View>
      </Pressable>
      <View style={{ paddingHorizontal: 10, paddingBottom: 10 }}>
        <Stepper id={p.id} style={{ alignSelf: "stretch" }} />
      </View>
    </View>
  );
}

export function ProductRow({ p, qty }: { p: Product; qty: number }) {
  const router = useRouter();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 }}>
      <Pressable onPress={() => router.push({ pathname: "/store/product/[id]", params: { id: p.id } })} accessibilityRole="button" accessibilityLabel={p.name} style={{ width: 52, height: 52, borderRadius: 8, backgroundColor: sc.bg2, overflow: "hidden" }}>
        <Image source={productImage(p.image)} style={{ width: 52, height: 52 }} />
      </Pressable>
      <View style={{ flex: 1 }}>
        <ST size={13} weight="600" numberOfLines={2}>{p.name}</ST>
        <ST size={11} muted style={{ marginTop: 2 }}>{p.unit}</ST>
      </View>
      <View style={{ alignItems: "flex-end", gap: 6 }}>
        <Stepper id={p.id} compact />
        <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
          <ST size={11} muted strike>{inr(p.mrpINR * qty)}</ST>
          <ST size={13} weight="800">{inr(p.priceINR * qty)}</ST>
        </View>
      </View>
    </View>
  );
}

export function ProductRail({ items, width = 150, deal }: { items: Product[]; width?: number; deal?: boolean }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, gap: 12, paddingBottom: 6 }}>
      {items.map((p) => (deal ? <DealCard key={p.id} p={p} width={width} /> : <ProductCard key={p.id} p={p} width={width} />))}
    </ScrollView>
  );
}

/** Floating Zepto pills: black "Unlock free delivery · Shop for ₹N more" + pink "Cart · N items". Hidden when the cart is empty. */
export function CartPill({ bottom = 16 }: { bottom?: number }) {
  const router = useRouter();
  const { bill } = useCart();
  if (bill.count === 0) return null;
  const unlocked = bill.toFreeDeliveryINR === 0;
  const nextCoupon = unlocked ? Math.max(0, 1200 - bill.itemsINR) : 0;
  return (
    <View pointerEvents="box-none" style={{ position: "absolute", left: 12, right: 12, bottom, flexDirection: "row", gap: 10, alignItems: "flex-end" }}>
      <Pressable onPress={() => router.push("/store/cart")} accessibilityRole="button" accessibilityLabel="Offers" style={[{ flex: 1, backgroundColor: "#141414", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, flexDirection: "row", alignItems: "center", gap: 10 }, shadow.card]}>
        <View style={{ position: "absolute", top: -9, right: 14, backgroundColor: sc.pink, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, flexDirection: "row", alignItems: "center", gap: 2 }}>
          <Text style={{ color: "#fff", fontSize: 9, fontWeight: "800" }}>Offers</Text>
          <Ionicons name="chevron-up" size={9} color="#fff" />
        </View>
        <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" }}>
          <Ionicons name={unlocked ? "pricetag-outline" : "bicycle-outline"} size={14} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: "#fff", fontSize: 12, fontWeight: "800" }}>{unlocked ? (nextCoupon > 0 ? "Unlock extra ₹50 OFF" : "₹50 OFF applied") : "Unlock free delivery"}</Text>
          <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 10 }}>{unlocked ? (nextCoupon > 0 ? `Shop for ${inr(nextCoupon)} more` : "Free delivery + coupon on") : `Shop for ${inr(bill.toFreeDeliveryINR)} more`}</Text>
        </View>
      </Pressable>
      <Pressable onPress={() => router.push("/store/cart")} accessibilityRole="button" accessibilityLabel={`Cart, ${bill.count} items`} style={[{ backgroundColor: sc.pink, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, flexDirection: "row", alignItems: "center", gap: 8 }, shadow.card]}>
        <View style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="cart" size={16} color="#fff" />
        </View>
        <View>
          <Text style={{ color: "#fff", fontSize: 13, fontWeight: "800" }}>Cart</Text>
          <Text style={{ color: "#fff", fontSize: 10 }}>{bill.count} item{bill.count === 1 ? "" : "s"}</Text>
        </View>
      </Pressable>
    </View>
  );
}
