import { Image, Pressable, ScrollView, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { inr, productById } from "@f7/content";
import { store as sc } from "@/theme/ThemeProvider";
import { useCart } from "@/state/cart";
import { productImage } from "@/lib/storeImages";
import { BackHeader, ST, StoreBar, StoreButton, StorePane } from "@/components/StoreUI";

/** Orders placed so far — id, date, item count, amount, status pill. */
export default function OrdersPage() {
  const router = useRouter();
  const { orders } = useCart();
  const fmt = (iso: string) => {
    const d = new Date(iso);
    return `${d.getDate()} ${d.toLocaleString("en-IN", { month: "short" })}, ${d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;
  };
  return (
    <View style={{ flex: 1, backgroundColor: sc.bg2 }}>
      <StatusBar style="dark" />
      <View style={{ backgroundColor: sc.bg }}><BackHeader title="Your Orders" /></View>
      {orders.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 10 }}>
          <View style={{ width: 110, height: 110, borderRadius: 55, backgroundColor: sc.bg, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="receipt-outline" size={50} color={sc.muted} />
          </View>
          <ST size={18} weight="800" center>No orders yet</ST>
          <ST size={13} muted center>Your store orders will show up here with their status.</ST>
          <StoreButton label="Browse the store" onPress={() => router.replace("/(tabs)/store")} style={{ alignSelf: "stretch", marginTop: 8 }} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingVertical: 12, gap: 12, paddingBottom: 40 }}>
          {orders.map((o) => {
            const count = o.lines.reduce((s, l) => s + l.qty, 0);
            const paid = o.status === "paid";
            return (
              <StorePane key={o.id}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <View style={{ flex: 1 }}>
                    <ST size={14} weight="800">Order #{o.id}</ST>
                    <ST size={11} muted>{fmt(o.placedAt)} · {count} item{count === 1 ? "" : "s"}</ST>
                  </View>
                  <View style={{ backgroundColor: paid ? sc.greenSoft : sc.goldSoft, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 }}>
                    <ST size={10} weight="800" color={paid ? sc.green : "#9a6b00"}>{paid ? "PAID · ON THE WAY" : "PAY ON DELIVERY"}</ST>
                  </View>
                </View>
                <View style={{ flexDirection: "row", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                  {o.lines.map((l) => {
                    const p = productById(l.productId);
                    if (!p) return null;
                    return (
                      <Pressable key={l.productId} onPress={() => router.push({ pathname: "/store/product/[id]", params: { id: p.id } })} accessibilityRole="button" accessibilityLabel={p.name} style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: sc.bg2, overflow: "hidden" }}>
                        <Image source={productImage(p.image)} style={{ width: 48, height: 48 }} />
                        {l.qty > 1 ? <View style={{ position: "absolute", right: 2, bottom: 2, backgroundColor: sc.ink, borderRadius: 6, paddingHorizontal: 4 }}><ST size={9} weight="800" color="#fff">×{l.qty}</ST></View> : null}
                      </Pressable>
                    );
                  })}
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: sc.line }}>
                  <ST size={12} muted style={{ flex: 1 }}>Saved {inr(o.savedINR)}{o.tipINR ? ` · Tip ${inr(o.tipINR)}` : ""}</ST>
                  <ST size={16} weight="900">{inr(o.toPayINR)}</ST>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: sc.green }} />
                  <ST size={12} weight="600" color={sc.green}>Packed at Fitness 7 Gym · arriving in 45 mins</ST>
                </View>
              </StorePane>
            );
          })}
        </ScrollView>
      )}
      <StoreBar active="account" />
    </View>
  );
}
