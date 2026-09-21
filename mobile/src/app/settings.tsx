import { useEffect, useState } from "react";
import { Alert, Linking, Platform, Pressable, Switch, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { contact, wa, telLink } from "@f7/content";
import { radius, type } from "@/theme";
import { useColors, useTheme } from "@/theme/ThemeProvider";
import { useSession, prettyPhone, type Goal, type Slot } from "@/state/session";
import { isConfigured } from "@/lib/supabase";
import { api } from "@/lib/api";
import { Body, Display } from "@/components/ui";
import { Group, Row, Screen } from "@/components/Screen";
import { Chips, Segmented } from "@/components/Pickers";
import { NumbersForm, type Numbers } from "@/components/NumbersForm";
import { TargetCard } from "@/components/TargetCard";
import { WaterGoalRow } from "@/components/WaterGoalRow";
import { ensurePermission } from "@/lib/reminders";

const goals: { id: Goal; label: string }[] = [
  { id: "strength", label: "Get stronger" },
  { id: "fat-loss", label: "Lose fat" },
  { id: "trek", label: "Train for treks" },
  { id: "general", label: "Stay fit" },
];
const slots: { id: Slot; label: string }[] = [
  { id: "early", label: "Early · 5–8 AM" },
  { id: "morning", label: "Morning · 8–12" },
  { id: "ladies", label: "Ladies' hour · 11–1" },
  { id: "evening", label: "Evening · 4–10 PM" },
];

/**
 * Settings, grouped the way the platform groups them: Profile · Training ·
 * Notifications · Appearance · Support · Account. Destructive action last,
 * red, alone (Von Restorff). Every switch is a real toggle with a label that
 * says what turning it on does, not a vague "Notifications".
 */
export default function Settings() {
  const colors = useColors();
  const router = useRouter();
  const { pref, setTheme } = useTheme();
  const { member, update, signOut } = useSession();
  const [name, setName] = useState(member?.name ?? "");
  const [numbers, setNumbers] = useState<Numbers>({
    heightCm: member?.heightCm, age: member?.age, sex: member?.sex, activity: member?.activity,
  });
  useEffect(() => {
    if (member?.name) setName(member.name);
  }, [member?.name]);
  if (!member) return null;

  const saveNumbers = (n: Numbers) => {
    setNumbers(n);
    const changed = n.heightCm !== member.heightCm || n.age !== member.age || n.sex !== member.sex || n.activity !== member.activity;
    if (changed) update({ heightCm: n.heightCm, age: n.age, sex: n.sex, activity: n.activity });
  };

  const toggle = (key: keyof typeof member.notifications) => (v: boolean) => {
    Haptics.selectionAsync().catch(() => {});
    update({ notifications: { ...member.notifications, [key]: v } });
  };

  const confirmSignOut = () => {
    const go = () => signOut().then(() => router.replace("/"));
    if (Platform.OS === "web") {
      go();
      return;
    }
    Alert.alert("Sign out?", "You'll need your number to sign back in.", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: go },
    ]);
  };

  const sw = (value: boolean, onChange: (v: boolean) => void, label: string) => (
    <Switch
      value={value}
      onValueChange={onChange}
      accessibilityLabel={label}
      trackColor={{ false: colors.line, true: colors.green }}
      thumbColor="#ffffff"
      ios_backgroundColor={colors.line}
    />
  );

  return (
    <Screen title="Settings">
      <Group title="Profile">
        <View style={{ padding: 16 }}>
          <Body size="micro" style={{ letterSpacing: 1.4, marginBottom: 8 }}>
            NAME
          </Body>
          <TextInput
            value={name}
            onChangeText={setName}
            onBlur={() => name.trim() && name.trim() !== member.name && update({ name: name.trim() })}
            placeholder="Your name"
            placeholderTextColor={colors.muted}
            accessibilityLabel="Name"
            style={{
              minHeight: 48,
              borderRadius: radius.md,
              borderWidth: 1,
              borderColor: colors.line,
              backgroundColor: colors.surface2,
              paddingHorizontal: 14,
              color: colors.white,
              ...type.title,
            }}
          />
        </View>
        <Row icon="call-outline" label={member.phone ? "Mobile number" : "Email"} value={member.phone ? prettyPhone(member.phone) : member.email ?? "—"} />
      </Group>

      <Group title="Training">
        <View style={{ padding: 16, gap: 14 }}>
          <View>
            <Body size="micro" style={{ letterSpacing: 1.4, marginBottom: 8 }}>
              GOAL
            </Body>
            <Chips value={member.goal ?? "general"} options={goals} onChange={(goal) => update({ goal })} />
          </View>
          <View>
            <Body size="micro" style={{ letterSpacing: 1.4, marginBottom: 8 }}>
              PREFERRED SLOT
            </Body>
            <Chips value={member.slot ?? "evening"} options={slots} onChange={(slot) => update({ slot })} />
          </View>
        </View>
        <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: colors.line }}>
          <Display size="h2" style={{ textTransform: "none", letterSpacing: -0.3 }}>Your numbers</Display>
          <Body size="small" style={{ marginTop: 4, marginBottom: 16 }}>For the daily energy and protein target on the Food screen. Weight comes from Progress.</Body>
          <NumbersForm value={numbers} onChange={saveNumbers} />
          <View style={{ marginTop: 16 }}>
            <TargetCard />
          </View>
        </View>
        <WaterGoalRow />
        <Row
          icon="eye-off-outline"
          label="Hide calories"
          value="Food still logs; the numbers stay out of sight"
          right={sw(!!member.hideCalories, (v) => update({ hideCalories: v }), "Hide calories")}
        />
      </Group>

      <Group title="Notifications">
        <Row
          first
          icon="restaurant-outline"
          label="Meal reminders"
          value="Only when a meal hasn't been logged — 9:30, 1:30, 9 pm"
          right={sw(member.notifications.meals, (v) => { toggle("meals")(v); if (v) void ensurePermission(true); }, "Meal reminders")}
        />
        <Row
          icon="water-outline"
          label="Water reminders"
          value="5 pm and 8:30 pm, only if you're behind"
          right={sw(member.notifications.water, (v) => { toggle("water")(v); if (v) void ensurePermission(true); }, "Water reminders")}
        />
        <Row
          icon="barbell-outline"
          label="Class reminders"
          value="30 minutes before a class you follow"
          right={sw(member.notifications.classes, toggle("classes"), "Class reminders")}
        />
        <Row
          icon="trail-sign-outline"
          label="Trek announcements"
          value="When a new trek opens for booking"
          right={sw(member.notifications.treks, toggle("treks"), "Trek announcements")}
        />
        <Row
          icon="card-outline"
          label="Renewal reminders"
          value="A week before your plan ends"
          right={sw(member.notifications.renewals, toggle("renewals"), "Renewal reminders")}
        />
      </Group>

      <Group title="Appearance">
        <View style={{ padding: 16 }}>
          <Segmented
            value={pref}
            options={[
              { id: "light", label: "Light" },
              { id: "dark", label: "Dark" },
              { id: "system", label: "System" },
            ]}
            onChange={(t) => setTheme(t)}
          />
          <Body size="small" style={{ marginTop: 10 }}>
            System follows your phone's setting.
          </Body>
        </View>
      </Group>

      <Group title="Support">
        <Row first icon="chatbubble-ellipses-outline" label="Ask F7" value="Instant answers from the gym" onPress={() => router.push("/chat")} />
        <Row icon="logo-whatsapp" label="WhatsApp" value={contact.phoneDisplay} onPress={() => Linking.openURL(wa.general()).catch(() => {})} />
        <Row icon="call-outline" label="Call the gym" value={contact.phoneDisplay} onPress={() => Linking.openURL(telLink()).catch(() => {})} />
        <Row icon="location-outline" label="Visit & hours" onPress={() => router.push("/visit")} />
      </Group>

      <Group title="Privacy">
        <Row
          first
          icon="shield-checkmark-outline"
          label="Your data"
          value={isConfigured ? "Kept in your Fitness 7 account and on this phone. Nothing is shared or sold." : "Stored on this phone only. Nothing is shared or sold."}
        />
        <Row
          icon="trash-outline"
          label="Delete my data"
          value={isConfigured ? "Removes your account and everything in it" : "Removes your profile from this phone"}
          onPress={() => {
            const go = async () => {
              if (isConfigured && !member.id.startsWith("local-")) {
                // Best effort: if the site is unreachable the sign-out still happens; support can finish the delete.
                await api("/api/member/me", { method: "DELETE" }).catch(() => {});
              }
              await signOut();
              router.replace("/");
            };
            if (Platform.OS === "web") return void go();
            Alert.alert("Delete your data?", isConfigured ? "Your account, check-ins, weights and food log will be deleted. This can't be undone." : "Your profile and preferences on this phone will be removed.", [
              { text: "Cancel", style: "cancel" },
              { text: "Delete", style: "destructive", onPress: () => void go() },
            ]);
          }}
        />
      </Group>

      <Group>
        <Row
          first
          icon="log-out-outline"
          label="Sign out"
          danger
          onPress={confirmSignOut}
          right={<Ionicons name="chevron-forward" size={16} color={colors.danger} />}
        />
      </Group>

      <Body size="micro" style={{ textAlign: "center", marginTop: 24, letterSpacing: 1 }}>
        FITNESS 7 GYM UNISEX · APP 1.0
      </Body>
    </Screen>
  );
}
