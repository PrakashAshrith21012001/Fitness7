import { ScrollView, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { treks, inr, longDate, shortDate, daysUntil, groupIndian, wa } from "@f7/content";
import { radius } from "@/theme";
import { useColors } from "@/theme/ThemeProvider";
import { useSession } from "@/state/session";
import { Linking } from "react-native";
import * as Haptics from "expo-haptics";
import { Body, Card, Display, Eyebrow, LimeButton, Pill } from "@/components/ui";

const tone = { Easy: "lime", Moderate: "amber", Challenging: "red" } as const;

export default function TrekDetail() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const trek = treks.find((t) => t.id === id);
  const { member, toggleReserve } = useSession();
  const reserved = !!(trek && member?.reserved.includes(trek.id));

  if (!trek) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.black, justifyContent: "center", padding: 24 }}>
        <Display size="h2">Trek not found</Display>
        <Body style={{ marginTop: 8 }}>
          This expedition may have already run. Check the Treks tab for what is coming up.
        </Body>
      </View>
    );
  }

  const soldOut = trek.slotsLeft === 0;

  return (
    <ScrollView
      style={{ backgroundColor: colors.black }}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header block — a drawn ridge stands in until the gym's photos land */}
      <View
        style={{
          height: 260,
          backgroundColor: colors.surface,
          justifyContent: "flex-end",
          padding: 20,
          borderBottomWidth: 1,
          borderBottomColor: colors.line,
        }}
      >
        <Eyebrow>{trek.month}</Eyebrow>
        <Display size="hero" style={{ marginTop: 8 }}>{trek.title}</Display>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: 8 }}>
          <Ionicons name="location-outline" size={14} color={colors.muted} />
          <Body size="small">{trek.location}</Body>
        </View>
      </View>

      <View style={{ padding: 20, gap: 18 }}>
        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          <Pill label={trek.difficulty} tone={tone[trek.difficulty]} />
          <Pill label={`${trek.distanceKm} km`} tone="muted" />
          <Pill label={`${groupIndian(trek.altitudeM)} m`} tone="muted" />
          <Pill label={`${daysUntil(trek.date)} days out`} tone="lime" />
        </View>

        <Body>{trek.summary}</Body>

        <Card>
          <Body size="micro">DATE</Body>
          <Body size="title" muted={false} style={{ marginTop: 4 }}>
            {longDate(trek.date)}
          </Body>
          <Body size="small" style={{ marginTop: 2 }}>{trek.durationText}</Body>

          <View style={{ height: 1, backgroundColor: colors.line, marginVertical: 16 }} />

          <Body size="micro">MEETING POINT</Body>
          <Body size="title" muted={false} style={{ marginTop: 4 }}>
            {trek.meetingPoint}
          </Body>
        </Card>

        <View>
          <Display size="h2">What you get</Display>
          <View style={{ marginTop: 12, gap: 10 }}>
            {trek.includes.map((item) => (
              <View key={item} style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
                <Ionicons name="checkmark-circle" size={17} color={colors.lime} />
                <Body style={{ flex: 1, color: colors.white }}>{item}</Body>
              </View>
            ))}
          </View>
        </View>

        <View>
          <Display size="h2">Highlights</Display>
          <View style={{ marginTop: 12, gap: 10 }}>
            {trek.highlights.map((item) => (
              <View key={item} style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
                <View
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: radius.pill,
                    backgroundColor: colors.lime,
                    marginTop: 9,
                  }}
                />
                <Body style={{ flex: 1 }}>{item}</Body>
              </View>
            ))}
          </View>
        </View>

        <Card accent={!soldOut}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
            <View>
              <Display size="h1">{inr(trek.memberPriceINR)}</Display>
              <Body size="micro" style={{ marginTop: 2 }}>
                MEMBERS · {inr(trek.priceINR)} FOR GUESTS
              </Body>
            </View>
            <Pill
              label={soldOut ? "Fully booked" : `${trek.slotsLeft} left`}
              tone={soldOut ? "red" : "lime"}
            />
          </View>

          {reserved ? (
            <>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 18 }}>
                <Ionicons name="checkmark-circle" size={20} color={colors.lime} />
                <Body size="title" muted={false} style={{ fontWeight: "700", flex: 1 }}>
                  Your slot is held
                </Body>
              </View>
              <Body size="small" style={{ marginTop: 4 }}>
                Pay at the desk before {shortDate(trek.date)} to confirm. Bus leaves from the gym.
              </Body>
              <LimeButton label="Message the trek lead" icon="logo-whatsapp" variant="outline" href={wa.trek(trek)} style={{ marginTop: 14 }} />
              <LimeButton
                label="Release my slot"
                variant="outline"
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  toggleReserve(trek.id);
                }}
                style={{ marginTop: 10 }}
              />
            </>
          ) : (
            <LimeButton
              label={soldOut ? "Join the waitlist on WhatsApp" : member?.plan ? "Reserve my slot" : "Book a slot on WhatsApp"}
              icon={soldOut || !member?.plan ? "logo-whatsapp" : "checkmark"}
              onPress={() => {
                if (soldOut || !member?.plan) {
                  Linking.openURL(wa.trek(trek)).catch(() => {});
                  return;
                }
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
                toggleReserve(trek.id);
              }}
              style={{ marginTop: 18 }}
            />
          )}
        </Card>
      </View>
    </ScrollView>
  );
}
