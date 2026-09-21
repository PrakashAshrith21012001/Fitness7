import { useState } from "react";
import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { GLASS_SIZES } from "@f7/content";
import { radius } from "@/theme";
import { useColors } from "@/theme/ThemeProvider";
import { useSession, today } from "@/state/session";
import { useDay } from "@/state/day";
import { Body, Card, Eyebrow } from "@/components/ui";

/**
 * Water — a row of glasses. Tap the next empty one as you drink; tap the last
 * full one to take it back. The goal comes from weight + today's training
 * unless the member set their own. Glass size is one tap away, not a form.
 */
export function WaterStrip({ compact }: { compact?: boolean }) {
  const colors = useColors();
  const { member, update } = useSession();
  const { waterMl, waterGoal, glassMl, setWater } = useDay();
  const [sizing, setSizing] = useState(false);
  const date = today();
  const ml = waterMl(date);
  const goal = waterGoal(date);
  const drunk = Math.round(ml / glassMl);
  const goalGlasses = Math.max(1, Math.round(goal / glassMl));
  const shown = Math.min(16, Math.max(goalGlasses, drunk));
  const done = ml >= goal;

  const tap = (i: number) => {
    Haptics.selectionAsync().catch(() => {});
    // tapping glass i (0-based): fill up to i+1; tapping the last filled glass empties it
    const next = i + 1 === drunk ? i : i + 1;
    void setWater(next * glassMl, date);
  };

  return (
    <Card style={compact ? undefined : { marginTop: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" }}>
        <Eyebrow>Water</Eyebrow>
        <Body size="small" muted={!done} style={done ? { color: colors.lime, fontWeight: "600" } : undefined}>
          {done ? "Goal reached" : `${drunk} of ${goalGlasses} glasses`}
        </Body>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
        {Array.from({ length: shown }, (_, i) => {
          const full = i < drunk;
          const next = i === drunk;
          return (
            <Pressable
              key={i}
              onPress={() => tap(i)}
              accessibilityRole="button"
              accessibilityLabel={full ? `Glass ${i + 1}, full — tap to remove` : `Glass ${i + 1} — tap to drink`}
              hitSlop={2}
              style={({ pressed }) => [
                {
                  width: 44,
                  height: 44,
                  borderRadius: radius.md,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: full ? "rgba(46,204,113,0.45)" : next ? colors.lime : colors.line,
                  borderStyle: next ? "dashed" : "solid",
                  backgroundColor: full ? colors.limeSoft : colors.surface2,
                },
                pressed && { opacity: 0.8 },
              ]}
            >
              <Ionicons name={full ? "water" : "water-outline"} size={20} color={full || next ? colors.lime : colors.muted} />
            </Pressable>
          );
        })}
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
        <Body size="small">
          {ml} ml · glass {glassMl} ml
        </Body>
        <Pressable onPress={() => setSizing((s) => !s)} accessibilityRole="button" accessibilityLabel="Change glass size" hitSlop={8} style={{ minHeight: 32, justifyContent: "center" }}>
          <Body size="small" style={{ color: colors.lime, fontWeight: "600" }}>{sizing ? "Done" : "Glass size"}</Body>
        </Pressable>
      </View>
      {sizing ? (
        <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
          {GLASS_SIZES.map((g) => {
            const on = g === glassMl;
            return (
              <Pressable
                key={g}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  if (member) update({ glassMl: g });
                }}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                style={{ flex: 1, minHeight: 40, alignItems: "center", justifyContent: "center", borderRadius: radius.pill, borderWidth: 1, borderColor: on ? colors.green : colors.line, backgroundColor: on ? colors.green : colors.surface2 }}
              >
                <Body size="small" style={{ fontWeight: "600", color: on ? colors.onAccent : colors.white }}>{g} ml</Body>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </Card>
  );
}
