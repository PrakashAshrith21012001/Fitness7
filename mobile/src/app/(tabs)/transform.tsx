import { useState } from "react";
import { Image, Linking, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { brand, faqs, trainers, transformCopy, wa } from "@f7/content";
import { useColors } from "@/theme/ThemeProvider";
import { CultButton, H, Label, NavyPage, P, Pane, Segmented, T } from "@/components/cult";
import { PressScale } from "@/components/motion";
import { TodayTile } from "@/components/TodayTile";
import { GAP, GhostSmall } from "@/components/FitnessShared";
import { classPhoto } from "@/lib/photos";

/**
 * Transform — cult's Weight Loss tab: "Weight Loss · TALK TO US", the
 * AT-HOME / AT-CENTRE / ONLINE PT tabs, the PRICE DROP SALE hero, the gift
 * card line, EXPLORE … PLUS, WHAT YOU GET, and the sticky TALK TO US |
 * EXPLORE PLANS bar. Nutrition is part of Transform, so the calorie
 * tracker's Today tile sits here too.
 */
type Tab = (typeof transformCopy.tabs)[number]["id"];

const ICONS: (keyof typeof Ionicons.glyphMap)[] = ["scale-outline", "clipboard-outline", "nutrition-outline", "trending-up-outline"];

export default function Transform() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("home");
  const [open, setOpen] = useState<string | null>(null);
  const coach = trainers[0];
  const talk = () => Linking.openURL(wa.personalTraining()).catch(() => {});

  const heroPhoto = tab === "centre" ? classPhoto("personal") : tab === "online" ? classPhoto("yoga") : classPhoto("hiit");
  const heroSub = tab === "centre" ? "Coach-led sessions on the floor" : tab === "online" ? "1:1 video sessions, your schedule" : "Follow-along workouts, coach on WhatsApp";

  const header = (
    <View style={{ paddingHorizontal: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", height: 48 }}>
        <H size={20}>Weight Loss</H>
        <Pressable onPress={talk} accessibilityRole="button" accessibilityLabel="Talk to us on WhatsApp" hitSlop={10} style={{ minHeight: 44, justifyContent: "center" }}>
          <Text style={{ color: colors.white, fontWeight: "800", fontSize: 12, letterSpacing: 1 }}>TALK TO US</Text>
        </Pressable>
      </View>
      <Segmented<Tab> items={transformCopy.tabs.map((t) => ({ id: t.id, label: t.label }))} value={tab} onChange={setTab} />
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <NavyPage header={header} contentStyle={{ paddingBottom: insets.bottom + 170 }}>
        {/* ---------- hero ---------- */}
        <View style={{ height: 400 }}>
          <Image source={heroPhoto} style={{ width: "100%", height: "100%" }} resizeMode="cover" accessibilityIgnoresInvertColors />
          <LinearGradient pointerEvents="none" colors={["rgba(9,12,28,0.1)", "rgba(9,12,28,0.35)", colors.black]} locations={[0, 0.55, 1]} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />
          <View style={{ position: "absolute", right: 16, top: 40, alignItems: "flex-end" }}>
            <Text style={{ color: colors.gold, fontSize: 44, lineHeight: 44, fontWeight: "900", letterSpacing: -1, fontStyle: "italic" }}>PRICE</Text>
            <Text style={{ color: "#fff", fontSize: 44, lineHeight: 44, fontWeight: "900", letterSpacing: -1, fontStyle: "italic" }}>DROP</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 }}>
              <View style={{ width: 22, height: 1, backgroundColor: "#fff" }} />
              <Text style={{ color: "#fff", fontSize: 12, fontWeight: "800", letterSpacing: 3 }}>SALE</Text>
              <View style={{ width: 22, height: 1, backgroundColor: "#fff" }} />
            </View>
          </View>
          <View style={{ position: "absolute", left: 16, right: 16, bottom: 16, alignItems: "center" }}>
            <P style={{ color: "rgba(255,255,255,0.8)" }}>{heroSub}</P>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700", textAlign: "center", marginTop: 8 }}>
              ₹800 <Text style={{ fontWeight: "900" }}>gift card</Text>
              {"\n"}+ FREE 1-Month Extension
            </Text>
            <GhostSmall label={`Explore ${brand.name} Transform Plus`} icon="sparkles-outline" onPress={() => router.push("/membership")} style={{ marginTop: 16 }} />
          </View>
        </View>

        {/* ---------- what you get ---------- */}
        <View style={{ paddingHorizontal: 16, marginTop: GAP }}>
          <Label style={{ textAlign: "center", color: colors.white, fontSize: 13 }}>What you get</Label>
          <View style={{ gap: 10, marginTop: 16 }}>
            {transformCopy.whatYouGet.map((x, i) => (
              <Pane key={x.title} onPress={talk} accessibilityLabel={`${x.title}. ${x.sub}`} style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.successSoft, alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name={ICONS[i % ICONS.length]} size={20} color={colors.success} />
                </View>
                <View style={{ flex: 1 }}>
                  <T>{x.title}</T>
                  <P style={{ marginTop: 2 }}>{x.sub}</P>
                </View>
              </Pane>
            ))}
          </View>
        </View>

        {/* ---------- nutrition today ---------- */}
        <View style={{ paddingHorizontal: 16, marginTop: GAP }}>
          <H size={20} style={{ marginBottom: 12 }}>Your nutrition today</H>
          <TodayTile />
        </View>

        {/* ---------- coach ---------- */}
        <View style={{ paddingHorizontal: 16, marginTop: GAP - 12 }}>
          <H size={20} style={{ marginBottom: 12 }}>Your coach</H>
          <PressScale onPress={talk} scale={0.985} accessibilityRole="button" accessibilityLabel={`${coach.name}, ${coach.role}`} style={{ borderRadius: 14, overflow: "hidden", height: 300, backgroundColor: colors.surface2 }}>
            <Image source={classPhoto("personal")} style={{ width: "100%", height: "100%" }} resizeMode="cover" accessibilityIgnoresInvertColors />
            <LinearGradient pointerEvents="none" colors={["rgba(0,0,0,0)", "rgba(6,8,20,0.92)"]} locations={[0.3, 1]} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />
            <View style={{ position: "absolute", left: 16, right: 16, bottom: 16 }}>
              <Label color={colors.gold}>{coach.role} · {coach.experienceYears}+ yrs</Label>
              <Text style={{ color: "#fff", fontSize: 24, fontWeight: "900", letterSpacing: 1.5, textTransform: "uppercase", marginTop: 4 }}>{coach.name}</Text>
              <P style={{ color: "rgba(255,255,255,0.8)", marginTop: 4 }} numberOfLines={2}>{coach.bio}</P>
              <P style={{ color: "rgba(255,255,255,0.7)", marginTop: 4 }}>{coach.specialities.join(" • ")}</P>
            </View>
          </PressScale>
        </View>

        {/* ---------- price + FAQ ---------- */}
        <View style={{ paddingHorizontal: 16, marginTop: GAP }}>
          <Pane onPress={() => router.push("/membership")} accessibilityLabel={`Starting at ${transformCopy.priceFrom}`} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View>
              <P>Starting at</P>
              <Text style={{ color: "#fff", fontSize: 24, fontWeight: "900" }}>{transformCopy.priceFrom.split(" ")[0]}<Text style={{ fontSize: 13, fontWeight: "600" }}> / month</Text></Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.white} />
          </Pane>

          <H size={20} style={{ marginTop: GAP, marginBottom: 6 }}>Questions</H>
          {faqs.slice(0, 4).map((f, i) => {
            const on = open === f.q;
            return (
              <Pressable key={f.q} onPress={() => setOpen(on ? null : f.q)} accessibilityRole="button" accessibilityState={{ expanded: on }} accessibilityLabel={f.q} style={{ paddingVertical: 14, borderTopWidth: i ? 1 : 0, borderTopColor: colors.line }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <T style={{ flex: 1 }}>{f.q}</T>
                  <Ionicons name={on ? "chevron-up" : "chevron-down"} size={18} color={colors.muted} />
                </View>
                {on ? <P style={{ marginTop: 8 }}>{f.a}</P> : null}
              </Pressable>
            );
          })}
        </View>
      </NavyPage>

      {/* ---------- sticky bar ---------- */}
      <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, backgroundColor: colors.navyDeep, borderTopWidth: 1, borderTopColor: colors.line, flexDirection: "row", gap: 12 }}>
        <CultButton label="Talk to us" variant="dark" onPress={talk} style={{ flex: 1 }} />
        <CultButton label="Explore plans" variant="pink" onPress={() => router.push("/membership")} style={{ flex: 1 }} />
      </View>
    </View>
  );
}
