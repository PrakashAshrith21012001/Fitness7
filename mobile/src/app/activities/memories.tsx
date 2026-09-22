import { useMemo } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useBookings, className, type Memory } from "@/state/bookings";
import { PressScale } from "@/components/motion";
import { photo } from "@/lib/photos";
import { CENTRE, clock, monthYear, shortDay } from "@/components/BookingDates";

/**
 * Memories — the one LIGHT screen in cult's fitness flow: white page, black
 * text, "Sep 2026" month headers and a 2-column grid of 4:3 photo tiles with
 * "{class} / Mon 21 Sep, 8:00 PM, {centre}" under each.
 */
const LIGHT = { bg: "#ffffff", ink: "#111111", muted: "#6b6f7b", line: "#e6e7ec", tile: "#f0f1f4" };

export default function Memories() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { memories } = useBookings();
  const months = useMemo(() => {
    const out: { key: string; items: Memory[] }[] = [];
    for (const m of memories) {
      const key = monthYear(m.date);
      const g = out[out.length - 1];
      if (g && g.key === key) g.items.push(m);
      else out.push({ key, items: [m] });
    }
    return out;
  }, [memories]);
  const back = () => (router.canGoBack() ? router.back() : router.replace("/fitness"));

  return (
    <View style={{ flex: 1, backgroundColor: LIGHT.bg }}>
      <StatusBar style="dark" />
      <View style={{ paddingTop: insets.top + 6, paddingHorizontal: 8, paddingBottom: 10, flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: LIGHT.line }}>
        <Pressable onPress={back} accessibilityRole="button" accessibilityLabel="Back" hitSlop={10} style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="chevron-back" size={24} color={LIGHT.ink} />
        </Pressable>
        <Text style={{ flex: 1, textAlign: "center", color: LIGHT.ink, fontSize: 17, fontWeight: "800", marginRight: 40 }}>Memories</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: insets.bottom + 32 }}>
        {months.length === 0 ? (
          <View style={{ padding: 20, alignItems: "center" }}>
            <Ionicons name="camera-outline" size={36} color={LIGHT.muted} />
            <Text style={{ color: LIGHT.ink, fontSize: 16, fontWeight: "700", marginTop: 12 }}>No memories yet</Text>
            <Text style={{ color: LIGHT.muted, fontSize: 13, marginTop: 4, textAlign: "center" }}>Every class you attend leaves a photo here.</Text>
          </View>
        ) : null}
        {months.map((mo) => (
          <View key={mo.key}>
            <Text style={{ color: LIGHT.ink, fontSize: 15, fontWeight: "800", marginTop: 16, marginBottom: 10, paddingHorizontal: 4 }}>{mo.key}</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
              {mo.items.map((m) => (
                <PressScale key={m.id} onPress={() => router.push({ pathname: "/activities/memory", params: { id: m.id } })} scale={0.97} accessibilityRole="button" accessibilityLabel={`${className(m.classId)} memory, ${shortDay(m.date)}`} style={{ width: "48%", flexGrow: 1, marginBottom: 6 }}>
                  <View style={{ aspectRatio: 4 / 3, borderRadius: 6, overflow: "hidden", backgroundColor: LIGHT.tile }}>
                    <Image source={photo(m.photo)} style={{ width: "100%", height: "100%" }} resizeMode="cover" accessibilityIgnoresInvertColors />
                  </View>
                  <Text style={{ color: LIGHT.ink, fontSize: 12, fontWeight: "800", marginTop: 6 }} numberOfLines={1}>{className(m.classId)}</Text>
                  <Text style={{ color: LIGHT.muted, fontSize: 11, lineHeight: 15 }} numberOfLines={2}>
                    {shortDay(m.date)}, {clock(m.time)}, {CENTRE}
                  </Text>
                </PressScale>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
