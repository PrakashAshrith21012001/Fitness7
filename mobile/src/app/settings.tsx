import { useEffect, useState } from "react";
import { Alert, Linking, Platform, Pressable, Switch, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { contact, wa, telLink } from "@f7/content";
import { radius, type } from "@/theme";
import { useColors, useTheme } from "@/theme/ThemeProvider";
import { useSession, prettyPhone, type Goal, type Slot } from "@/state/session";
import { Body } from "@/components/ui";
import { Group, Row, Screen } from "@/components/Screen";

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

function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { id: T; label: string }[];
  onChange: (v: T) => void;
}) {
  const colors = useColors();
  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: colors.surface2,
        borderRadius: radius.pill,
        padding: 4,
        gap: 4,
      }}
    >
      {options.map((o) => {
        const on = o.id === value;
        return (
          <Pressable
            key={o.id}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              onChange(o.id);
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            style={{
              flex: 1,
              minHeight: 40,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: radius.pill,
              backgroundColor: on ? colors.green : "transparent",
            }}
          >
            <Body size="small" style={{ fontWeight: "700", color: on ? colors.onAccent : colors.white }}>
              {o.label}
            </Body>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Wrapping chips for lists whose labels don't fit a segmented bar. */
function Chips<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { id: T; label: string }[];
  onChange: (v: T) => void;
}) {
  const colors = useColors();
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {options.map((o) => {
        const on = o.id === value;
        return (
          <Pressable
            key={o.id}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              onChange(o.id);
            }}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            style={{
              minHeight: 40,
              paddingHorizontal: 16,
              justifyContent: "center",
              borderRadius: radius.pill,
              borderWidth: 1,
              borderColor: on ? colors.green : colors.line,
              backgroundColor: on ? colors.green : colors.surface2,
            }}
          >
            <Body size="small" style={{ fontWeight: "600", color: on ? colors.onAccent : colors.white }}>
              {o.label}
            </Body>
          </Pressable>
        );
      })}
    </View>
  );
}

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
  useEffect(() => {
    if (member?.name) setName(member.name);
  }, [member?.name]);
  if (!member) return null;

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
      </Group>

      <Group title="Notifications">
        <Row
          first
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
          value="Stored on this phone only. Nothing is shared or sold."
        />
        <Row
          icon="trash-outline"
          label="Delete my data"
          value="Removes your profile from this phone"
          onPress={() => {
            const go = () => signOut().then(() => router.replace("/"));
            if (Platform.OS === "web") return go();
            Alert.alert("Delete your data?", "Your profile and preferences on this phone will be removed.", [
              { text: "Cancel", style: "cancel" },
              { text: "Delete", style: "destructive", onPress: go },
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
