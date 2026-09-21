import { useState } from "react";
import { Pressable, View } from "react-native";
import * as Haptics from "expo-haptics";
import { waterTargetMl } from "@f7/content";
import { radius } from "@/theme";
import { useColors } from "@/theme/ThemeProvider";
import { useSession } from "@/state/session";
import { useDay } from "@/state/day";
import { Body } from "@/components/ui";

const CHOICES = [1500, 2000, 2500, 3000, 3500, 4000];

/** Settings → Training: daily water goal. "Auto" follows weight and the day's training; or pick a number. */
export function WaterGoalRow() {
  const colors = useColors();
  const { member, update } = useSession();
  const { kg, glassMl } = useDay();
  const [open, setOpen] = useState(false);
  if (!member) return null;
  const auto = waterTargetMl(kg, 0, glassMl);
  const goal = member.waterGoalMl;

  const chip = (label: string, on: boolean, onPress: () => void) => (
    <Pressable
      key={label}
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onPress();
      }}
      accessibilityRole="radio"
      accessibilityState={{ selected: on }}
      style={{ minHeight: 40, paddingHorizontal: 14, justifyContent: "center", borderRadius: radius.pill, borderWidth: 1, borderColor: on ? colors.green : colors.line, backgroundColor: on ? colors.green : colors.surface2 }}
    >
      <Body size="small" style={{ fontWeight: "600", color: on ? colors.onAccent : colors.white }}>{label}</Body>
    </Pressable>
  );

  return (
    <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: colors.line }}>
      <Pressable onPress={() => setOpen((o) => !o)} accessibilityRole="button" accessibilityState={{ expanded: open }} style={{ flexDirection: "row", alignItems: "center", minHeight: 32 }}>
        <View style={{ flex: 1 }}>
          <Body size="title" muted={false} style={{ fontWeight: "500" }}>Water goal</Body>
          <Body size="small" style={{ marginTop: 1 }}>
            {goal ? `${goal} ml a day` : `Auto · ${auto} ml today, more on training days`}
          </Body>
        </View>
        <Body size="small" style={{ color: colors.lime, fontWeight: "600" }}>{open ? "Done" : "Change"}</Body>
      </Pressable>
      {open ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
          {chip("Auto", !goal, () => update({ waterGoalMl: undefined }))}
          {CHOICES.map((c) => chip(`${c / 1000} L`, goal === c, () => update({ waterGoalMl: c })))}
        </View>
      ) : null}
    </View>
  );
}
