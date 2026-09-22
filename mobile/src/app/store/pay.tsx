import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Image, Modal, Pressable, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { inr } from "@f7/content";
import { store as sc } from "@/theme/ThemeProvider";
import { useCart, type Order } from "@/state/cart";
import { ST, StoreButton } from "@/components/StoreUI";

/**
 * Payment flow (v1 t=48–66). UPI: "Payment Processing… / Connecting with
 * your bank" → GPay sheet → processing → (demo alternates) "Payment Failed ·
 * Place your order now" or success. Back while processing asks "Go back and
 * cancel payment?". COD ("Instant Order") places the order straight away.
 */

type Phase = "processing" | "gpay" | "paying" | "failed" | "success";
let attempts = 0; // demo: odd attempts fail, even succeed

export default function PayPage() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { bill, placeOrder, items, ready } = useCart();
  const started = useRef(false);
  const [phase, setPhase] = useState<Phase>("processing");
  const [cancelAsk, setCancelAsk] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const placed = useRef(false);
  const toPay = order?.toPayINR ?? bill.toPayINR;

  const later = useCallback((fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
  }, []);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const finish = useCallback(
    async (status: Order["status"]) => {
      if (placed.current) return;
      placed.current = true;
      const o = await placeOrder(status);
      setOrder(o);
      setPhase("success");
    },
    [placeOrder],
  );

  useEffect(() => {
    // wait for the saved cart before deciding anything, and run once
    if (!ready || started.current) return;
    started.current = true;
    if (items.length === 0 && !placed.current) {
      router.replace("/store/cart");
      return;
    }
    if (mode === "cod") {
      later(() => void finish("cod"), 1200);
    } else {
      later(() => setPhase("gpay"), 2500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const pay = () => {
    setPhase("paying");
    attempts += 1;
    const fail = attempts % 2 === 1;
    later(() => (fail ? setPhase("failed") : void finish("paid")), 2200);
  };

  const onBack = () => {
    if (phase === "success") router.replace("/(tabs)/store");
    else if (phase === "failed") router.back();
    else setCancelAsk(true);
  };

  const dimmed = cancelAsk || phase === "gpay" || phase === "failed";

  return (
    <View style={{ flex: 1, backgroundColor: sc.bg }}>
      <StatusBar style="dark" />
      <View style={{ paddingTop: insets.top, height: insets.top + 48, justifyContent: "center", paddingHorizontal: 4 }}>
        <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="Back" hitSlop={8} style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="chevron-back" size={24} color={sc.ink} />
        </Pressable>
      </View>

      {phase === "success" ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 28, gap: 10 }}>
          <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: sc.greenSoft, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="checkmark-circle" size={64} color={sc.green} />
          </View>
          <ST size={22} weight="900" center style={{ marginTop: 8 }}>Order placed</ST>
          <ST size={15} weight="700" center>{inr(toPay)} · Order #{order?.id ?? "F7"}</ST>
          <ST size={13} muted center>{order?.status === "paid" ? "Paid via UPI." : "Pay while we deliver."} Delivering in 45 mins to Dharmapuri, or collect at the gym.</ST>
          <StoreButton label="Track order" onPress={() => router.replace("/store/orders")} style={{ alignSelf: "stretch", marginTop: 16 }} />
          <StoreButton label="Continue shopping" tone="outline" onPress={() => router.replace("/(tabs)/store")} style={{ alignSelf: "stretch" }} />
        </View>
      ) : (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 10, opacity: dimmed ? 0.35 : 1 }}>
          <View style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: sc.green, alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <Image source={require("@/assets/brand/logo-light.png")} style={{ width: 60, height: 30 }} resizeMode="contain" />
          </View>
          <ST size={18} weight="900" center style={{ marginTop: 12 }}>{phase === "paying" ? "Confirming payment…" : "Payment Processing…"}</ST>
          <ST size={12} muted center>{mode === "cod" ? "Placing your order" : phase === "paying" ? "Talking to GPay" : "Connecting with your bank"}</ST>
          <ActivityIndicator color={sc.pink} style={{ marginTop: 12 }} />
        </View>
      )}

      {/* GPay bottom sheet */}
      {phase === "gpay" ? (
        <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: sc.bg, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16, paddingBottom: Math.max(insets.bottom, 16), borderTopWidth: 1, borderTopColor: sc.line }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: sc.bg2, alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="logo-google" size={18} color="#4285f4" />
              </View>
              <View>
                <ST size={10} muted weight="700">PAYING VIA</ST>
                <ST size={13} weight="800">GPay UPI</ST>
              </View>
              <Ionicons name="chevron-down" size={14} color={sc.muted} />
            </View>
            <StoreButton label={`Pay ${inr(toPay)}`} onPress={pay} style={{ minHeight: 48, paddingHorizontal: 28 }} />
          </View>
        </View>
      ) : null}

      {/* Payment failed sheet */}
      {phase === "failed" ? (
        <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: sc.bg, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 24, paddingBottom: Math.max(insets.bottom, 20), alignItems: "center", gap: 8, borderTopWidth: 1, borderTopColor: sc.line }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: "#fff0e6", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="alert-circle" size={40} color="#ff7a1a" />
          </View>
          <ST size={15} weight="800" color="#ff7a1a" center>Payment Failed</ST>
          <ST size={14} weight="700" center>Place your order now. Pay online while we deliver your order.</ST>
          <StoreButton label="Place Order Now" onPress={() => void finish("cod")} style={{ alignSelf: "stretch", marginTop: 10 }} />
          <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Not now" style={{ minHeight: 44, justifyContent: "center" }}>
            <ST size={13} muted weight="700">Not now</ST>
          </Pressable>
        </View>
      ) : null}

      {/* Go back and cancel? */}
      <Modal visible={cancelAsk} transparent animationType="fade" onRequestClose={() => setCancelAsk(false)}>
        <Pressable onPress={() => setCancelAsk(false)} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" }} accessibilityLabel="Dismiss">
          <Pressable onPress={() => {}} style={{ backgroundColor: sc.bg, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 24, paddingBottom: Math.max(insets.bottom, 20), alignItems: "center", gap: 8 }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: "#fff0e6", alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="alert-circle" size={40} color="#ff7a1a" />
            </View>
            <ST size={17} weight="900" center>Go back and cancel payment?</ST>
            <ST size={12} muted center>If you go back now, your payment will be cancelled if it's not yet completed</ST>
            <StoreButton label="Go Back" onPress={() => { setCancelAsk(false); router.back(); }} style={{ alignSelf: "stretch", marginTop: 10 }} />
            <Pressable onPress={() => setCancelAsk(false)} accessibilityRole="button" accessibilityLabel="No, stay" style={{ minHeight: 44, justifyContent: "center" }}>
              <Text style={{ color: sc.pink, fontWeight: "800", fontSize: 14 }}>No</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
