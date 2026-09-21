import { useState } from "react";
import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { fmtKcal, type MealSlot } from "@f7/content";
import { radius } from "@/theme";
import { useColors } from "@/theme/ThemeProvider";
import { Body } from "@/components/ui";
import type { FoodEntry } from "@/state/food";

const META: Record<MealSlot, { icon: keyof typeof Ionicons.glyphMap; hint: string; share: number }> = {
  breakfast: { icon: "sunny-outline", hint: "Idli, dosa, pongal…", share: 0.25 },
  lunch: { icon: "restaurant-outline", hint: "Meals, biryani, curd rice…", share: 0.35 },
  snacks: { icon: "cafe-outline", hint: "Tea, sundal, fruit…", share: 0.1 },
  dinner: { icon: "moon-outline", hint: "Chapati, dosa, rice…", share: 0.3 },
};

/**
 * One meal on Today. Collapsed: icon, name, what's in it, kcal, and a round
 * + that opens Add with this meal preselected — one tap from the day to the
 * plate. Tap the row to expand and remove lines.
 */
export function MealCard({ slot, label, entries, target, hideCalories, onRemove }: { slot: MealSlot; label: string; entries: FoodEntry[]; target: number | null; hideCalories?: boolean; onRemove: (id: string) => void }) {
  const colors = useColors();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const m = META[slot];
  const kcal = entries.reduce((a, b) => a + b.kcal, 0);
  const guide = target ? Math.round(target * m.share) : null;
  const names = entries.map((e) => e.name).join(", ");
  const filled = entries.length > 0;

  return (
    <View style={{ borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, overflow: "hidden" }}>
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
            {!hideCalories && guide && !filled ? <Body size="micro">~{fmtKcal(guide)} KCAL</Body> : null}
          </View>
          <Body size="small" numberOfLines={1} style={{ marginTop: 2 }}>{filled ? names : m.hint}</Body>
        </View>
        {filled && !hideCalories ? (
          <View style={{ alignItems: "flex-end" }}>
            <Body size="title" muted={false} style={{ fontWeight: "700" }}>{fmtKcal(kcal)}</Body>
            <Body size="micro">KCAL</Body>
          </View>
        ) : null}
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            router.push({ pathname: "/food/add", params: { meal: slot } });
          }}
          accessibilityRole="button"
          accessibilityLabel={`Add to ${label}`}
          hitSlop={6}
          style={({ pressed }) => [{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.green, alignItems: "center", justifyContent: "center" }, pressed && { transform: [{ scale: 0.94 }] }]}
        >
          <Ionicons name="add" size={22} color={colors.onAccent} />
        </Pressable>
      </Pressable>
      {open && filled ? (
        <View style={{ borderTopWidth: 1, borderTopColor: colors.line, paddingHorizontal: 16, paddingVertical: 4 }}>
          {entries.map((e) => (
            <View key={e.id} style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 48 }}>
              <View style={{ flex: 1 }}>
                <Body size="body" muted={false} numberOfLines={1}>{e.name}</Body>
                <Body size="micro">{(e.portionLabel ?? `${e.grams} g`).toUpperCase()}{e.confidence < 0.85 ? " · ESTIMATE" : ""}</Body>
              </View>
              {!hideCalories ? <Body size="small" muted={false} style={{ fontWeight: "600" }}>{e.kcal}</Body> : null}
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
