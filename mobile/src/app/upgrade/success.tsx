import { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { plans, nextTrek, longDate, hours } from "@f7/content";
import { radius } from "@/theme";
import { useColors } from "@/theme/ThemeProvider";
import { useSession } from "@/state/session";
import { Body, Card, Display, Eyebrow, LimeButton } from "@/components/ui";

/**
 * Welcome. One big tick, the name, what happens next. The button takes them
 * home; there is nothing else to decide on this screen.
 */
export default function Success() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { member } = useSession();
  const { plan: planId, method } = useLocalSearchParams<{ plan?: string; method?: string }>();
  const plan = plans.find((p) => p.id === planId);
  const trek = nextTrek();
  const scale = useRef(new Animated.Value(0.4)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 5 }),
      Animated.timing(fade, { toValue: 1, duration: 500, delay: 200, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  }, [scale, fade]);

  const first = (member?.name ?? "").trim().split(/\s+/)[0];
  const nextStep =
    method === "desk"
      ? `Pay at the desk on your first visit. Doors open ${hours[0]?.morning?.split("–")[0] ?? "5 AM"} tomorrow.`
      : method === "whatsapp"
        ? "We'll confirm on WhatsApp and send the payment link. Your plan starts once it's paid."
        : "Your plan starts today. Walk in, the desk has your name.";

  return (
    <View style={{ flex: 1, backgroundColor: colors.black, paddingTop: insets.top + 60, paddingHorizontal: 24, paddingBottom: insets.bottom + 24 }}>
      <View style={{ alignItems: "center" }}>
        <Animated.View
          style={{
            width: 104,
            height: 104,
            borderRadius: 52,
            backgroundColor: colors.green,
            alignItems: "center",
            justifyContent: "center",
            transform: [{ scale }],
          }}
        >
          <Ionicons name="checkmark" size={58} color={colors.onAccent} />
        </Animated.View>
      </View>

      <Animated.View style={{ opacity: fade, marginTop: 32, alignItems: "center" }}>
        <Eyebrow>You're in</Eyebrow>
        <Display size="hero" style={{ textAlign: "center", marginTop: 10 }}>
          Welcome{first ? `, ${first}` : ""}.
        </Display>
        <Body style={{ textAlign: "center", marginTop: 12 }}>{nextStep}</Body>
      </Animated.View>

      <Animated.View style={{ opacity: fade, marginTop: 28, gap: 12 }}>
        {plan ? (
          <Card>
            <Body size="micro" >
              Your plan
            </Body>
            <Display size="h2" style={{ marginTop: 6 }}>
              {plan.name}
            </Display>
            {member?.plan ? (
              <Body size="small" style={{ marginTop: 2 }}>
                Renews {longDate(member.plan.renewsOn)}
              </Body>
            ) : null}
          </Card>
        ) : null}
        {trek ? (
          <View style={{ borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, padding: 14, flexDirection: "row", gap: 12, alignItems: "center" }}>
            <Ionicons name="trail-sign" size={22} color={colors.lime} />
            <View style={{ flex: 1 }}>
              <Body size="small" muted={false} style={{ fontWeight: "600" }}>
                Your first trek: {trek.title}
              </Body>
              <Body size="small">{longDate(trek.date)} · member price applies</Body>
            </View>
          </View>
        ) : null}
      </Animated.View>

      <View style={{ flex: 1 }} />
      <LimeButton label="Go to my gym" icon="arrow-forward" onPress={() => router.replace("/(tabs)")} />
    </View>
  );
}
