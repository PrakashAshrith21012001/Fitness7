import { useRef } from "react";
import { Linking, Pressable, ScrollView, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { inr, longDate, shortDate, daysUntil, groupIndian, wa } from "@f7/content";
import { useContent } from "@/state/content";
import { useColors } from "@/theme/ThemeProvider";
import { useSession } from "@/state/session";
import { Body, Display, LimeButton } from "@/components/ui";
import { FactsRow, PhotoHeader } from "@/components/PhotoCard";
import { Enter, Glass, GlassTarget, PressScale } from "@/components/motion";
import { trekPhoto } from "@/lib/photos";

/**
 * One trek — photo top, glass back + "held" heart, then the title, place,
 * the story, a facts row (distance · altitude · difficulty), date and
 * meeting point, what's included, and one floating action.
 */
export default function TrekDetail() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const blurTarget = useRef<View>(null);
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { byId } = useContent();
  const trek = byId(String(id));
  const { member, toggleReserve } = useSession();
  const reserved = !!(trek && member?.reserved.includes(trek.id));
  const back = () => (router.canGoBack() ? router.back() : router.replace("/treks"));

  if (!trek) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.black, justifyContent: "center", padding: 24 }}>
        <Display size="h2">Trek not found</Display>
        <Body style={{ marginTop: 8 }}>This expedition may have already run. Check the Treks tab for what is coming up.</Body>
        <LimeButton label="Back to treks" variant="soft" onPress={back} style={{ marginTop: 18 }} />
      </View>
    );
  }

  const soldOut = trek.slotsLeft === 0;
  const canReserve = !!member?.plan && !soldOut;
  const act = () => {
    if (!canReserve && !reserved) {
      Linking.openURL(wa.trek(trek)).catch(() => {});
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    toggleReserve(trek.id);
  };

  const row = (label: string, value: string, sub?: string) => (
    <View style={{ flex: 1 }}>
      <Body size="micro">{label}</Body>
      <Body size="body" muted={false} style={{ fontWeight: "600", marginTop: 2 }}>{value}</Body>
      {sub ? <Body size="small" style={{ marginTop: 1 }}>{sub}</Body> : null}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.black }}>
      <GlassTarget targetRef={blurTarget}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>
        <PhotoHeader photo={trekPhoto(trek)} height={420}>
          <View style={{ position: "absolute", top: insets.top + 8, left: 16, right: 16, flexDirection: "row", justifyContent: "space-between" }}>
            <Pressable onPress={back} accessibilityRole="button" accessibilityLabel="Back" hitSlop={8}>
              <Glass onPhoto intensity={30} radius={22} style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="chevron-back" size={20} color="#fff" />
              </Glass>
            </Pressable>
            <Glass onPhoto intensity={30} radius={999} style={{ paddingHorizontal: 14, height: 36, justifyContent: "center" }}>
              <Body size="small" style={{ color: "#fff", fontWeight: "700" }}>{daysUntil(trek.date)} days out</Body>
            </Glass>
          </View>
          <View style={{ position: "absolute", left: 20, right: 20, bottom: 40 }}>
            <Body size="small" style={{ color: "rgba(255,255,255,0.8)", fontWeight: "600" }}>{trek.month}</Body>
          </View>
        </PhotoHeader>

        <View style={{ marginTop: -28, borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: colors.black, paddingHorizontal: 20, paddingTop: 26 }}>
          <Enter index={0}>
            <Display size="h1">{trek.title}</Display>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: 6 }}>
              <Ionicons name="location-outline" size={14} color={colors.muted} />
              <Body size="small">{trek.location}</Body>
            </View>
          </Enter>
          <Enter index={1}>
            <Body style={{ marginTop: 16, lineHeight: 24 }}>{trek.summary}</Body>
          </Enter>
          <Enter index={2} style={{ marginTop: 20 }}>
            <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
              <Display size="h1">{inr(member?.plan ? trek.memberPriceINR : trek.priceINR)}</Display>
              <Body size="small">{member?.plan ? `member price · ${inr(trek.priceINR)} for guests` : `guests · ${inr(trek.memberPriceINR)} for members`}</Body>
            </View>
          </Enter>
          <Enter index={3} style={{ marginTop: 18 }}>
            <FactsRow facts={[{ label: "Distance", value: `${trek.distanceKm} km` }, { label: "Altitude", value: `${groupIndian(trek.altitudeM)} m` }, { label: "Difficulty", value: trek.difficulty }]} />
          </Enter>
          <Enter index={4} style={{ marginTop: 18 }}>
            <View style={{ flexDirection: "row", gap: 16 }}>
              {row("Date", shortDate(trek.date), trek.durationText)}
              {row("Meeting point", trek.meetingPoint)}
            </View>
          </Enter>
          <Enter index={5} style={{ marginTop: 24 }}>
            <Body size="small" style={{ fontWeight: "600" }}>What you get</Body>
            <View style={{ marginTop: 10, gap: 8 }}>
              {trek.includes.map((item) => (
                <View key={item} style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
                  <Ionicons name="checkmark-circle" size={17} color={colors.lime} />
                  <Body style={{ flex: 1, color: colors.white }}>{item}</Body>
                </View>
              ))}
            </View>
          </Enter>
          <Enter index={6} style={{ marginTop: 22 }}>
            <Body size="small" style={{ fontWeight: "600" }}>Highlights</Body>
            <View style={{ marginTop: 10, gap: 8 }}>
              {trek.highlights.map((item) => (
                <View key={item} style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
                  <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: colors.lime, marginTop: 9 }} />
                  <Body style={{ flex: 1 }}>{item}</Body>
                </View>
              ))}
            </View>
          </Enter>
          <Enter index={7} style={{ marginTop: 22 }}>
            <Body size="small">
              {reserved
                ? `Your slot is held. Pay at the desk before ${shortDate(trek.date)} to confirm — the bus leaves from the gym.`
                : soldOut
                  ? "Fully booked. Join the waitlist and we'll message you if a slot opens."
                  : `${trek.slotsLeft} of ${trek.slotsTotal} slots left.`}
            </Body>
            {reserved ? (
              <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
                <LimeButton label="Message the lead" icon="logo-whatsapp" variant="soft" href={wa.trek(trek)} style={{ flex: 1, paddingVertical: 12 }} />
                <LimeButton label="Release slot" variant="outline" onPress={act} style={{ flex: 1, paddingVertical: 12 }} />
              </View>
            ) : null}
          </Enter>
        </View>
      </ScrollView>
      </GlassTarget>

      {!reserved ? (
        <View style={{ position: "absolute", left: 16, right: 16, bottom: insets.bottom + 12 }}>
          <Glass strength="light" intensity={60} radius={999} target={blurTarget} style={{ padding: 6 }}>
            <LimeButton label={soldOut ? "Join the waitlist" : canReserve ? "Reserve my slot" : "Book on WhatsApp"} icon={canReserve ? "checkmark" : "logo-whatsapp"} trailing onPress={act} />
          </Glass>
        </View>
      ) : (
        <View style={{ position: "absolute", left: 16, right: 16, bottom: insets.bottom + 12 }}>
          <Glass strength="regular" intensity={50} radius={999} target={blurTarget} style={{ height: 56, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Ionicons name="checkmark-circle" size={20} color={colors.lime} />
            <Body size="body" muted={false} style={{ fontWeight: "700" }}>Your slot is held</Body>
          </Glass>
        </View>
      )}
    </View>
  );
}
