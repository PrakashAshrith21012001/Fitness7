import { useState } from "react";
import { FlatList, Image, Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { brand, daysUntil, discover, fitWay, heroSlides, quotes, recipeHero, recipes, workoutFor } from "@f7/content";
import { useColors } from "@/theme/ThemeProvider";
import { useSession } from "@/state/session";
import { useBookings, className } from "@/state/bookings";
import { ActionTile, CultButton, Dots, H, Label, NavyPage, P, Pane, SectionHead, T } from "@/components/cult";
import { PressScale } from "@/components/motion";
import { AnnouncementCard } from "@/components/AnnouncementCard";
import { TodayTile } from "@/components/TodayTile";
import { FitEditSection, GAP, GhostSmall, SCREEN_W, Scrim, useHorizontalIndex } from "@/components/FitnessShared";
import { photo } from "@/lib/photos";

/**
 * Home — the cult.fit Home, section for section: streak pill, hero photo
 * carousel, two rows of quick actions + SEE MORE, Discover more, the store
 * strip, FIT.EDIT, The .fit Way, One Pot recipes, the quote cards, and the
 * "Upcoming" pill pinned above the tab bar.
 */

type Tile = { icon: keyof typeof Ionicons.glyphMap; label: string; go: () => void; tint?: string };

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const to12 = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};

export default function Home() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { member } = useSession();
  const { upcoming, weeksActive } = useBookings();
  const [more, setMore] = useState(false);
  const hero = useHorizontalIndex(SCREEN_W);
  const quote = useHorizontalIndex(SCREEN_W - 32 + 12);

  const initials = (member?.name || "F7").trim().split(/\s+/).map((s) => s[0]).join("").slice(0, 2).toUpperCase();
  const streak = Math.max(weeksActive, member?.streakWeeks ?? 0);
  const renewDays = member?.plan ? daysUntil(member.plan.renewsOn) : null;
  const renewSoon = renewDays !== null && renewDays <= 7;

  const tiles: Tile[] = [
    { icon: "calendar-outline", label: "book a\nclass", go: () => router.push("/fitness") },
    { icon: "qr-code-outline", label: "check-in\nat gym", go: () => router.push("/checkin"), tint: colors.pink },
    { icon: "play-circle-outline", label: "workout\nat home", go: () => router.push("/plan"), tint: colors.gold },
    { icon: "restaurant-outline", label: "calorie\ntracker", go: () => router.push("/food"), tint: colors.success },
    { icon: "people-outline", label: "view\nmy squad", go: () => router.push({ pathname: "/fitness", params: { tab: "profile" } }), tint: colors.success },
    { icon: "trail-sign-outline", label: `clubs at\n${brand.name}`, go: () => router.push("/treks"), tint: colors.gold },
    { icon: "barbell-outline", label: "smart workout\nplan", go: () => router.push("/plan"), tint: "#7aa2ff" },
    { icon: "trending-up-outline", label: "strength\ntracker", go: () => router.push("/progress"), tint: colors.pink },
  ];
  const extra: Tile[] = [
    { icon: "location-outline", label: "view all\ngyms", go: () => router.push("/visit"), tint: colors.pink },
    { icon: "walk-outline", label: "treks &\nclubs", go: () => router.push("/treks"), tint: colors.gold },
    { icon: "card-outline", label: "membership", go: () => router.push("/membership"), tint: "#7aa2ff" },
    { icon: "chatbubble-ellipses-outline", label: "ask F7", go: () => router.push("/chat"), tint: colors.pink },
  ];

  const next = upcoming[0];
  const nextDate = next ? new Date(next.date + "T12:00:00") : null;
  const nextFocus = next ? workoutFor(next.classId, nextDate!.getDay()).focus : "";
  const isToday = next ? next.date === new Date().toISOString().slice(0, 10) : false;

  const tileW = (SCREEN_W - 32) / 4;

  return (
    <View style={{ flex: 1 }}>
      <NavyPage top={false} contentStyle={{ paddingBottom: insets.bottom + 150 }}>
        {/* ---------- hero carousel with the top bar floating on it ---------- */}
        <View style={{ height: 520 + insets.top }}>
          <FlatList
            data={heroSlides}
            keyExtractor={(s) => s.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={hero.onScroll}
            scrollEventThrottle={16}
            renderItem={({ item }) => (
              <View style={{ width: SCREEN_W, height: 520 + insets.top }}>
                <Image source={photo(item.photo)} style={{ width: "100%", height: "100%" }} resizeMode="cover" accessibilityIgnoresInvertColors />
                <LinearGradient pointerEvents="none" colors={["rgba(9,12,28,0.55)", "rgba(9,12,28,0)", "rgba(9,12,28,0.2)", colors.black]} locations={[0, 0.25, 0.6, 1]} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />
                <View style={{ position: "absolute", left: 24, right: 24, bottom: 56, alignItems: "center" }}>
                  <Text style={{ color: "#fff", fontSize: 26, lineHeight: 31, fontWeight: "800", textAlign: "center", letterSpacing: -0.4 }}>{item.title}</Text>
                  <CultButton label={item.cta} variant="dark" small full={false} onPress={() => router.push(item.route as never)} style={{ marginTop: 18, backgroundColor: "rgba(255,255,255,0.18)" }} />
                </View>
              </View>
            )}
          />
          <Dots count={heroSlides.length} index={hero.index} style={{ position: "absolute", left: 0, right: 0, bottom: 28 }} />

          {/* top bar */}
          <View style={{ position: "absolute", left: 16, right: 16, top: insets.top + 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Pressable onPress={() => router.push("/profile")} accessibilityRole="button" accessibilityLabel="My profile" style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.pink, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "rgba(255,255,255,0.6)" }}>
              <Text style={{ color: "#fff", fontWeight: "800", fontSize: 14 }}>{initials}</Text>
            </Pressable>
            <Pressable onPress={() => router.push("/progress")} accessibilityRole="button" accessibilityLabel={`${streak} week streak`} style={{ flexDirection: "row", alignItems: "center", gap: 8, height: 40, paddingLeft: 12, paddingRight: 44, borderRadius: 20, backgroundColor: "rgba(20,16,60,0.85)", borderWidth: 1, borderColor: "rgba(160,140,255,0.5)" }}>
              <Ionicons name="flash" size={16} color={colors.gold} />
              <Text style={{ color: "#fff", fontSize: 14 }}>
                <Text style={{ fontWeight: "800" }}>{streak}</Text> week streak
              </Text>
              <View style={{ position: "absolute", right: -2, top: -8, width: 46, height: 46, borderRadius: 23, backgroundColor: "#4c3bd6", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "rgba(255,255,255,0.35)" }}>
                <Ionicons name="happy-outline" size={24} color="#fff" />
              </View>
            </Pressable>
          </View>
        </View>

        {/* ---------- quick actions ---------- */}
        <View style={{ paddingHorizontal: 16, marginTop: -8 }}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", rowGap: 18 }}>
            {tiles.map((t) => (
              <ActionTile key={t.label} icon={t.icon} label={t.label} onPress={t.go} tint={t.tint} width={tileW} />
            ))}
            {more ? extra.map((t) => <ActionTile key={t.label} icon={t.icon} label={t.label} onPress={t.go} tint={t.tint} width={tileW} />) : null}
          </View>
          <View style={{ alignItems: "center", marginTop: 16 }}>
            <CultButton label={more ? "See less" : "See more"} variant="dark" small full={false} onPress={() => setMore((m) => !m)} style={{ backgroundColor: "rgba(255,255,255,0.14)" }} />
          </View>
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
          <AnnouncementCard />
          {/* calorie tracker — Today ring: eaten · burned · water */}
          <TodayTile />
          {renewSoon && member?.plan ? (
            <Pane onPress={() => router.push("/membership")} accessibilityLabel="Renew your plan" style={{ flexDirection: "row", alignItems: "center", gap: 12, borderColor: colors.gold }}>
              <Ionicons name="alert-circle-outline" size={20} color={colors.gold} />
              <View style={{ flex: 1 }}>
                <T>{renewDays === 0 ? "Your plan ends today" : `Your plan ends in ${renewDays} day${renewDays === 1 ? "" : "s"}`}</T>
                <P>{member.plan.name} · renew to keep your streak alive</P>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </Pane>
          ) : null}
        </View>

        {/* ---------- Discover more ---------- */}
        <View style={{ marginTop: GAP }}>
          <H size={22} style={{ textAlign: "center", marginBottom: 14 }}>Discover more</H>
          <View style={{ paddingHorizontal: 16, flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            {discover.map((d) => (
              <PressScale key={d.id} onPress={() => router.push(d.route as never)} scale={0.98} accessibilityRole="button" accessibilityLabel={`${d.title}, ${d.sub}`} style={{ width: (SCREEN_W - 44) / 2, height: 200, borderRadius: 14, overflow: "hidden", backgroundColor: colors.surface2 }}>
                <Image source={photo(d.photo)} style={{ width: "100%", height: "100%" }} resizeMode="cover" accessibilityIgnoresInvertColors />
                <Scrim strength={0.9} />
                <View style={{ position: "absolute", left: 12, right: 12, bottom: 12 }}>
                  <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.7)", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
                    <Ionicons name="chevron-forward" size={12} color="#fff" />
                  </View>
                  <T numberOfLines={2}>{d.title}</T>
                  <P numberOfLines={1} style={{ marginTop: 2 }}>{d.sub}</P>
                </View>
              </PressScale>
            ))}
          </View>
        </View>

        {/* ---------- store strip ---------- */}
        <View style={{ paddingHorizontal: 16, marginTop: GAP }}>
          <PressScale onPress={() => router.push("/store")} scale={0.985} accessibilityRole="button" accessibilityLabel="Open the Fitness 7 store" style={{ flexDirection: "row", alignItems: "center", gap: 14, height: 72 }}>
            <View style={{ width: 64, height: 64, borderRadius: 14, overflow: "hidden", backgroundColor: colors.surface2 }}>
              <Image source={photo("gym-weights")} style={{ width: "100%", height: "100%" }} resizeMode="cover" accessibilityIgnoresInvertColors />
            </View>
            <LinearGradient colors={["#5b1d8f", "#c11e5e"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1, height: 44, borderRadius: 22, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>Your one-stop fitness store nearby</Text>
              <Ionicons name="chevron-forward" size={16} color="#fff" />
            </LinearGradient>
          </PressScale>
        </View>

        <FitEditSection />

        {/* ---------- The .fit Way ---------- */}
        <View style={{ marginTop: GAP }}>
          <SectionHead title="The .fit Way" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
            {fitWay.map((a) => (
              <PressScale key={a.id} onPress={() => router.push("/food")} scale={0.985} accessibilityRole="button" accessibilityLabel={a.title} style={{ width: SCREEN_W - 32, height: 260, borderRadius: 14, overflow: "hidden", backgroundColor: colors.surface2 }}>
                <Image source={photo(a.photo)} style={{ width: "100%", height: "100%" }} resizeMode="cover" accessibilityIgnoresInvertColors />
                <Scrim strength={0.85} />
                <View style={{ position: "absolute", left: 0, right: 0, bottom: 18, alignItems: "center", paddingHorizontal: 16 }}>
                  <Text style={{ color: "#fff", fontSize: 22, fontWeight: "900", letterSpacing: 0.5, textTransform: "uppercase", textAlign: "center" }}>{a.title}</Text>
                  <P style={{ color: "rgba(255,255,255,0.75)", marginTop: 4 }}>{a.sub}</P>
                  <GhostSmall label={a.cta} onPress={() => router.push("/food")} style={{ marginTop: 14 }} />
                </View>
              </PressScale>
            ))}
          </ScrollView>
        </View>

        {/* ---------- One Pot ---------- */}
        <View style={{ marginTop: GAP, paddingHorizontal: 16 }}>
          <H size={20} style={{ marginBottom: 12 }}>{recipeHero.title.replace(/\b\w/g, (c) => c.toUpperCase())}</H>
          <PressScale onPress={() => router.push("/food")} scale={0.985} accessibilityRole="button" accessibilityLabel={recipeHero.cta} style={{ height: 220, borderRadius: 14, overflow: "hidden", backgroundColor: colors.surface2 }}>
            <Image source={photo("cardio")} style={{ width: "100%", height: "100%" }} resizeMode="cover" accessibilityIgnoresInvertColors />
            <Scrim strength={0.85} />
            <View style={{ position: "absolute", left: 0, right: 0, bottom: 16, alignItems: "center" }}>
              <Text style={{ color: "#fff", fontSize: 20, fontStyle: "italic", fontWeight: "600" }}>{recipeHero.sub.split(" with")[0]}</Text>
              <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 15, fontStyle: "italic" }}>with oats</Text>
              <GhostSmall label={recipeHero.cta} onPress={() => router.push("/food")} style={{ marginTop: 12 }} />
            </View>
          </PressScale>
          {recipes.map((r) => (
            <Pressable key={r.id} onPress={() => router.push("/food")} accessibilityRole="button" accessibilityLabel={`${r.title}, ${r.kcal} calories`} style={{ flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 10 }}>
              <View style={{ width: 56, height: 56, borderRadius: 10, overflow: "hidden", backgroundColor: colors.surface2 }}>
                <Image source={photo(r.photo)} style={{ width: "100%", height: "100%" }} resizeMode="cover" accessibilityIgnoresInvertColors />
              </View>
              <View style={{ flex: 1 }}>
                <T numberOfLines={2}>{r.title}</T>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}>
                  <Ionicons name="play" size={11} color={colors.white} />
                  <P>{r.kcal} calories</P>
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        {/* ---------- May The Force Be With You ---------- */}
        <View style={{ marginTop: GAP }}>
          <SectionHead title="May The Force Be With You" />
          <FlatList
            data={quotes}
            keyExtractor={(q) => q.id}
            horizontal
            snapToInterval={SCREEN_W - 32 + 12}
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            onScroll={quote.onScroll}
            scrollEventThrottle={16}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
            renderItem={({ item, index }) => (
              <PressScale onPress={() => router.push("/chat")} scale={0.99} accessibilityRole="button" accessibilityLabel={`${item.headline} ${item.by}`} style={{ width: SCREEN_W - 32, borderRadius: 14, overflow: "hidden", backgroundColor: colors.navyDeep }}>
                <View style={{ height: 240 }}>
                  <Image source={photo(item.photo)} style={{ width: "100%", height: "100%" }} resizeMode="cover" accessibilityIgnoresInvertColors />
                  <LinearGradient pointerEvents="none" colors={["rgba(9,12,28,0)", colors.navyDeep]} locations={[0.4, 1]} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />
                  <View style={{ position: "absolute", left: 16, right: 16, bottom: 12 }}>
                    <Text style={{ color: "#fff", fontSize: 17, lineHeight: 22, fontWeight: "900", letterSpacing: 1.4, textTransform: "uppercase", textAlign: "center" }}>{item.headline}</Text>
                  </View>
                </View>
                <View style={{ paddingHorizontal: 24, paddingBottom: 26, alignItems: "center" }}>
                  <View style={{ flexDirection: "row", gap: 8, marginTop: 14 }}>
                    {quotes.map((_, i) => (
                      <View key={i} style={{ width: 28, height: 2, backgroundColor: i === index ? "#fff" : "rgba(255,255,255,0.3)" }} />
                    ))}
                  </View>
                  <Text style={{ color: "#fff", fontSize: 40, lineHeight: 44, fontWeight: "900", marginTop: 22 }}>„</Text>
                  <P style={{ color: "#fff", textAlign: "center", marginTop: 8 }} size={14}>{item.body}</P>
                  <Label style={{ marginTop: 16, textTransform: "none", letterSpacing: 0 }}>— {item.by}</Label>
                </View>
              </PressScale>
            )}
          />
          <Dots count={quotes.length} index={quote.index} style={{ marginTop: 12 }} />
        </View>
      </NavyPage>

      {/* ---------- Upcoming pill above the tab bar ---------- */}
      {next ? (
        <View pointerEvents="box-none" style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}>
          <LinearGradient pointerEvents="none" colors={["rgba(9,12,28,0)", colors.navyDeep]} style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 90 }} />
          <Pressable onPress={() => router.push(`/booking/${next.id}`)} accessibilityRole="button" accessibilityLabel={`Upcoming: ${className(next.classId)} ${nextFocus}, ${to12(next.time)}`} style={{ marginHorizontal: 12, marginBottom: 6, height: 58, borderRadius: 12, backgroundColor: "rgba(20,26,54,0.96)", borderWidth: 1, borderColor: colors.line, flexDirection: "row", alignItems: "center", paddingHorizontal: 14, gap: 12 }}>
            <Ionicons name="calendar-outline" size={20} color={colors.white} />
            <View style={{ flex: 1 }}>
              <T numberOfLines={1} style={{ fontSize: 13 }}>Upcoming : {className(next.classId)} {nextFocus}</T>
              <P numberOfLines={1} size={11}>
                {to12(next.time)}, {isToday ? "Today" : ""} {nextDate!.getDate()} {MONTHS[nextDate!.getMonth()]}, {brand.name} TS Square
              </P>
            </View>
            {upcoming.length > 1 ? <T style={{ fontSize: 13 }}>+{upcoming.length - 1}</T> : null}
            <View style={{ position: "absolute", top: -9, left: 0, right: 0, alignItems: "center" }}>
              <Ionicons name="chevron-up" size={14} color={colors.muted} />
            </View>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
