import { useEffect, useRef } from "react";
import { Animated, Pressable, ScrollView, View, useWindowDimensions } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { storeMenu } from "@f7/content";
import { store as sc } from "@/theme/ThemeProvider";
import { ST } from "@/components/StoreUI";

/**
 * The ☰ drawer (v4 t=98–103): a white panel sliding in from the left over a
 * dimmed store, bold section titles with grey item links. Tap outside or ×
 * to close. Items route to the matching category.
 */

function categoryFor(section: string, item: string): string {
  const s = `${section} ${item}`.toLowerCase();
  if (s.includes("women")) return "womens";
  if (s.includes("men")) return "mens";
  if (s.includes("footwear") || s.includes("sock")) return "footwear";
  if (s.includes("bottle")) return "bottles";
  if (s.includes("yoga")) return "yoga";
  if (s.includes("whey") || s.includes("creatine") || s.includes("peanut") || s.includes("bar") || s.includes("electrolyte") || s.includes("nutrition")) return "nutrition";
  if (s.includes("treadmill") || s.includes("walkpad") || s.includes("bike") || s.includes("rower") || s.includes("elliptical")) return "cardio";
  if (s.includes("weight") || s.includes("dumbbell") || s.includes("kettlebell") || s.includes("bench") || s.includes("belt") || s.includes("boxing")) return "weights";
  if (s.includes("bag") || s.includes("scale")) return "recovery";
  return "weights";
}

export default function MenuPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const panelW = Math.min(320, width * 0.82);
  const x = useRef(new Animated.Value(-panelW)).current;
  const dim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(x, { toValue: 0, duration: 220, useNativeDriver: true }),
      Animated.timing(dim, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();
  }, [x, dim]);

  const close = (after?: () => void) => {
    Animated.parallel([
      Animated.timing(x, { toValue: -panelW, duration: 180, useNativeDriver: true }),
      Animated.timing(dim, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start(() => {
      if (router.canGoBack()) router.back();
      else router.replace("/(tabs)/store");
      after?.();
    });
  };

  const go = (section: string, item: string) => {
    const id = categoryFor(section, item);
    close(() => router.push({ pathname: "/store/category/[id]", params: { id } }));
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <Animated.View style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", opacity: dim }}>
        <Pressable onPress={() => close()} style={{ flex: 1 }} accessibilityRole="button" accessibilityLabel="Close menu" />
      </Animated.View>
      <Animated.View style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: panelW, backgroundColor: sc.bg, transform: [{ translateX: x }] }}>
        <View style={{ paddingTop: insets.top + 4, paddingHorizontal: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Pressable onPress={() => close(() => router.push("/(tabs)/store"))} accessibilityRole="button" accessibilityLabel="Store home" style={{ minHeight: 44, justifyContent: "center", paddingHorizontal: 8 }}>
            <ST size={16} weight="800">Fitness 7 store</ST>
          </Pressable>
          <Pressable onPress={() => close()} accessibilityRole="button" accessibilityLabel="Close" hitSlop={8} style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="close" size={24} color={sc.ink} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}>
          {storeMenu.map((s) => (
            <View key={s.title} style={{ marginBottom: 22 }}>
              <ST size={14} weight="800" style={{ marginBottom: 8 }}>{s.title}</ST>
              {s.items.map((it) => (
                <Pressable key={it} onPress={() => go(s.title, it)} accessibilityRole="link" accessibilityLabel={it} style={({ pressed }) => [{ minHeight: 32, justifyContent: "center" }, pressed && { opacity: 0.6 }]}>
                  <ST size={13} muted>{it}</ST>
                </Pressable>
              ))}
            </View>
          ))}
          <Pressable onPress={() => close(() => router.push("/store/account"))} accessibilityRole="link" accessibilityLabel="Account" style={{ minHeight: 44, justifyContent: "center", borderTopWidth: 1, borderTopColor: sc.line }}>
            <ST size={14} weight="800">Account</ST>
          </Pressable>
          <Pressable onPress={() => close(() => router.push("/store/orders"))} accessibilityRole="link" accessibilityLabel="Orders" style={{ minHeight: 44, justifyContent: "center" }}>
            <ST size={14} weight="800">Orders</ST>
          </Pressable>
        </ScrollView>
      </Animated.View>
    </View>
  );
}
