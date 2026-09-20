import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { shortDate, wa } from "@f7/content";
import { radius, type } from "@/theme";
import { useColors } from "@/theme/ThemeProvider";
import { useSession, today } from "@/state/session";
import { Body, Card, Display, Eyebrow, LimeButton } from "@/components/ui";
import { Screen } from "@/components/Screen";
import { WeekStrip } from "@/components/WeekStrip";

/**
 * Progress. Two numbers a member actually cares about — how often they came,
 * and what the scale says — drawn plainly. The chart is Views, not a library:
 * ten bars, the latest in green, the range labelled. Nothing to install.
 */
export default function Progress() {
  const colors = useColors();
  const { member, logWeight } = useSession();
  const [kg, setKg] = useState("");
  if (!member) return null;

  const weights = member.weights.slice(-10);
  const latest = member.weights[member.weights.length - 1];
  const first = member.weights[0];
  const delta = latest && first && latest !== first ? Math.round((latest.kg - first.kg) * 10) / 10 : 0;
  const min = weights.length ? Math.min(...weights.map((w) => w.kg)) : 0;
  const max = weights.length ? Math.max(...weights.map((w) => w.kg)) : 0;
  const span = Math.max(max - min, 2);

  const total = member.checkins.length;
  const last30 = member.checkins.filter((d) => {
    const dt = new Date(d + "T12:00:00");
    return (Date.now() - dt.getTime()) / 86400000 <= 30;
  }).length;

  const valid = /^\d{2,3}(\.\d)?$/.test(kg) && Number(kg) >= 30 && Number(kg) <= 250;
  const save = async () => {
    if (!valid) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    await logWeight(Number(kg));
    setKg("");
  };

  return (
    <Screen title="Progress">
      {/* Attendance */}
      <View style={{ flexDirection: "row", gap: 10 }}>
        {[
          { v: String(member.streakWeeks), l: "WEEK STREAK" },
          { v: String(last30), l: "LAST 30 DAYS" },
          { v: String(total), l: "ALL TIME" },
        ].map((s) => (
          <View
            key={s.l}
            style={{ flex: 1, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, paddingVertical: 14, alignItems: "center" }}
          >
            <Display size="h1" style={{ color: colors.lime }}>
              {s.v}
            </Display>
            <Body size="micro" style={{ marginTop: 4, textAlign: "center" }}>
              {s.l}
            </Body>
          </View>
        ))}
      </View>

      <Card style={{ marginTop: 12 }}>
        <Eyebrow>This week</Eyebrow>
        <View style={{ marginTop: 14 }}>
          <WeekStrip checkins={member.checkins} />
        </View>
      </Card>

      {/* Weight */}
      <Card style={{ marginTop: 16 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
          <View>
            <Eyebrow>Body weight</Eyebrow>
            <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6, marginTop: 6 }}>
              <Display size="h1">{latest ? latest.kg : "—"}</Display>
              <Body size="small">kg</Body>
            </View>
          </View>
          {latest && first && latest !== first ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                borderRadius: radius.pill,
                borderWidth: 1,
                borderColor: colors.line,
                paddingHorizontal: 10,
                paddingVertical: 5,
              }}
            >
              <Ionicons name={delta < 0 ? "trending-down" : delta > 0 ? "trending-up" : "remove"} size={14} color={colors.lime} />
              <Body size="small" muted={false} style={{ fontWeight: "600" }}>
                {delta > 0 ? "+" : ""}
                {delta} kg since {shortDate(first.date)}
              </Body>
            </View>
          ) : null}
        </View>

        {weights.length >= 2 ? (
          <View style={{ marginTop: 18 }}>
            <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 6, height: 96 }}>
              {weights.map((w, i) => {
                const h = 24 + ((w.kg - min) / span) * 72;
                const last = i === weights.length - 1;
                return (
                  <View key={w.date} style={{ flex: 1, alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
                    <View
                      style={{
                        width: "100%",
                        height: h,
                        borderRadius: 6,
                        backgroundColor: last ? colors.green : colors.surface2,
                        borderWidth: last ? 0 : 1,
                        borderColor: colors.line,
                      }}
                    />
                  </View>
                );
              })}
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
              <Body size="micro">{shortDate(weights[0].date).toUpperCase()}</Body>
              <Body size="micro">
                {min}–{max} KG
              </Body>
              <Body size="micro">{shortDate(weights[weights.length - 1].date).toUpperCase()}</Body>
            </View>
          </View>
        ) : (
          <Body size="small" style={{ marginTop: 12 }}>
            Log your weight once a week, same time of day. Two entries and the chart appears.
          </Body>
        )}

        <View style={{ flexDirection: "row", gap: 10, marginTop: 18 }}>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              minHeight: 50,
              borderRadius: radius.md,
              borderWidth: 1,
              borderColor: colors.line,
              backgroundColor: colors.surface2,
              paddingHorizontal: 14,
            }}
          >
            <TextInput
              value={kg}
              onChangeText={(v) => setKg(v.replace(/[^\d.]/g, "").slice(0, 5))}
              keyboardType="decimal-pad"
              placeholder={latest ? String(latest.kg) : "72.5"}
              placeholderTextColor={colors.muted}
              accessibilityLabel="Weight in kilograms"
              returnKeyType="done"
              onSubmitEditing={save}
              style={{ flex: 1, color: colors.white, ...type.title, paddingVertical: 12 }}
            />
            <Body size="small">kg</Body>
          </View>
          <Pressable
            onPress={save}
            disabled={!valid}
            accessibilityRole="button"
            accessibilityLabel="Save weight"
            style={{
              width: 50,
              height: 50,
              borderRadius: radius.md,
              backgroundColor: colors.green,
              alignItems: "center",
              justifyContent: "center",
              opacity: valid ? 1 : 0.45,
            }}
          >
            <Ionicons name="checkmark" size={24} color={colors.onAccent} />
          </Pressable>
        </View>
        {member.weights.some((w) => w.date === today()) ? (
          <Body size="micro" style={{ marginTop: 8 }}>
            LOGGED TODAY · SAVING AGAIN REPLACES IT
          </Body>
        ) : null}
      </Card>

      <LimeButton label="Ask a coach about your numbers" icon="logo-whatsapp" variant="outline" href={wa.general()} style={{ marginTop: 16 }} />
    </Screen>
  );
}
