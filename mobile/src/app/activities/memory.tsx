import { Image, Platform, Pressable, Share, Text, View, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useBookings, className } from "@/state/bookings";
import { PressScale } from "@/components/motion";
import { photo } from "@/lib/photos";
import { P } from "@/components/cult";
import { clock } from "@/components/BookingDates";

/**
 * One memory, full screen — cult's black page: × top-right, the photo centred
 * with a #WEAREFITNESS7 watermark bottom-left and "CLASS | DATE | TIME" in
 * tiny caps bottom-right, and a wide pink gradient SHARE MEMORY pill.
 */
export default function MemoryScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { memories } = useBookings();
  const memory = memories.find((m) => m.id === id || m.bookingId === id);
  const close = () => (router.canGoBack() ? router.back() : router.replace("/activities"));

  const dateStamp = (iso: string) => {
    const [y, m, d] = iso.split("-");
    return `${d}.${m}.${y}`;
  };

  const share = async () => {
    if (!memory) return;
    const text = `${className(memory.classId).toUpperCase()} at Fitness 7 — ${dateStamp(memory.date)} · ${clock(memory.time)}. #WEAREFITNESS7`;
    if (Platform.OS === "web") {
      const nav = typeof navigator !== "undefined" ? (navigator as Navigator & { share?: (d: { text: string }) => Promise<void> }) : undefined;
      if (nav?.share) await nav.share({ text }).catch(() => {});
      return;
    }
    await Share.share({ message: text }).catch(() => {});
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <StatusBar style="light" />
      <Pressable onPress={close} accessibilityRole="button" accessibilityLabel="Close" hitSlop={10} style={{ position: "absolute", top: insets.top + 8, right: 12, width: 44, height: 44, alignItems: "center", justifyContent: "center", zIndex: 2 }}>
        <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="close" size={16} color="#fff" />
        </View>
      </Pressable>

      <View style={{ flex: 1, justifyContent: "center" }}>
        {memory ? (
          <View style={{ width, aspectRatio: 4 / 3, backgroundColor: "#111" }}>
            <Image source={photo(memory.photo)} style={{ width: "100%", height: "100%" }} resizeMode="cover" accessibilityIgnoresInvertColors accessibilityLabel={`${className(memory.classId)} class photo`} />
            <LinearGradient colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.6)"]} style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 60 }} />
            <Text style={{ position: "absolute", left: 12, bottom: 8, color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: "800", fontStyle: "italic", letterSpacing: 0.5 }}>#WEAREFITNESS7</Text>
            <Text style={{ position: "absolute", right: 12, bottom: 10, color: "rgba(255,255,255,0.85)", fontSize: 7, fontWeight: "700", letterSpacing: 0.6, textTransform: "uppercase" }}>
              {className(memory.classId)} | {dateStamp(memory.date)} | {clock(memory.time)}
            </Text>
          </View>
        ) : (
          <P style={{ textAlign: "center" }}>This memory isn't here any more.</P>
        )}
      </View>

      <View style={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 20 }}>
        <PressScale onPress={share} disabled={!memory} scale={0.97} accessibilityRole="button" accessibilityLabel="Share memory">
          <LinearGradient colors={["#ff3e6c", "#ff6b6b"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ minHeight: 46, borderRadius: 999, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: "#fff", fontSize: 13, fontWeight: "800", letterSpacing: 1.2 }}>SHARE MEMORY</Text>
          </LinearGradient>
        </PressScale>
      </View>
    </View>
  );
}
