import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { bestsellers, cartMilestones, coupons, dealProducts, delivery, deliveryInstructions, inr, products, productsIn, tipOptions } from "@f7/content";
import { store as sc } from "@/theme/ThemeProvider";
import { useCart } from "@/state/cart";
import { prettyPhone, useSession } from "@/state/session";
import { ProductRail, ProductRow } from "@/components/ProductCard";
import { BackHeader, IconButton, ST, StoreButton, StorePane } from "@/components/StoreUI";

/**
 * Zepto cart, section for section (v1 t=34–47, 71–98): saved strip, coupons,
 * delivering-in + item rows, free-delivery milestones, rails, bill summary,
 * savings, special offers, tip | instructions, ordering-for, and the sticky
 * "I don't need a bag" + To Pay | Instant Order | Pay Now footer.
 */

function PaneTitle({ icon, title, right }: { icon?: keyof typeof Ionicons.glyphMap; title: string; right?: React.ReactNode }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 }}>
      {icon ? <Ionicons name={icon} size={18} color={sc.ink} /> : null}
      <ST size={15} weight="800" style={{ flex: 1 }}>{title}</ST>
      {right}
    </View>
  );
}

function Rail({ title, items, sponsored, sub, heart }: { title: string; items: typeof products; sponsored?: boolean; sub?: string; heart?: boolean }) {
  return (
    <StorePane padding={0} style={{ marginTop: 12, paddingVertical: 14 }}>
      <View style={{ paddingHorizontal: 14, marginBottom: 10, flexDirection: "row", alignItems: "center", gap: 8 }}>
        {sponsored ? (
          <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: "#111", alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: "#fff", fontSize: 10, fontWeight: "900" }}>F7</Text>
          </View>
        ) : null}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <ST size={15} weight="800">{title}</ST>
            {heart ? <Ionicons name="heart" size={14} color={sc.pink} /> : null}
          </View>
          {sub ? <ST size={11} muted>{sub}</ST> : null}
        </View>
      </View>
      <ProductRail items={items} width={130} />
    </StorePane>
  );
}

export default function CartPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const cart = useCart();
  const { member } = useSession();
  const { bill, items } = cart;
  const [tab, setTab] = useState<"tip" | "instructions">("tip");
  const [customTip, setCustomTip] = useState(false);
  const [scheduled, setScheduled] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);

  const steal = useMemo(() => dealProducts().slice(0, 8), []);
  const like = useMemo(() => bestsellers().slice(0, 8), []);
  const bites = useMemo(() => productsIn("nutrition").filter((p) => p.priceINR < 400), []);
  const nutrition = useMemo(() => productsIn("nutrition").filter((p) => p.priceINR >= 400), []);
  const drops = useMemo(() => products.filter((p) => p.tag === "deal" || p.tag === "new").slice(0, 8), []);
  const name = member?.name?.trim() || "Member";
  const phone = prettyPhone(member?.phone) || "add phone";

  if (cart.ready && items.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: sc.bg }}>
        <StatusBar style="dark" />
        <BackHeader title="Cart" />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 12 }}>
          <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: sc.bg2, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="cart-outline" size={56} color={sc.muted} />
          </View>
          <ST size={20} weight="800" center>Your cart is empty</ST>
          <ST size={13} muted center>Add whey, gear or apparel and we'll deliver in {delivery.etaMinutes} mins.</ST>
          <StoreButton label="Browse the store" onPress={() => router.replace("/(tabs)/store")} style={{ marginTop: 8, alignSelf: "stretch" }} />
          {cart.orders.length ? <StoreButton label="Your orders" tone="outline" onPress={() => router.push("/store/orders")} style={{ alignSelf: "stretch" }} /> : null}
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: sc.bg2 }}>
      <StatusBar style="dark" />
      <View style={{ backgroundColor: sc.bg }}>
        <BackHeader
          title={
            <View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
                <ST size={13} weight="800">Home</ST>
                <Ionicons name="chevron-down" size={12} color={sc.ink} />
              </View>
              <ST size={11} muted numberOfLines={1}>{name} · {delivery.storeLine}</ST>
            </View>
          }
          right={<IconButton icon="heart-outline" label="Wishlist" onPress={() => router.push("/(tabs)/store")} />}
        />
      </View>
      <Pressable onPress={() => setSavedOpen((v) => !v)} accessibilityRole="button" accessibilityLabel="Savings on this order" style={{ backgroundColor: sc.greenSoft, paddingVertical: 6, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 4 }}>
        <ST size={12} color={sc.green}>Yay! You <ST size={12} weight="800" color={sc.green}>saved {inr(bill.savedINR)}</ST> on this order</ST>
        <Ionicons name={savedOpen ? "chevron-up" : "chevron-down"} size={12} color={sc.green} />
      </Pressable>
      {savedOpen ? (
        <View style={{ backgroundColor: sc.greenSoft, paddingHorizontal: 16, paddingBottom: 8 }}>
          <ST size={11} color={sc.green} center>Discount on MRP {inr(bill.discountINR)} · Handling {inr(delivery.handlingINR)}{bill.deliveryWaived ? ` · Delivery ${inr(delivery.feeINR)}` : ""}{bill.couponINR ? ` · Coupon ${inr(bill.couponINR)}` : ""}</ST>
        </View>
      ) : null}

      <ScrollView contentContainerStyle={{ paddingTop: 12, paddingBottom: 150 }}>
        {/* Coupons & offers */}
        <StorePane>
          <PaneTitle title="Coupons & offers" />
          {coupons.map((c, i) => {
            const short = Math.max(0, c.minOrderINR - bill.itemsINR);
            const applied = cart.coupon === c.code;
            return (
              <View key={c.code} style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, borderTopWidth: i ? 1 : 0, borderTopColor: sc.line }}>
                <View style={{ width: 26, height: 26, borderRadius: 6, backgroundColor: c.kind === "payment" ? "#111" : sc.greenSoft, alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name={c.kind === "payment" ? "card-outline" : "checkmark-circle"} size={16} color={c.kind === "payment" ? "#fff" : sc.green} />
                </View>
                <View style={{ flex: 1 }}>
                  <ST size={13} weight="700">{c.title}</ST>
                  <ST size={11} color={short > 0 ? "#b0641c" : sc.green}>{short > 0 ? `Shop for ${inr(short)} more to apply` : applied ? `${inr(c.offINR)} off applied` : c.detail}</ST>
                  <Pressable onPress={() => router.push("/(tabs)/store")} accessibilityRole="link" accessibilityLabel="View all coupons"><ST size={11} muted style={{ marginTop: 2 }}>View all {c.kind === "payment" ? "payment offers" : "coupons"} ›</ST></Pressable>
                </View>
                {short > 0 ? (
                  <View style={{ backgroundColor: sc.bg2, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5 }}><ST size={11} weight="700" muted>Locked</ST></View>
                ) : (
                  <Pressable onPress={() => cart.applyCoupon(applied ? null : c.code)} accessibilityRole="button" accessibilityLabel={applied ? "Remove coupon" : "Apply coupon"} style={{ borderWidth: 1, borderColor: sc.pink, backgroundColor: applied ? sc.pink : sc.bg, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5, minHeight: 28 }}>
                    <ST size={11} weight="800" color={applied ? "#fff" : sc.pink}>{applied ? "Applied" : "Apply"}</ST>
                  </Pressable>
                )}
              </View>
            );
          })}
        </StorePane>

        {/* Delivering in */}
        <StorePane style={{ marginTop: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Ionicons name="time-outline" size={22} color={sc.ink} />
            <View style={{ flex: 1 }}>
              <ST size={15} weight="800">{scheduled ? "Scheduled · tomorrow 9 AM" : `Delivering in ${delivery.etaMinutes} mins`}</ST>
              <ST size={11} muted>{bill.count} item{bill.count === 1 ? "" : "s"}</ST>
            </View>
            <Pressable onPress={() => setScheduled((v) => !v)} accessibilityRole="button" accessibilityLabel="Schedule delivery" style={{ flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderColor: sc.gold, backgroundColor: sc.goldSoft, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 5 }}>
              <Ionicons name="calendar-outline" size={12} color="#9a6b00" />
              <ST size={11} weight="700" color="#9a6b00">{scheduled ? "Now" : "Schedule"}</ST>
            </Pressable>
          </View>
          <View style={{ marginTop: 6 }}>
            {items.map((x) => <ProductRow key={x.product.id} p={x.product} qty={x.qty} />)}
          </View>
          <Pressable onPress={() => router.replace("/(tabs)/store")} accessibilityRole="button" accessibilityLabel="Add more items" style={{ alignItems: "center", paddingTop: 10, borderTopWidth: 1, borderTopColor: sc.line, flexDirection: "row", justifyContent: "center", gap: 4 }}>
            <ST size={12}>Forgot something?</ST>
            <ST size={12} weight="800" color={sc.pink}>Add More Items</ST>
          </Pressable>
        </StorePane>

        {/* Milestones */}
        <StorePane style={{ marginTop: 12 }}>
          <ST size={14} weight="800">{bill.toFreeDeliveryINR > 0 ? `Shop ${inr(bill.toFreeDeliveryINR)} more, Unlock Free Delivery` : nextMilestone(bill.itemsINR)}</ST>
          <View style={{ marginTop: 16, marginHorizontal: 14 }}>
            <View style={{ height: 3, backgroundColor: sc.line, borderRadius: 2 }}>
              <View style={{ height: 3, width: `${Math.min(100, (bill.itemsINR / cartMilestones[cartMilestones.length - 1].atINR) * 100)}%`, backgroundColor: sc.green, borderRadius: 2 }} />
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: -11 }}>
              {cartMilestones.map((m) => {
                const on = bill.itemsINR >= m.atINR;
                return (
                  <View key={m.atINR} style={{ alignItems: "center", width: 70 }}>
                    <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: on ? sc.green : sc.bg, borderWidth: 2, borderColor: sc.green, alignItems: "center", justifyContent: "center" }}>
                      <Ionicons name="checkmark" size={12} color={on ? "#fff" : sc.green} />
                    </View>
                    <ST size={10} weight="800" center style={{ marginTop: 6 }}>{m.label}</ST>
                    <ST size={9} muted center>{on && m.atINR === 999 ? "Auto applied" : m.sub}</ST>
                  </View>
                );
              })}
            </View>
          </View>
        </StorePane>

        <Rail title="Steal Deals" items={steal} />
        <Rail title="You might also like" items={like} heart />
        <Rail title="Last-minute cravings?" sub="Add a quick bite before you check out!" items={bites} />
        <Rail title="F7 Nutrition" sub="Sponsored" items={nutrition} sponsored />
        <Rail title="Price Drop Alert" items={drops} />

        {/* Bill summary */}
        <StorePane style={{ marginTop: 12 }}>
          <PaneTitle icon="receipt-outline" title="Bill Summary" />
          <BillRow label="Item Total" strike={inr(bill.mrpINR)} value={inr(bill.itemsINR)} />
          <BillRow label="Delivery Fee" strike={bill.deliveryWaived ? inr(delivery.feeINR) : undefined} value={bill.deliveryWaived ? "FREE" : inr(delivery.feeINR)} green={bill.deliveryWaived} sub={bill.deliveryWaived ? undefined : `Free above ${inr(delivery.freeAboveINR)} (Unlock by adding ${inr(bill.toFreeDeliveryINR)} more)`} />
          <BillRow label="Handling Fee" strike={inr(delivery.handlingINR)} value="FREE" green />
          {bill.couponINR ? <BillRow label={`Coupon ${cart.coupon}`} value={`- ${inr(bill.couponINR)}`} green /> : null}
          {bill.tipINR ? <BillRow label="Tip for delivery partner" value={inr(bill.tipINR)} /> : null}
          <View style={{ flexDirection: "row", alignItems: "center", paddingTop: 10, marginTop: 4, borderTopWidth: 1, borderTopColor: sc.line }}>
            <ST size={14} weight="800" style={{ flex: 1 }}>To Pay</ST>
            <ST size={12} muted strike style={{ marginRight: 6 }}>{inr(bill.mrpINR + delivery.feeINR + delivery.handlingINR + bill.tipINR)}</ST>
            <ST size={16} weight="900">{inr(bill.toPayINR)}</ST>
          </View>
        </StorePane>

        {/* Savings */}
        <StorePane padding={0} style={{ marginTop: 12, overflow: "hidden" }}>
          <View style={{ backgroundColor: sc.greenSoft, paddingHorizontal: 14, paddingVertical: 10, flexDirection: "row", alignItems: "center" }}>
            <ST size={14} weight="800" style={{ flex: 1 }}>Savings on this order</ST>
            <View style={{ backgroundColor: sc.green, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}><ST size={13} weight="900" color="#fff">{inr(bill.savedINR)}</ST></View>
          </View>
          <View style={{ padding: 14, gap: 10 }}>
            <SaveRow icon="pricetag" label="Discount on MRP" value={inr(bill.discountINR)} />
            {bill.deliveryWaived ? <SaveRow icon="bicycle" label="FREE delivery savings" value={inr(delivery.feeINR)} /> : null}
            <SaveRow icon="cube" label="Savings on Handling fee" value={inr(delivery.handlingINR)} />
            {bill.couponINR ? <SaveRow icon="ticket" label={`Coupon ${cart.coupon}`} value={inr(bill.couponINR)} /> : null}
          </View>
        </StorePane>

        {/* Special offers */}
        <View style={{ marginTop: 12, marginHorizontal: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <Ionicons name="sparkles" size={16} color={sc.pink} />
            <ST size={15} weight="800">Special offers for you</ST>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            {[
              { t: "Steal Deals", s: "UNLOCKED", c: "#efe6ff", id: "recovery" },
              { t: "Members' Whey", s: "₹2,199 / kg", c: "#fde4ec", id: "nutrition" },
              { t: "Buy 2 Save 10%", s: "APPAREL", c: "#e5f1ff", id: "mens" },
            ].map((o) => (
              <Pressable key={o.t} onPress={() => router.push({ pathname: "/store/category/[id]", params: { id: o.id } })} accessibilityRole="button" accessibilityLabel={o.t} style={{ width: 200, height: 80, borderRadius: 10, backgroundColor: o.c, padding: 12, justifyContent: "center" }}>
                <ST size={15} weight="900">{o.t}</ST>
                <ST size={10} weight="800" muted>{o.s}</ST>
                <View style={{ position: "absolute", right: 10, top: 10, backgroundColor: "#111", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 }}><ST size={10} weight="800" color="#fff">Select</ST></View>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Tip | Delivery instructions */}
        <StorePane padding={0} style={{ marginTop: 12, overflow: "hidden" }}>
          <View style={{ flexDirection: "row", backgroundColor: sc.bg2, margin: 6, borderRadius: 20, padding: 3 }}>
            {(["tip", "instructions"] as const).map((t) => (
              <Pressable key={t} onPress={() => setTab(t)} accessibilityRole="tab" accessibilityState={{ selected: tab === t }} accessibilityLabel={t === "tip" ? "Give a Tip" : "Delivery Instructions"} style={{ flex: 1, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: tab === t ? sc.ink : "transparent" }}>
                <ST size={12} weight="800" color={tab === t ? "#fff" : sc.ink}>{t === "tip" ? "Give a Tip" : "Delivery Instructions"}</ST>
              </Pressable>
            ))}
          </View>
          {tab === "tip" ? (
            <View style={{ padding: 14 }}>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <ST size={14} weight="800">Tip Delivery Partner</ST>
                  <ST size={11} muted style={{ marginTop: 4 }}>Help them earn a little extra for their effort. 100% of this tip will go to them.</ST>
                  <ST size={10} muted style={{ marginTop: 6 }}>Delivery Partner Safety</ST>
                </View>
                <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: sc.pinkSoft, alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name="bicycle" size={32} color={sc.pink} />
                </View>
              </View>
              <View style={{ flexDirection: "row", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                {tipOptions.map((t, i) => {
                  const on = cart.tipINR === t && !customTip;
                  return (
                    <Pressable key={t} onPress={() => { setCustomTip(false); cart.setTip(on ? 0 : t); }} accessibilityRole="button" accessibilityLabel={`Tip ${inr(t)}`} style={{ flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderColor: on ? sc.pink : sc.line, backgroundColor: on ? sc.pinkSoft : sc.bg, borderRadius: 8, paddingHorizontal: 12, minHeight: 36, justifyContent: "center" }}>
                      <Text style={{ fontSize: 13 }}>{["🪙", "🍩", "🍕"][i]}</Text>
                      <ST size={13} weight="700">{inr(t)}</ST>
                    </Pressable>
                  );
                })}
                <Pressable onPress={() => setCustomTip((v) => !v)} accessibilityRole="button" accessibilityLabel="Custom tip" style={{ flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderColor: customTip ? sc.pink : sc.line, backgroundColor: customTip ? sc.pinkSoft : sc.bg, borderRadius: 8, paddingHorizontal: 12, minHeight: 36, justifyContent: "center" }}>
                  <Text style={{ fontSize: 13 }}>🤝</Text>
                  <ST size={13} weight="700">Custom</ST>
                </Pressable>
              </View>
              {customTip ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10, borderWidth: 1, borderColor: sc.line, borderRadius: 8, paddingHorizontal: 12, height: 42 }}>
                  <ST size={14} weight="800">₹</ST>
                  <TextInput keyboardType="number-pad" placeholder="Enter amount" placeholderTextColor={sc.muted} defaultValue={cart.tipINR ? String(cart.tipINR) : ""} onChangeText={(v) => cart.setTip(Math.max(0, Math.min(500, Number(v.replace(/[^0-9]/g, "")) || 0)))} style={{ flex: 1, fontSize: 14, color: sc.ink }} accessibilityLabel="Custom tip amount" />
                </View>
              ) : null}
            </View>
          ) : (
            <View style={{ flexDirection: "row", gap: 8, padding: 14 }}>
              {deliveryInstructions.map((d) => {
                const on = cart.instructions.includes(d.id);
                return (
                  <Pressable key={d.id} onPress={() => cart.toggleInstruction(d.id)} accessibilityRole="checkbox" accessibilityState={{ checked: on }} accessibilityLabel={d.label} style={{ flex: 1, minHeight: 74, borderWidth: 1, borderColor: on ? sc.pink : sc.line, backgroundColor: on ? sc.pinkSoft : sc.bg, borderRadius: 8, alignItems: "center", justifyContent: "center", padding: 6, gap: 6 }}>
                    <Ionicons name={d.icon} size={20} color={on ? sc.pink : sc.ink} />
                    <ST size={9} weight="600" center>{d.label}</ST>
                  </Pressable>
                );
              })}
            </View>
          )}
        </StorePane>

        {/* Ordering for */}
        <StorePane style={{ marginTop: 12, flexDirection: "row", alignItems: "center" }}>
          <ST size={13} style={{ flex: 1 }}>Ordering for <ST size={13} weight="800" color={sc.pink}>{name}</ST>, {phone}</ST>
          <Pressable onPress={() => router.push("/store/account")} accessibilityRole="button" accessibilityLabel="Edit contact"><ST size={12} weight="800" color={sc.pink}>Edit</ST></Pressable>
        </StorePane>
      </ScrollView>

      {/* Sticky footer */}
      <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: sc.bg, borderTopWidth: 1, borderTopColor: sc.line, paddingBottom: Math.max(insets.bottom, 10) }}>
        <Pressable onPress={() => cart.setNoBag(!cart.noBag)} accessibilityRole="checkbox" accessibilityState={{ checked: cart.noBag }} accessibilityLabel="I don't need a bag" style={{ flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: sc.greenSoft, paddingHorizontal: 14, paddingVertical: 8 }}>
          <View style={{ width: 16, height: 16, borderRadius: 3, backgroundColor: cart.noBag ? sc.pink : sc.bg, borderWidth: 1, borderColor: sc.pink, alignItems: "center", justifyContent: "center" }}>
            {cart.noBag ? <Ionicons name="checkmark" size={12} color="#fff" /> : null}
          </View>
          <ST size={12} weight="700" style={{ flex: 1 }}>I don't need a bag 🌿</ST>
          <Ionicons name="chevron-forward" size={14} color={sc.muted} />
        </Pressable>
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingTop: 10, gap: 10 }}>
          <View>
            <ST size={11} muted>To Pay</ST>
            <ST size={16} weight="900">{inr(bill.toPayINR)}</ST>
          </View>
          <Pressable onPress={() => router.push({ pathname: "/store/pay", params: { mode: "cod" } })} accessibilityRole="button" accessibilityLabel="Instant order, pay while we deliver" style={{ flex: 1, borderWidth: 1, borderColor: sc.line, borderRadius: 8, minHeight: 44, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Ionicons name="flash" size={14} color={sc.ink} />
            <View>
              <ST size={12} weight="800">Instant Order</ST>
              <ST size={9} muted>Pay while we deliver</ST>
            </View>
          </Pressable>
          <StoreButton label="Pay Now" onPress={() => router.push({ pathname: "/store/pay", params: { mode: "upi" } })} style={{ minHeight: 44, paddingHorizontal: 22 }} />
        </View>
      </View>
    </View>
  );
}

function nextMilestone(items: number) {
  const next = cartMilestones.find((m) => items < m.atINR);
  return next ? `Shop ${inr(next.atINR - items)} more, Unlock ${next.label}` : "All offers unlocked on this order";
}

function BillRow({ label, value, strike, green, sub }: { label: string; value: string; strike?: string; green?: boolean; sub?: string }) {
  return (
    <View style={{ paddingVertical: 5 }}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <ST size={13} muted style={{ flex: 1 }}>{label}</ST>
        {strike ? <ST size={12} muted strike style={{ marginRight: 6 }}>{strike}</ST> : null}
        <ST size={13} weight="700" color={green ? sc.green : sc.ink}>{value}</ST>
      </View>
      {sub ? <ST size={10} color={sc.green}>{sub}</ST> : null}
    </View>
  );
}

function SaveRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: sc.greenSoft, alignItems: "center", justifyContent: "center" }}>
        <Ionicons name={icon} size={12} color={sc.green} />
      </View>
      <ST size={13} style={{ flex: 1 }}>{label}</ST>
      <ST size={13} weight="700">{value}</ST>
    </View>
  );
}
