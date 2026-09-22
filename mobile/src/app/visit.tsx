import { Linking, Pressable, ScrollView, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  contact,
  hours,
  addressLine,
  trainers,
  faqs,
  wa,
  telLink,
} from "@f7/content";
import { radius } from "@/theme";
import { useColors } from "@/theme/ThemeProvider";
import { Screen } from "@/components/Screen";
import { Body, Card, Display, LimeButton, SectionHeader } from "@/components/ui";

function Row({
  icon,
  label,
  value,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}`}
      onPress={onPress}
      style={({ pressed }) => [
        {
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
          padding: 16,
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor: colors.line,
          backgroundColor: colors.surface,
        },
        pressed && { borderColor: colors.lime },
      ]}
    >
      <Ionicons name={icon} size={20} color={colors.lime} />
      <View style={{ flex: 1 }}>
        <Body size="micro">{label}</Body>
        <Body size="small" style={{ color: colors.white, marginTop: 2 }}>
          {value}
        </Body>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.muted} />
    </Pressable>
  );
}

const open = (url: string) => Linking.openURL(url).catch(() => {});

export default function Visit() {
  const colors = useColors();

  return (
    <Screen title="Visit">
      <SectionHeader
        eyebrow="Come see the place"
        title="Walk in. Train. Decide after."
        body="Open early and late, six days a week. No appointment needed for a first session."
      />

      <View style={{ gap: 10 }}>
        <Row
          icon="location-outline"
          label="Find us"
          value={addressLine}
          onPress={() => open(contact.mapsUrl)}
        />
        <Row
          icon="call-outline"
          label="Call"
          value={contact.phoneDisplay}
          onPress={() => open(telLink())}
        />
        <Row
          icon="logo-whatsapp"
          label="WhatsApp"
          value="Message the gym"
          onPress={() => open(wa.general())}
        />
        <Row
          icon="mail-outline"
          label="Email"
          value={contact.email}
          onPress={() => open(`mailto:${contact.email}`)}
        />
        <Row
          icon="camera-outline"
          label="Instagram"
          value="@f7gym_dpi"
          onPress={() => open(contact.instagram)}
        />
      </View>

      {/* Hours */}
      <Display size="h2" style={{ marginTop: 30 }}>Opening hours</Display>
      <Card style={{ marginTop: 12, padding: 0, overflow: "hidden" }}>
        {hours.map((h, i) => (
          <View
            key={h.day}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 13,
              borderTopWidth: i === 0 ? 0 : 1,
              borderTopColor: colors.line,
            }}
          >
            <Body size="small" style={{ color: colors.white, flex: 1 }}>
              {h.day}
            </Body>
            <Body size="small" style={{ textAlign: "right" }}>
              {h.morning ?? "—"}
              {"\n"}
              {h.evening ?? "Closed"}
            </Body>
          </View>
        ))}
      </Card>

      {/* Trainers */}
      <Display size="h2" style={{ marginTop: 30 }}>Your coaches</Display>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, marginTop: 12, paddingRight: 20 }}
      >
        {trainers.map((t) => (
          <Card key={t.id} style={{ width: 200 }}>
            <View
              style={{
                width: 46,
                height: 46,
                borderRadius: radius.pill,
                borderWidth: 1,
                borderColor: "rgba(200,255,30,0.4)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Body size="title" style={{ color: colors.lime, fontWeight: "700" }}>
                {t.name.replace(/^Coach\s+/i, "").slice(0, 2).toUpperCase()}
              </Body>
            </View>
            <Body size="title" muted={false} style={{ marginTop: 12, fontWeight: "600" }}>
              {t.name}
            </Body>
            <Body size="micro" style={{ color: colors.lime, marginTop: 3 }}>
              {t.role}
            </Body>
            <Body size="small" style={{ marginTop: 10 }}>
              {t.bio}
            </Body>
          </Card>
        ))}
      </ScrollView>

      {/* FAQ */}
      <Display size="h2" style={{ marginTop: 30 }}>Common questions</Display>
      <View style={{ marginTop: 12, gap: 12 }}>
        {faqs.slice(0, 4).map((f) => (
          <Card key={f.q}>
            <Body size="title" muted={false} style={{ fontWeight: "600" }}>
              {f.q}
            </Body>
            <Body size="small" style={{ marginTop: 8 }}>
              {f.a}
            </Body>
          </Card>
        ))}
      </View>

      <LimeButton
        label="Ask us anything"
        icon="chatbubble-ellipses"
        variant="outline"
        href={wa.general()}
        style={{ marginTop: 20 }}
      />
    </Screen>
  );
}
