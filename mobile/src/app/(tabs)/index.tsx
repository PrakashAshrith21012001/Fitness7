import { Linking, Pressable, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  brand,
  stats,
  classes,
  trialOffer,
  contact,
  wa,
  telLink,
  inr,
  longDate,
  daysUntil,
  plans,
} from "@f7/content";
import { WeekStrip } from "@/components/WeekStrip";
import { TodayTile } from "@/components/TodayTile";
import { NudgeCard } from "@/components/NudgeCard";
import { AnnouncementCard } from "@/components/AnnouncementCard";
import { useContent } from "@/state/content";
import { today } from "@/state/session";
import { radius } from "@/theme";
import { useColors } from "@/theme/ThemeProvider";
import { useSession, type Slot } from "@/state/session";
import { Body, Card, Display, Eyebrow, LimeButton, Pill } from "@/components/ui";
import { HeroVideo } from "@/components/HeroVideo";

const slotLabel: Record<Slot, string> = {
  early: "5–8 AM",
  morning: "8 AM–12 PM",
  ladies: "Ladies' hour",
  evening: "4–10 PM",
};
const slotShort: Record<Slot, string> = { early: "5 AM", morning: "8 AM", ladies: "11 AM", evening: "4 PM" };

function hello(name: string) {
  const h = new Date().getHours();
  const part = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  const first = name.trim().split(/\s+/)[0];
  return first ? `${part}, ${first}` : part;
}

/**
 * Home has two states and they are deliberately different (Von Restorff):
 *  - no plan → one green thing on screen, the free trial; everything else is quiet
 *  - member  → their plan, their streak, the next trek, today's classes
 */
export default function Home() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { member } = useSession();
  const { next: trek } = useContent();
  const hasPlan = !!member?.plan;
  const popular = plans.find((p) => p.highlight) ?? plans[0];
  const checkedInToday = !!member?.checkins.includes(today());
  const renewDays = member?.plan ? daysUntil(member.plan.renewsOn) : null;
  const renewSoon = renewDays !== null && renewDays <= 7;
  const followed = classes.filter((c) => member?.followed.includes(c.id));

  const quickActions = hasPlan
    ? [
        { label: checkedInToday ? "Checked in" : "Check in", icon: (checkedInToday ? "checkmark-circle" : "location") as "checkmark-circle" | "location", go: () => router.push("/checkin") },
        { label: "Progress", icon: "trending-up" as const, go: () => router.push("/progress") },
        { label: "Ask F7", icon: "chatbubble-ellipses" as const, go: () => router.push("/chat") },
        { label: "Visit", icon: "location-outline" as const, go: () => router.push("/visit") },
      ]
    : [
        { label: "Free trial", icon: "flash" as const, go: () => Linking.openURL(wa.trial()).catch(() => {}) },
        { label: "Call gym", icon: "call" as const, go: () => Linking.openURL(telLink()).catch(() => {}) },
        { label: "Directions", icon: "navigate" as const, go: () => Linking.openURL(contact.mapsUrl).catch(() => {}) },
        { label: "Ask F7", icon: "chatbubble-ellipses" as const, go: () => router.push("/chat") },
      ];

  return (
    <ScrollView
      style={{ backgroundColor: colors.black }}
      contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <HeroVideo source={require("@/assets/video/gym.mp4")} height={300} style={{ marginTop: -(insets.top + 20) }}>
        <View style={{ paddingTop: insets.top }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Body size="micro" style={{ letterSpacing: 1.4, color: "#eef2ef" }}>
              {brand.name.toUpperCase()} · {brand.city.toUpperCase()}
            </Body>
            <Pressable
              onPress={() => router.push("/profile")}
              accessibilityRole="button"
              accessibilityLabel="Profile"
              hitSlop={8}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.35)",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(0,0,0,0.35)",
              }}
            >
              <Body size="small" style={{ color: "#fff", fontWeight: "700" }}>
                {(member?.name || "F7").trim().slice(0, 2).toUpperCase()}
              </Body>
            </Pressable>
          </View>
          <Display size="hero" style={{ marginTop: 18, color: "#fff" }}>
            {member?.name ? hello(member.name) : "The floor is"}
          </Display>
          <Display size="hero" style={{ color: colors.green }}>
            {member?.name ? (hasPlan ? "Let's climb." : "Ready to start?") : "just base camp."}
          </Display>
        </View>
      </HeroVideo>

      {/* ---------- EMPTY STATE: no active plan ---------- */}
      {!hasPlan ? (
        <View style={{ paddingHorizontal: 20, marginTop: 18 }}>
          <AnnouncementCard />
          <Card accent>
            <Eyebrow>Your first week</Eyebrow>
            <Display size="h2" style={{ marginTop: 8 }}>
              {trialOffer.title}
            </Display>
            <Body style={{ marginTop: 8 }}>{trialOffer.body}</Body>
            <LimeButton label={trialOffer.cta} icon="flash" href={wa.trial()} style={{ marginTop: 16 }} />
            <Pressable
              onPress={() => router.push({ pathname: "/upgrade/[plan]", params: { plan: popular.id } })}
              accessibilityRole="button"
              style={{ minHeight: 44, justifyContent: "center", alignItems: "center", marginTop: 6 }}
            >
              <Body size="small" style={{ color: colors.lime, fontWeight: "600" }}>
                Or join on {popular.name} — {inr(popular.priceINR)} {popular.period}
              </Body>
            </Pressable>
          </Card>

          {member?.slot ? (
            <Body size="small" style={{ marginTop: 14 }}>
              You said you'd train in the {slotLabel[member.slot].toLowerCase()} slot. Walk in any day — no booking needed for a first session.
            </Body>
          ) : null}
        </View>
      ) : (
        /* ---------- MEMBER STATE ---------- */
        <View style={{ paddingHorizontal: 20, marginTop: 18 }}>
          {renewSoon ? (
            <Pressable
              onPress={() => router.push({ pathname: "/upgrade/[plan]", params: { plan: member!.plan!.id } })}
              accessibilityRole="button"
              style={({ pressed }) => [
                {
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  borderRadius: radius.md,
                  borderWidth: 1,
                  borderColor: "rgba(251,192,45,0.5)",
                  backgroundColor: "rgba(251,192,45,0.12)",
                  padding: 14,
                  marginBottom: 12,
                },
                pressed && { opacity: 0.85 },
              ]}
            >
              <Ionicons name="alert-circle" size={22} color="#FBC02D" />
              <View style={{ flex: 1 }}>
                <Body size="title" muted={false} style={{ fontWeight: "700" }}>
                  {renewDays! <= 0 ? "Your plan has ended" : `Plan ends in ${renewDays} day${renewDays === 1 ? "" : "s"}`}
                </Body>
                <Body size="small">Renew now and nothing changes — same slot, same price.</Body>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.muted} />
            </Pressable>
          ) : null}

          {/* Today — the one thing a member does every visit */}
          <Pressable onPress={() => router.push("/checkin")} accessibilityRole="button" style={({ pressed }) => [pressed && { opacity: 0.9 }]}>
            <Card accent={!checkedInToday} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: checkedInToday ? colors.green : colors.surface2,
                    borderWidth: checkedInToday ? 0 : 1,
                    borderColor: colors.line,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name={checkedInToday ? "checkmark" : "location"} size={24} color={checkedInToday ? colors.onAccent : colors.lime} />
                </View>
                <View style={{ flex: 1 }}>
                  <Body size="title" muted={false} style={{ fontWeight: "700" }}>
                    {checkedInToday ? "Checked in today" : "At the gym? Check in"}
                  </Body>
                  <Body size="small">
                    {member!.streakWeeks > 0 ? `${member!.streakWeeks}-week streak` : "Start your streak"} · {member!.checkins.length} visit{member!.checkins.length === 1 ? "" : "s"}
                  </Body>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.muted} />
              </View>
              <View style={{ marginTop: 16 }}>
                <WeekStrip checkins={member!.checkins} />
              </View>
            </Card>
          </Pressable>

          {/* Today — food, water, movement; opens the Today screen */}
          <TodayTile />
          <NudgeCard />
          <AnnouncementCard />

          <Card>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View>
                <Eyebrow>Your plan</Eyebrow>
                <Display size="h2" style={{ marginTop: 6 }}>
                  {member!.plan!.name}
                </Display>
                <Body size="small" style={{ marginTop: 2 }}>
                  Renews {longDate(member!.plan!.renewsOn)}
                </Body>
              </View>
              <Pill label="Active" tone="lime" />
            </View>
            <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
              <View style={{ flex: 1, borderRadius: radius.md, backgroundColor: colors.surface2, padding: 12 }}>
                <Display size="h1" style={{ color: colors.lime }}>
                  {member!.reserved.length}
                </Display>
                <Body size="micro">TREKS BOOKED</Body>
              </View>
              <View style={{ flex: 1, borderRadius: radius.md, backgroundColor: colors.surface2, padding: 12 }}>
                <Display size="h1" style={{ color: colors.lime }}>
                  {member!.followed.length}
                </Display>
                <Body size="micro">CLASSES FOLLOWED</Body>
              </View>
              <View style={{ flex: 1, borderRadius: radius.md, backgroundColor: colors.surface2, padding: 12 }}>
                <Display size="h1" style={{ color: colors.lime }}>
                  {member!.slot ? slotShort[member!.slot] : "—"}
                </Display>
                <Body size="micro">YOUR SLOT</Body>
              </View>
            </View>
          </Card>

          {followed.length ? (
            <View style={{ marginTop: 22 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Eyebrow>Your classes</Eyebrow>
                <Pressable onPress={() => router.push("/classes")} accessibilityRole="button" hitSlop={8}>
                  <Body size="small" style={{ color: colors.lime, fontWeight: "600" }}>
                    Manage
                  </Body>
                </Pressable>
              </View>
              <View style={{ marginTop: 10, gap: 8 }}>
                {followed.map((cls) => (
                  <View
                    key={cls.id}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                      borderRadius: radius.md,
                      borderWidth: 1,
                      borderColor: colors.line,
                      backgroundColor: colors.surface,
                      padding: 12,
                    }}
                  >
                    <Ionicons name="notifications" size={18} color={colors.lime} />
                    <View style={{ flex: 1 }}>
                      <Body size="small" muted={false} style={{ fontWeight: "600" }}>
                        {cls.name}
                      </Body>
                      <Body size="micro">{cls.schedule.toUpperCase()}</Body>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </View>
      )}

      {/* Quick actions — four, equal size, whole tile tappable */}
      <View style={{ flexDirection: "row", gap: 10, paddingHorizontal: 20, marginTop: 18 }}>
        {quickActions.map((action) => (
          <Pressable
            key={action.label}
            onPress={action.go}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            style={({ pressed }) => [
              {
                flex: 1,
                alignItems: "center",
                gap: 8,
                paddingVertical: 16,
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: colors.line,
                backgroundColor: colors.surface,
              },
              pressed && { borderColor: colors.lime },
            ]}
          >
            <Ionicons name={action.icon} size={20} color={colors.lime} />
            <Body size="micro" style={{ color: colors.white, textAlign: "center" }}>
              {action.label}
            </Body>
          </Pressable>
        ))}
      </View>

      {/* Next trek */}
      {trek ? (
        <View style={{ paddingHorizontal: 20, marginTop: 30 }}>
          <Eyebrow>Next expedition</Eyebrow>
          <Pressable
            onPress={() => router.push(`/trek/${trek.id}`)}
            accessibilityRole="button"
            style={({ pressed }) => [{ marginTop: 10 }, pressed && { opacity: 0.85 }]}
          >
            <Card accent={hasPlan}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Display size="h2">{trek.title}</Display>
                  <Body size="small" style={{ marginTop: 6 }}>
                    {longDate(trek.date)}
                  </Body>
                  <Body size="small" style={{ marginTop: 2 }}>
                    {trek.location} · {trek.distanceKm} km
                  </Body>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Display size="h1" style={{ color: colors.lime }}>
                    {daysUntil(trek.date)}
                  </Display>
                  <Body size="micro">DAYS OUT</Body>
                </View>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 18 }}>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <Pill label={trek.difficulty} tone="lime" />
                  <Pill label={`${trek.slotsLeft} slots left`} tone={trek.slotsLeft === 0 ? "red" : "muted"} />
                </View>
                <Body size="title" muted={false} style={{ fontWeight: "700" }}>
                  {inr(hasPlan ? trek.memberPriceINR : trek.priceINR)}
                </Body>
              </View>
            </Card>
          </Pressable>
        </View>
      ) : null}

      {/* Classes preview */}
      <View style={{ marginTop: 30 }}>
        <View style={{ paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Display size="h2">Today on the floor</Display>
          <Pressable onPress={() => router.push("/classes")} accessibilityRole="button" hitSlop={8}>
            <Body size="small" style={{ color: colors.lime, fontWeight: "600" }}>
              See all
            </Body>
          </Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12, marginTop: 14 }}>
          {classes.slice(0, 5).map((cls) => (
            <Card key={cls.id} style={{ width: 210 }}>
              <Ionicons name="barbell-outline" size={22} color={colors.lime} />
              <Body size="title" muted={false} style={{ marginTop: 12, fontWeight: "600" }}>
                {cls.name}
              </Body>
              <Body size="small" style={{ marginTop: 6 }}>
                {cls.tagline}
              </Body>
              <Body size="micro" style={{ marginTop: 12, color: colors.lime }}>
                {cls.schedule}
              </Body>
            </Card>
          ))}
        </ScrollView>
      </View>

      {/* Stats — only for visitors; members already know the gym */}
      {!hasPlan ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 20, marginTop: 30, gap: 10 }}>
          {stats.map((stat) => (
            <View
              key={stat.label}
              style={{
                flexBasis: "47%",
                flexGrow: 1,
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: colors.line,
                backgroundColor: colors.surface,
                paddingVertical: 18,
                alignItems: "center",
              }}
            >
              <Display size="h1" style={{ color: colors.lime }}>
                {stat.value}
              </Display>
              <Body size="micro" style={{ marginTop: 4, textAlign: "center" }}>
                {stat.label.toUpperCase()}
              </Body>
            </View>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}
