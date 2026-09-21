import { useState } from "react";
import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { FOOD_BY_ID, similarFoods } from "@f7/content";
import { radius } from "@/theme";
import { useColors } from "@/theme/ThemeProvider";
import { Body } from "@/components/ui";
import { rescale, swapTo } from "@/components/FoodItemRow";
import { portionStep, portionsOf } from "@/lib/food-picks";
import type { DraftItem } from "@/state/food";

/**
 * One line on the plate: icon, name, portion, kcal, and a − n + stepper in
 * the food's own unit (idlis, cups, glasses). Tap the name for swaps.
 * The whole thing is 64 pt tall so a thumb can work it one-handed.
 */
export function PlateRow({
  item,
  onChange,
  onRemove,
  hideCalories,
  first,
}: {
  item: DraftItem;
  onChange: (next: DraftItem) => void;
  onRemove: () => void;
  hideCalories?: boolean;
  first?: boolean;
}) {
  const colors = useColors();
  const [open, setOpen] = useState(false);
  const food = item.foodId ? FOOD_BY_ID[item.foodId] : undefined;
  const step = portionStep(item);
  const n = food ? portionsOf(item) : null;
  const sure = item.confidence >= 0.85 && !item.needsConfirm;
  const alternatives = food ? similarFoods(food, 5) : [];

  const bump = (dir: 1 | -1) => {
    Haptics.selectionAsync().catch(() => {});
    if (food) {
      const next = Math.max(step, (n ?? 1) + dir * step);
      onChange(rescale(item, next * food.portion.grams));
    } else {
      const g = Math.max(10, item.grams + dir * 25);
      onChange(rescale(item, g));
    }
  };

  const stepBtn = (icon: "add" | "remove", onPress: () => void, label: string, disabled?: boolean) => (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      style={({ pressed }) => [
        { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: pressed ? colors.limeSoft : "transparent", opacity: disabled ? 0.35 : 1 },
      ]}
    >
      <Ionicons name={icon} size={18} color={colors.white} />
    </Pressable>
  );

  return (
    <View style={{ borderTopWidth: first ? 0 : 1, borderTopColor: colors.line }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, paddingHorizontal: 14, minHeight: 60 }}>
        <Pressable onPress={() => alternatives.length && setOpen((o) => !o)} accessibilityRole={alternatives.length ? "button" : undefined} accessibilityLabel={`${item.name}, ${item.portionLabel}`} style={{ flex: 1 }}>
          <Body size="body" muted={false} style={{ fontWeight: "600" }} numberOfLines={1}>{item.name}</Body>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 1 }}>
            <Body size="micro" numberOfLines={1}>{item.portionLabel.toUpperCase()}</Body>
            {!sure ? <Body size="micro" style={{ color: colors.lime }}>· ESTIMATE</Body> : null}
            {alternatives.length ? <Ionicons name={open ? "chevron-up" : "chevron-down"} size={12} color={colors.muted} /> : null}
          </View>
        </Pressable>
        {!hideCalories ? (
          <Body size="body" muted={false} style={{ fontWeight: "700", minWidth: 40, textAlign: "right" }}>{Math.round(item.kcal)}</Body>
        ) : null}
        <View style={{ flexDirection: "row", alignItems: "center", borderRadius: radius.pill, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface2, paddingHorizontal: 2 }}>
          {stepBtn("remove", () => bump(-1), "Less", food ? (n ?? 1) <= step : item.grams <= 10)}
          <Body size="small" muted={false} style={{ fontWeight: "700", minWidth: 22, textAlign: "center" }}>{n !== null ? (n % 1 ? n.toFixed(1) : n) : `${item.grams}g`}</Body>
          {stepBtn("add", () => bump(1), "More")}
        </View>
        <Pressable onPress={onRemove} accessibilityRole="button" accessibilityLabel={`Remove ${item.name}`} hitSlop={8} style={{ width: 30, height: 34, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="close" size={16} color={colors.muted} />
        </Pressable>
      </View>
      {open ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 14, paddingBottom: 12 }}>
          {alternatives.map((f) => (
            <Pressable
              key={f.id}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                onChange(swapTo(item, f));
                setOpen(false);
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
