import { Linking, Pressable, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { longDate, plans, inr, wa } from "@f7/content";
import { radius } from "@/theme";
import { useColors } from "@/theme/ThemeProvider";
import { useSession, prettyPhone, type Goal, type Slot } from "@/state/session";
import { Body, Card, Display, Eyebrow, LimeButton, Pill } from "@/components/ui";
import { Group, Row } from "@/components/Screen";

const goalLabel: Record<Goal, string> = {
  strength: "Get stronger",
  "fat-loss": "Lose fat",
  trek: "Train for treks",
  general: "Stay fit",
};
const slotLabel: Record<Slot, string> = {
  early: "Early (5–8 AM)",
  morning: "Morning (8 AM–12 PM)",
  ladies: "Ladies' hour",
  evening: "Evening (4–10 PM)",
};

/**
 * Profile: who you are, what you're on, what you've done. The settings cog
 * sits top-right where every app puts it (Jakob). No editing here — that is
 * one tap deeper, so the page stays a glance.
 */
export default function Profile() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { member } = useSession();
  if (!member) return null;

  const initials = (member.name || "F7").trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const popular = plans.find((p) => p.highlight) ?? plans[0];

  return (
    <ScrollView
      style={{ backgroundColor: colors.black }}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 112 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Eyebrow>Profile</Eyebrow>
        <Pressable
          onPress={() => router.push("/settings")}
          accessibilityRole="button"
          accessibilityLabel="Settings"
          hitSlop={8}
          style={({ pressed }) => [
            {
              width: 44,
              height: 44,
              borderRadius: radius.pill,
              borderWidth: 1,
              borderColor: colors.line,
              backgroundColor: colors.surface,
              alignItems: "center",
              justifyContent: "center",
            },
            pressed && { borderColor: colors.green },
          ]}
        >
          <Ionicons name="settings-outline" size={20} color={colors.white} />
        </Pressable>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 16, marginTop: 14 }}>
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: colors.green,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Display size="h1" style={{ color: colors.onAccent }}>
            {initials}
          </Display>
        </View>
        <View style={{ flex: 1 }}>
          <Display size="h2" style={{ textTransform: "none" }}>
            {member.name || "Member"}
          </Display>
          <Body size="small" style={{ marginTop: 2 }}>
            {member.phone ? prettyPhone(member.phone) : member.email ?? ""}
          </Body>
          <Body size="micro" style={{ marginTop: 4 }}>
            Member since {longDate(member.joinedOn)}
          </Body>
        </View>
      </View>

      {/* Plan card */}
      <Card accent={!!member.plan} style={{ marginTop: 22 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Eyebrow>Membership</Eyebrow>
          <Pill label={member.plan ? "Active" : "No plan"} tone={member.plan ? "lime" : "muted"} />
        </View>
        {member.plan ? (
          <>
            <Display size="h2" style={{ marginTop: 8 }}>
              {member.plan.name}
            </Display>
            <Body size="small" style={{ marginTop: 4 }}>
              Renews {longDate(member.plan.renewsOn)}
            </Body>
            <LimeButton
              label="Change plan"
              variant="outline"
              icon="swap-horizontal"
              onPress={() => router.push("/membership")}
              style={{ marginTop: 16 }}
            />
          </>
        ) : (
          <>
            <Display size="h2" style={{ marginTop: 8 }}>
              Start your climb
            </Display>
            <Body size="small" style={{ marginTop: 4 }}>
              {popular.name} is {inr(popular.priceINR)} {popular.period}, no joining fee.
            </Body>
            <LimeButton
              label={`Join on ${popular.name}`}
              icon="arrow-forward"
              onPress={() => router.push({ pathname: "/upgrade/[plan]", params: { plan: popular.id } })}
              style={{ marginTop: 16 }}
            />
          </>
        )}
      </Card>

      {/* Progress */}
      <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
        {[
          { v: String(member.streakWeeks), l: "WEEK STREAK" },
          { v: String(member.checkins.length), l: "VISITS" },
          { v: String(member.reserved.length), l: "TREKS BOOKED" },
        ].map((s) => (
          <View
            key={s.l}
            style={{
              flex: 1,
              borderRadius: radius.md,
              borderWidth: 1,
              borderColor: colors.line,
              backgroundColor: colors.surface,
              paddingVertical: 16,
              alignItems: "center",
            }}
          >
            <Display size="h1" style={{ color: colors.lime }}>
              {s.v}
            </Display>
            <Body size="micro" style={{ marginTop: 4 }}>
              {s.l}
            </Body>
          </View>
        ))}
      </View>

      <Group title="Your training">
        <Row first icon="location-outline" label="Check in" value="Member code + today's visit" onPress={() => router.push("/checkin")} />
        <Row icon="trending-up-outline" label="Progress" value="Attendance and body weight" onPress={() => router.push("/progress")} />
      </Group>

      <Group title="About you">
        <Row first icon="flag-outline" label="Goal" value={member.goal ? goalLabel[member.goal] : "Not set"} onPress={() => router.push("/settings")} />
        <Row icon="time-outline" label="Preferred slot" value={member.slot ? slotLabel[member.slot] : "Not set"} onPress={() => router.push("/settings")} />
      </Group>

      <Group title="Help">
        <Row first icon="chatbubble-ellipses-outline" label="Ask F7" value="Hours, prices, treks — instant answers" onPress={() => router.push("/chat")} />
        <Row icon="logo-whatsapp" label="WhatsApp the gym" value="A person replies during opening hours" onPress={() => Linking.openURL(wa.general()).catch(() => {})} />
        <Row icon="location-outline" label="Visit" value="Directions, hours, coaches" onPress={() => router.push("/visit")} />
      </Group>
    </ScrollView>
  );
}
