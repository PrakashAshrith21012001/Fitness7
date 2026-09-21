import { Pressable, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { trekIntro, inr, longDate, daysUntil, groupIndian } from "@f7/content";
import { useContent } from "@/state/content";
import { radius } from "@/theme";
import { useColors } from "@/theme/ThemeProvider";
import { useSession } from "@/state/session";
import { Body, Card, Display, Eyebrow, Pill } from "@/components/ui";
import { HeroVideo } from "@/components/HeroVideo";

const tone = { Easy: "lime", Moderate: "amber", Challenging: "red" } as const;

export default function Treks() {
  const colors = useColors();
  const { member } = useSession();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { upcoming: list } = useContent();

  return (
    <ScrollView
      style={{ backgroundColor: colors.black }}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <HeroVideo source={require("@/assets/video/ascent.mp4")} height={320}>
        <View style={{ paddingTop: insets.top }}>
          <Eyebrow>{trekIntro.eyebrow}</Eyebrow>
          <Display size="h1" style={{ marginTop: 8, color: "#fff" }}>{trekIntro.title}</Display>
        </View>
      </HeroVideo>
      <Body style={{ paddingHorizontal: 20, marginTop: 14, marginBottom: 20 }}>{trekIntro.body}</Body>

      <View style={{ gap: 14, paddingHorizontal: 20 }}>
        {list.map((trek) => {
          const soldOut = trek.slotsLeft === 0;
          const fill = Math.round(
            ((trek.slotsTotal - trek.slotsLeft) / trek.slotsTotal) * 100,
          );

          return (
            <Pressable
              key={trek.id}
              accessibilityRole="button"
              onPress={() => router.push(`/trek/${trek.id}`)}
              style={({ pressed }) => pressed && { opacity: 0.85 }}
            >
              <Card>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <View style={{ flex: 1, paddingRight: 12 }}>
                    <Body size="micro" style={{ color: colors.lime, letterSpacing: 1.4 }}>
                      {trek.month.toUpperCase()}
                    </Body>
                    <Display size="h2" style={{ marginTop: 6 }}>
                      {trek.title}
                    </Display>
                    <View
                      style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: 8 }}
                    >
                      <Ionicons name="location-outline" size={13} color={colors.muted} />
                      <Body size="small">{trek.location}</Body>
                    </View>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Display size="h1" style={{ color: colors.lime }}>
                      {daysUntil(trek.date)}
                    </Display>
                    <Body size="micro">DAYS</Body>
                  </View>
                </View>

                <Body size="small" style={{ marginTop: 14 }}>
                  {trek.summary}
                </Body>

                <View style={{ flexDirection: "row", gap: 8, marginTop: 14 }}>
                  <Pill label={trek.difficulty} tone={tone[trek.difficulty]} />
                  <Pill label={`${trek.distanceKm} km`} tone="muted" />
                  <Pill label={`${groupIndian(trek.altitudeM)} m`} tone="muted" />
                </View>

                <Body size="small" style={{ marginTop: 12 }}>
                  {longDate(trek.date)}
                </Body>

                {/* Slot fill */}
                <View style={{ marginTop: 14 }}>
                  <View
                    style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}
                  >
                    <Body size="micro" style={member?.reserved.includes(trek.id) ? { color: colors.lime, fontWeight: "700" } : undefined}>
                      {member?.reserved.includes(trek.id) ? "✓ YOUR SLOT IS HELD" : soldOut ? "FULLY BOOKED" : `${trek.slotsLeft} OF ${trek.slotsTotal} SLOTS LEFT`}
                    </Body>
                    <Body size="micro" style={{ color: soldOut ? colors.danger : colors.lime }}>
                      {fill}% FULL
                    </Body>
                  </View>
                  <View
                    style={{
                      height: 4,
                      borderRadius: radius.pill,
                      backgroundColor: colors.line,
                      overflow: "hidden",
                    }}
                  >
                    <View
                      style={{
                        width: `${fill}%`,
                        height: "100%",
                        backgroundColor: soldOut ? colors.danger : colors.lime,
                      }}
                    />
                  </View>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: 16,
                  }}
                >
                  <View>
                    <Display size="h2">{inr(trek.memberPriceINR)}</Display>
                    <Body size="micro">MEMBERS · {inr(trek.priceINR)} GUESTS</Body>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Body size="small" style={{ color: colors.lime, fontWeight: "600" }}>
                      Details
                    </Body>
                    <Ionicons name="chevron-forward" size={15} color={colors.lime} />
                  </View>
                </View>
              </Card>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}
