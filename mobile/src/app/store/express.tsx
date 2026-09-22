import { useEffect, useMemo, useState } from "react";
import { Image, Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { bestsellers, products } from "@f7/content";
import { store as sc } from "@/theme/ThemeProvider";
import { productImage } from "@/lib/storeImages";
import { DealCard } from "@/components/ProductCard";
import { ST, StoreBar, StoreHeader } from "@/components/StoreUI";

/**
 * F7 Express (cultXpress, v4 t=104–110): a pink splash with the stopwatch
 * mark for 1.5 s, then "Next day delivery available in Dharmapuri ⌃" with a
 * city radio list, a dark NEXT DAY DELIVERY hero band and a 3×2 product grid.
 */

const CITIES = ["Dharmapuri", "Salem", "Other"] as const;

export default function ExpressPage() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [splash, setSplash] = useState(true);
  const [open, setOpen] = useState(true);
  const [city, setCity] = useState<(typeof CITIES)[number]>("Dharmapuri");
  const items = useMemo(() => bestsellers().concat(products).filter((p, i, a) => a.indexOf(p) === i).slice(0, 6), []);
  const tile = (width - 24 - 16) / 3;

  useEffect(() => {
    const t = setTimeout(() => setSplash(false), 1500);
    return () => clearTimeout(t);
  }, []);

  if (splash) {
    return (
      <LinearGradient colors={["#7a3fb0", "#e6215f", "#ff5a7a"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <StatusBar style="light" />
        <Ionicons name="stopwatch-outline" size={64} color="#fff" />
        <Text style={{ color: "#fff", fontSize: 28, fontWeight: "900", fontStyle: "italic", marginTop: 10 }}>F7 Express</Text>
        <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 12, letterSpacing: 2, marginTop: 6 }}>NEXT DAY DELIVERY</Text>
      </LinearGradient>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: sc.bg }}>
      <StatusBar style="dark" />
      <StoreHeader />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Pressable onPress={() => setOpen((v) => !v)} accessibilityRole="button" accessibilityLabel="Change city" style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, minHeight: 44 }}>
          <Ionicons name="location-outline" size={16} color={sc.ink} />
          <ST size={13} style={{ flex: 1 }}>Next day delivery available in <ST size={13} weight="800">{city}</ST></ST>
          <Ionicons name={open ? "chevron-up" : "chevron-down"} size={16} color={sc.ink} />
        </Pressable>
        {open ? CITIES.map((c) => {
          const on = c === city;
          return (
            <Pressable key={c} onPress={() => { setCity(c); setOpen(false); }} accessibilityRole="radio" accessibilityState={{ selected: on }} accessibilityLabel={c} style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, minHeight: 40, backgroundColor: on ? sc.bg2 : sc.bg }}>
              <View style={{ width: 16, height: 16, borderRadius: 8, borderWidth: 1.5, borderColor: sc.ink, alignItems: "center", justifyContent: "center" }}>
                {on ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: sc.ink }} /> : null}
              </View>
              <ST size={13} weight={on ? "800" : "500"}>{c}</ST>
            </Pressable>
          );
        }) : null}

        <LinearGradient colors={["#1b1240", "#3b1a5a", "#1b1240"]} style={{ height: 150, marginTop: 8, alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          <View style={{ position: "absolute", bottom: -80, left: -40, right: -40, height: 160, borderRadius: 300, backgroundColor: "#0f0a2a" }} />
          {[[30, 20], [90, 60], [300, 30], [340, 80], [200, 15]].map(([x, y]) => <View key={`${x}-${y}`} style={{ position: "absolute", left: x, top: y, width: 3, height: 3, borderRadius: 2, backgroundColor: "#fff" }} />)}
          <Ionicons name="bus-outline" size={34} color="#fff" />
          <Text style={{ color: "#fff", fontSize: 22, fontWeight: "900", letterSpacing: 1.5, marginTop: 4 }}>NEXT DAY DELIVERY</Text>
          <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 11 }}>{city === "Other" ? "Available soon in your city" : `Order by 6 PM · at your door in ${city} tomorrow`}</Text>
        </LinearGradient>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 12, marginTop: 12, backgroundColor: sc.bg }}>
          {items.map((p) => (
            <Pressable key={p.id} onPress={() => router.push({ pathname: "/store/product/[id]", params: { id: p.id } })} accessibilityRole="button" accessibilityLabel={p.name} style={({ pressed }) => [{ width: tile }, pressed && { opacity: 0.8 }]}>
              <View style={{ width: tile, height: tile * 1.1, borderRadius: 4, overflow: "hidden", backgroundColor: sc.bg2 }}>
                <Image source={productImage(p.image)} style={{ width: tile, height: tile * 1.1 }} resizeMode="cover" />
                <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.55)", paddingHorizontal: 6, paddingVertical: 4 }}>
                  <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700" }} numberOfLines={1}>{p.name}</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        <ST size={17} weight="800" style={{ paddingHorizontal: 12, marginTop: 22, marginBottom: 10 }}>Ships tomorrow</ST>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, gap: 10 }}>
          {items.map((p) => <DealCard key={p.id} p={p} width={150} />)}
        </ScrollView>
      </ScrollView>
      <StoreBar active="express" />
    </View>
  );
}
