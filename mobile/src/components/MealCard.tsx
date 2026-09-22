import { useState } from "react";
import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { fmtKcal, type MealSlot } from "@f7/content";
import { radius } from "@/theme";
import { useColors, useTheme } from "@/theme/ThemeProvider";
import { Body } from "@/components/ui";
import { PressScale, elevation } from "@/components/motion";
import type { FoodEntry } from "@/state/food";
import { Kcal } from "@/components/Kcal";

/** How a day's budget is usually split — a guide, not a rule. Sums to 1. */
export const MEAL_SHARE: Record<MealSlot, number> = { breakfast: 0.25, lunch: 0.35, snacks: 0.1, dinner: 0.3 };

const META: Record<MealSlot, { icon: keyof typeof Ionicons.glyphMap; hint: string; share: number }> = {
  breakfast: { icon: "sunny-outline", hint: "Idli, dosa, pongal…", share: MEAL_SHARE.breakfast },
  lunch: { icon: "restaurant-outline", hint: "Meals, biryani, curd rice…", share: MEAL_SHARE.lunch },
  snacks: { icon: "cafe-outline", hint: "Tea, sundal, fruit…", share: MEAL_SHARE.snacks },
  dinner: { icon: "moon-outline", hint: "Chapati, dosa, rice…", share: MEAL_SHARE.dinner },
};

/**
 * One meal on Today. Collapsed: icon, name, what's in it, kcal, and a round
 * + that opens Add with this meal preselected — one tap from the day to the
 * plate. Tap the row to expand and remove lines.
 */
export function MealCard({ slot, label, entries, target, hideCalories, onRemove }: { slot: MealSlot; label: string; entries: FoodEntry[]; target: number | null; hideCalories?: boolean; onRemove: (id: string) => void }) {
  const colors = useColors();
  const { theme } = useTheme();
  const dark = theme === "dark";
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const m = META[slot];
  const kcal = entries.reduce((a, b) => a + b.kcal, 0);
  const guide = target ? Math.round(target * m.share) : null;
  const names = entries.map((e) => e.name).join(", ");
  const filled = entries.length > 0;

  return (
    <View style={[{ borderRadius: radius.lg, borderWidth: dark ? 1 : 0, borderColor: colors.line, backgroundColor: colors.surface, overflow: "hidden" }, elevation(dark)]}>
      <Pressable
        onPress={() => filled && setOpen((o) => !o)}
        accessibilityRole={filled ? "button" : undefined}
        accessibilityLabel={filled ? `${label}: ${names}` : `${label}, nothing logged`}
        style={({ pressed }) => [{ flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 16, paddingVertical: 14, minHeight: 76 }, pressed && filled && { backgroundColor: colors.surface2 }]}
      >
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: filled ? colors.limeSoft : colors.surface2, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name={m.icon} size={20} color={filled ? colors.lime : colors.muted} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
            <Body size="title" muted={false} style={{ fontWeight: "700" }}>{label}</Body>
            {!hideCalories && guide && !filled ? <Body size="micro">aim ~{fmtKcal(guide)} kcal</Body> : null}
          </View>
          <Body size="small" numberOfLines={1} style={{ marginTop: 2 }}>{filled ? names : m.hint}</Body>
        </View>
        {filled && !hideCalories ? (
          <View style={{ alignItems: "flex-end" }}>
            <Kcal value={kcal} size="title" color={guide && kcal > guide * 1.15 ? colors.danger : undefined} />
            {guide ? <Body size="micro">of {fmtKcal(guide)}</Body> : null}
          </View>
        ) : null}
        <PressScale
          onPress={() => router.push({ pathname: "/food/add", params: { meal: slot } })}
          accessibilityRole="button"
          accessibilityLabel={`Add to ${label}`}
          hitSlop={6}
          scale={0.9}
          style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: colors.green, alignItems: "center", justifyContent: "center", shadowColor: colors.green, shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }}
        >
          <Ionicons name="add" size={22} color={colors.onAccent} />
        </PressScale>
      </Pressable>
      {open && filled ? (
        <View style={{ borderTopWidth: 1, borderTopColor: colors.line, paddingHorizontal: 16, paddingVertical: 4 }}>
          {entries.map((e) => (
            <View key={e.id} style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 48 }}>
              <View style={{ flex: 1 }}>
                <Body size="body" muted={false} numberOfLines={1}>{e.name}</Body>
                <Body size="micro">{(e.portionLabel ?? `${e.grams} g`)}{e.confidence < 0.85 ? " · estimate" : ""}</Body>
              </View>
              {!hideCalories ? <Kcal value={e.kcal} size="small" weight="600" /> : null}
              <Pressable onPress={() => onRemove(e.id)} accessibilityRole="button" accessibilityLabel={`Remove ${e.name}`} hitSlop={8} style={{ width: 36, height: 36, alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="close" size={16} color={colors.muted} />
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
