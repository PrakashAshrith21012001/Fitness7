import { Image, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { workouts } from "@f7/content";
import { useColors } from "@/theme/ThemeProvider";
import { ActionTile, H, P, Pane, T } from "@/components/cult";
import { PressScale } from "@/components/motion";
import { GAP, GhostSmall, QuickLinks } from "@/components/FitnessShared";
import { classPhoto } from "@/lib/photos";

/** Fitness → AT HOME: the yoga hero, four tiles, and the at-home workouts list. */
export function FitnessHome() {
  const colors = useColors();
  const router = useRouter();
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
      <PressScale onPress={() => router.push("/class/yoga")} scale={0.99} accessibilityRole="button" accessibilityLabel="Yoga for everyone" style={{ height: 380 }}>
        <Image source={classPhoto("yoga")} style={{ width: "100%", height: "100%" }} resizeMode="cover" accessibilityIgnoresInvertColors />
        <LinearGradient pointerEvents="none" colors={["rgba(9,12,28,0.1)", "rgba(9,12,28,0.5)", colors.black]} locations={[0, 0.6, 1]} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />
        <View style={{ position: "absolute", left: 16, right: 16, bottom: 22, alignItems: "center" }}>
          <Text style={{ color: "#fff", fontSize: 40, lineHeight: 44, fontWeight: "900", letterSpacing: 2, textTransform: "uppercase", textAlign: "center" }}>Yoga{"\n"}<Text style={{ fontSize: 22, letterSpacing: 6 }}>for</Text> Kids</Text>
          <P style={{ color: "rgba(255,255,255,0.85)", marginTop: 8 }}>Turn screen time into wellness time</P>
          <GhostSmall label="Explore" onPress={() => router.push("/class/yoga")} style={{ marginTop: 16 }} />
        </View>
      </PressScale>

      <View style={{ flexDirection: "row", justifyContent: "space-around", paddingHorizontal: 12, marginTop: 8 }}>
        <ActionTile icon="play-outline" label={"Live\nSchedule"} width={80} onPress={() => router.push("/plan")} />
        <ActionTile icon="albums-outline" label="Programs" width={80} tint="#7aa2ff" onPress={() => router.push("/classes")} />
        <ActionTile icon="scale-outline" label={"Weight\nLoss"} width={80} tint={colors.success} onPress={() => router.push("/transform")} />
        <ActionTile icon="nutrition-outline" label={"Nutrition\nConsultation"} width={84} tint={colors.gold} onPress={() => router.push("/food")} />
      </View>

      <View style={{ marginTop: GAP, paddingHorizontal: 16 }}>
        <H size={20} style={{ marginBottom: 12 }}>Workouts at home</H>
        <View style={{ gap: 10 }}>
          {workouts.map((w) => {
            const first = w.blocks[0]?.exercises[0];
            const n = w.blocks.reduce((a, b) => a + b.exercises.length, 0);
            return (
              <Pane key={w.id} onPress={() => router.push(`/exercise/${first?.id ?? "plank"}`)} accessibilityLabel={`${w.focus}, ${w.kcal} kcal, ${n} exercises`} style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface2, alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name="play" size={18} color={colors.white} />
                </View>
                <View style={{ flex: 1 }}>
                  <T>{w.focus}</T>
                  <P style={{ marginTop: 2 }}>{w.kcal} kcal • {w.blocks.length} blocks • {n} exercises</P>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.muted} />
              </Pane>
            );
          })}
        </View>
      </View>

      <QuickLinks />
    </ScrollView>
  );
}
