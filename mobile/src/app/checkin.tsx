import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Share, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { brand, contact } from "@f7/content";
import { radius } from "@/theme";
import { useColors } from "@/theme/ThemeProvider";
import { useSession, today } from "@/state/session";
import { Body, Card, Display, Eyebrow, LimeButton } from "@/components/ui";
import { Screen } from "@/components/Screen";
import { WeekStrip } from "@/components/WeekStrip";

/** A short, stable member code from the id — what the desk reads off the phone. */
export function memberCode(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return `F7-${String(h % 10000).padStart(4, "0")}`;
}

/**
 * Check-in. One button, one outcome. The code at the top is what a member
 * shows the desk; tapping "I'm here" logs the day and feeds the streak. When
 * the gym installs a QR at the door, the button becomes a scan — the screen
 * around it stays.
 */
export default function CheckIn() {
  const colors = useColors();
  const { member, checkIn } = useSession();
  const [justDone, setJustDone] = useState(false);
  const pulse = useRef(new Animated.Value(1)).current;

  const doneToday = !!member?.checkins.includes(today());

  useEffect(() => {
    if (doneToday) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.04, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [doneToday, pulse]);

  if (!member) return null;

  const go = async () => {
    const ok = await checkIn();
    if (ok) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setJustDone(true);
    }
  };

  const streak = member.streakWeeks;
  const thisWeek = member.checkins.filter((d) => {
    const now = new Date(today() + "T12:00:00");
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    return d >= `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, "0")}-${String(monday.getDate()).padStart(2, "0")}`;
  }).length;

  return (
    <Screen title="Check in">
      <Card style={{ alignItems: "center", paddingVertical: 28 }}>
        <Eyebrow>Member code</Eyebrow>
        <Display size="hero" style={{ marginTop: 8, letterSpacing: 2 }}>
          {memberCode(member.id)}
        </Display>
        <Body size="small" style={{ marginTop: 6, textAlign: "center" }}>
          {member.name} · show this at the desk
        </Body>
      </Card>

      <Animated.View style={{ transform: [{ scale: doneToday ? 1 : pulse }], marginTop: 16 }}>
        {doneToday ? (
          <View
            style={{
              borderRadius: radius.lg,
              backgroundColor: colors.limeSoft,
              borderWidth: 1,
              borderColor: colors.accentBorder,
              padding: 20,
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
            }}
          >
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.green, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="checkmark" size={26} color={colors.onAccent} />
            </View>
            <View style={{ flex: 1 }}>
              <Body size="title" muted={false} style={{ fontWeight: "700" }}>
                {justDone ? "Checked in. Go climb." : "You're already in today."}
              </Body>
              <Body size="small">
                {thisWeek} {thisWeek === 1 ? "session" : "sessions"} this week · {streak}-week streak
              </Body>
            </View>
          </View>
        ) : (
          <LimeButton label="I'm here — check in" icon="location" onPress={go} style={{ paddingVertical: 20 }} />
        )}
      </Animated.View>

      <Card style={{ marginTop: 16 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <Eyebrow>This week</Eyebrow>
          <Body size="small" style={{ color: colors.lime, fontWeight: "600" }}>
            {streak} week{streak === 1 ? "" : "s"} running
          </Body>
        </View>
        <WeekStrip checkins={member.checkins} />
        <Body size="small" style={{ marginTop: 14 }}>
          {thisWeek >= 3
            ? "Three or more a week is where the change happens. Keep it."
            : thisWeek > 0
              ? `${3 - thisWeek} more this week keeps the streak honest.`
              : "One visit this week keeps the streak alive."}
        </Body>
      </Card>

      <LimeButton
        label="Bring a friend"
        icon="people"
        variant="outline"
        onPress={() =>
          Share.share({
            message: `Come train with me at ${brand.fullName}, ${brand.city}. First session is free — just walk in and say ${member.name.split(" ")[0]} sent you. ${contact.mapsUrl}`,
          }).catch(() => {})
        }
        style={{ marginTop: 16 }}
      />
      <Body size="small" style={{ textAlign: "center", marginTop: 10 }}>
        Your friend's first session is on the house.
      </Body>
    </Screen>
  );
}
