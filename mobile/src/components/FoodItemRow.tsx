import { useState } from "react";
import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { FOOD_BY_ID, macrosFor, similarFoods, type Food } from "@f7/content";
import { radius } from "@/theme";
import { useColors } from "@/theme/ThemeProvider";
import { Body } from "@/components/ui";
import { Kcal } from "@/components/Kcal";
import type { DraftItem } from "@/state/food";

/** Round grams to a sensible step: idli → 40 g each, rice → 25 g, drinks → 30 ml. */
function stepFor(item: DraftItem): number {
  const f = item.foodId ? FOOD_BY_ID[item.foodId] : undefined;
  if (f?.unit === "piece") return f.portion.grams;
  if (f?.category === "drink") return 30;
  return 25;
}

/** Re-scale macros when grams change (table foods exactly; model items proportionally). */
export function rescale(item: DraftItem, grams: number): DraftItem {
  const g = Math.max(1, Math.round(grams));
  const f = item.foodId ? FOOD_BY_ID[item.foodId] : undefined;
  if (f) return { ...item, grams: g, ...macrosFor(f, g), portionLabel: labelFor(f, g) };
  const k = g / Math.max(1, item.grams);
  return {
    ...item,
    grams: g,
    kcal: Math.round(item.kcal * k),
    proteinG: Math.round(item.proteinG * k * 10) / 10,
    carbsG: Math.round(item.carbsG * k * 10) / 10,
    fatG: Math.round(item.fatG * k * 10) / 10,
    portionLabel: `${g} g`,
  };
}

function labelFor(f: Food, grams: number): string {
  // pieces in halves (2, 2.5 idli); everything else in tenths
  const n = f.unit === "piece" ? Math.round((grams / f.portion.grams) * 2) / 2 : Math.round((grams / f.portion.grams) * 10) / 10;
  if (f.unit === "piece") return `${n} × ${f.portion.label.replace(/^1 /, "")}`;
  if (n === 1) return f.portion.label;
  return `${grams} ${f.category === "drink" ? "ml" : "g"}`;
}

export function swapTo(item: DraftItem, f: Food): DraftItem {
  return { ...item, name: f.name, foodId: f.id, ...macrosFor(f, item.grams), portionLabel: labelFor(f, item.grams), confidence: 1, source: "table", needsConfirm: false, estimate: !!f.estimate };
}

/**
 * One editable food line: name, portion, kcal; ± stepper; a confidence pill
 * that says "Check this" when the number is a guess; "Swap" opens a row of
 * near neighbours from the table.
 */
export function FoodItemRow({
  item,
  onChange,
  onRemove,
  hideCalories,
}: {
  item: DraftItem;
  onChange: (next: DraftItem) => void;
  onRemove?: () => void;
  hideCalories?: boolean;
}) {
  const colors = useColors();
  const [swapping, setSwapping] = useState(false);
  const food = item.foodId ? FOOD_BY_ID[item.foodId] : undefined;
  const step = stepFor(item);
  const sure = item.confidence >= 0.85 && !item.needsConfirm;
  const alternatives = food ? similarFoods(food, 5) : [];

  const bump = (dir: 1 | -1) => {
    Haptics.selectionAsync().catch(() => {});
    onChange(rescale(item, item.grams + dir * step));
  };

  const btn = (icon: "add" | "remove", onPress: () => void, label: string, disabled?: boolean) => (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      style={({ pressed }) => [
        { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface2, opacity: disabled ? 0.4 : 1 },
        pressed && { borderColor: colors.green },
      ]}
    >
      <Ionicons name={icon} size={18} color={colors.white} />
    </Pressable>
  );

  return (
    <View style={{ borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, padding: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Body size="title" muted={false} style={{ fontWeight: "600" }} numberOfLines={2}>
            {item.name}
          </Body>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2, flexWrap: "wrap" }}>
            <Body size="small">
              {/^\d+ ?(g|ml)$/.test(item.portionLabel) ? "" : `${item.portionLabel} · `}
              {item.grams} {food?.category === "drink" ? "ml" : "g"}
            </Body>
            <View style={{ borderRadius: radius.pill, borderWidth: 1, borderColor: sure ? colors.accentBorder : colors.line, paddingHorizontal: 8, paddingVertical: 2 }}>
              <Body size="micro" style={{ color: sure ? colors.lime : colors.muted, fontWeight: "700" }}>
                {sure ? "From the table" : "Check this"}
              </Body>
            </View>
          </View>
        </View>
        {!hideCalories ? (
          <View style={{ alignItems: "flex-end" }}>
            <Kcal value={item.kcal} size="title" />
            <Body size="micro">{Math.round(item.proteinG)} g protein</Body>
          </View>
        ) : null}
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 }}>
        {btn("remove", () => bump(-1), "Less", item.grams <= step)}
        {btn("add", () => bump(1), "More")}
        <View style={{ flex: 1 }} />
        {alternatives.length ? (
          <Pressable onPress={() => setSwapping((s) => !s)} accessibilityRole="button" accessibilityLabel="Swap for a similar food" style={{ minHeight: 36, justifyContent: "center", paddingHorizontal: 8 }}>
            <Body size="small" style={{ color: colors.lime, fontWeight: "600" }}>{swapping ? "Done" : "Swap"}</Body>
          </Pressable>
        ) : null}
        {onRemove ? (
          <Pressable onPress={onRemove} accessibilityRole="button" accessibilityLabel="Remove item" hitSlop={6} style={{ width: 36, height: 36, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="close" size={18} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>

      {swapping ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
          {alternatives.map((f) => (
            <Pressable
              key={f.id}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                onChange(swapTo(item, f));
                setSwapping(false);
              }}
              accessibilityRole="button"
              style={{ minHeight: 36, paddingHorizontal: 12, justifyContent: "center", borderRadius: radius.pill, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface2 }}
            >
              <Body size="small" muted={false}>{f.name}</Body>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}
