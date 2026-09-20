import { useState } from "react";
import { LayoutAnimation, Platform, Pressable, ScrollView, UIManager, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { classes, wa } from "@f7/content";
import { useColors } from "@/theme/ThemeProvider";
import { useSession } from "@/state/session";
import * as Haptics from "expo-haptics";
import { Body, Card, LimeButton, Pill, SectionHeader } from "@/components/ui";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const tone = {
  Low: "muted",
  Moderate: "amber",
  High: "red",
  "All levels": "lime",
} as const;

export default function Classes() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState<string | null>(null);
  const { member, toggleFollow } = useSession();

  return (
    <ScrollView
      style={{ backgroundColor: colors.black }}
      contentContainerStyle={{
        paddingTop: insets.top + 20,
        paddingHorizontal: 20,
        paddingBottom: 40,
      }}
      showsVerticalScrollIndicator={false}
    >
      <SectionHeader
        eyebrow="What we run"
        title="Eight ways to get strong"
        body="Every class is coached. Tap one to see what a session looks like."
      />

      <View style={{ gap: 12 }}>
        {classes.map((cls) => {
          const isOpen = open === cls.id;
          const following = !!member?.followed.includes(cls.id);
          return (
            <Pressable
              key={cls.id}
              accessibilityRole="button"
              accessibilityState={{ expanded: isOpen }}
              onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setOpen(isOpen ? null : cls.id);
              }}
            >
              <Card style={isOpen ? { borderColor: "rgba(200,255,30,0.4)" } : undefined}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: colors.line,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="barbell-outline" size={20} color={colors.lime} />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Body size="title" muted={false} style={{ fontWeight: "600" }}>
                      {cls.name}
                    </Body>
                    <Body size="small" style={{ marginTop: 3 }}>
                      {cls.tagline}
                    </Body>
                  </View>

                  <Pressable
                    onPress={() => {
                      Haptics.selectionAsync().catch(() => {});
                      toggleFollow(cls.id);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={following ? `Stop following ${cls.name}` : `Follow ${cls.name}`}
                    accessibilityState={{ selected: following }}
                    hitSlop={6}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: following ? colors.green : "transparent",
                      borderWidth: following ? 0 : 1,
                      borderColor: colors.line,
                    }}
                  >
                    <Ionicons name={following ? "notifications" : "notifications-outline"} size={18} color={following ? colors.onAccent : colors.muted} />
                  </Pressable>
                </View>

                {isOpen ? (
                  <View style={{ marginTop: 16 }}>
                    <Body>{cls.description}</Body>
                    <View style={{ flexDirection: "row", gap: 8, marginTop: 14 }}>
                      <Pill label={cls.intensity} tone={tone[cls.intensity]} />
                      <Pill label={`${cls.durationMin} min`} tone="muted" />
                    </View>
                    <Body size="small" style={{ marginTop: 12, color: colors.lime }}>
                      {cls.schedule}
                    </Body>
                    <Body size="small" style={{ marginTop: 6 }}>
                      {following ? "You follow this class — you'll get a reminder 30 minutes before." : "Tap the bell to follow it and get a reminder before each session."}
                    </Body>
                    <LimeButton
                      label={member?.plan ? "Tell the coach I'm coming" : "Try this class"}
                      icon="logo-whatsapp"
                      href={wa.class(cls.name)}
                      style={{ marginTop: 16 }}
                    />
                  </View>
                ) : (
                  <View style={{ flexDirection: "row", gap: 8, marginTop: 14 }}>
                    <Pill label={cls.intensity} tone={tone[cls.intensity]} />
                    <Pill label={`${cls.durationMin} min`} tone="muted" />
                  </View>
                )}
              </Card>
            </Pressable>
          );
        })}
      </View>

      <LimeButton
        label="Ask a coach which suits you"
        icon="chatbubble-ellipses"
        variant="outline"
        href={wa.general()}
        style={{ marginTop: 20 }}
      />
    </ScrollView>
  );
}
