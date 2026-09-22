import { useState } from "react";
import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { fmtKcal, type MealSlot } from "@f7/content";
import { radius } from "@/theme";
import { useColors } from "@/theme/ThemeProvider";
import { useSession } from "@/state/session";
import { MEALS, useFood, type DraftItem } from "@/state/food";
import { Chips } from "@/components/Pickers";
import { Body, Card, LimeButton } from "@/components/ui";
import { Screen } from "@/components/Screen";
import { Kcal } from "@/components/Kcal";

/**
 * Recent — the last 20 distinct things logged. Tap to tick, one button to
 * add them all to a meal. The fastest path for the member who eats the same
 * breakfast six days a week.
 */
export default function RecentFood() {
  const colors = useColors();
  const router = useRouter();
  const { member } = useSession();
  const { recent, addItems, defaultSlot } = useFood();
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const [slot, setSlot] = useState<MealSlot>(defaultSlot());
  const hide = !!member?.hideCalories;

  const toggle = (i: number) => {
    Haptics.selectionAsync().catch(() => {});
    setPicked((s) => {
      const n = new Set(s);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });
  };

  const chosen: DraftItem[] = recent.filter((_, i) => picked.has(i));
  const total = chosen.reduce((a, b) => a + b.kcal, 0);
  const label = MEALS.find((m) => m.id === slot)?.label.toLowerCase() ?? slot;

  const save = async () => {
    if (!chosen.length) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    await addItems(chosen, slot);
    router.back();
  };

  return (
    <Screen title="Recent">
      {!recent.length ? (
        <Card>
          <Body size="title" muted={false} style={{ fontWeight: "600" }}>Nothing yet</Body>
          <Body size="small" style={{ marginTop: 4 }}>Once you've logged a few meals they'll show up here for one-tap re-adding.</Body>
          <LimeButton label="Type a meal" icon="create-outline" variant="outline" onPress={() => router.replace("/food/add")} style={{ marginTop: 14 }} />
        </Card>
      ) : (
        <>
          <Body size="micro" style={{ marginBottom: 8 }}>Meal</Body>
          <Chips value={slot} options={MEALS} onChange={setSlot} />
          <View style={{ marginTop: 16, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, overflow: "hidden" }}>
            {recent.map((it, i) => {
              const on = picked.has(i);
              return (
                <Pressable
                  key={`${it.foodId ?? it.name}-${i}`}
                  onPress={() => toggle(i)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: on }}
                  accessibilityLabel={`${it.name}, ${it.portionLabel}`}
                  style={({ pressed }) => [
                    { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, minHeight: 56, borderTopWidth: i ? 1 : 0, borderTopColor: colors.line },
                    (pressed || on) && { backgroundColor: on ? colors.limeSoft : colors.surface2 },
                  ]}
                >
                  <Ionicons name={on ? "checkmark-circle" : "ellipse-outline"} size={22} color={on ? colors.green : colors.line} />
                  <View style={{ flex: 1 }}>
                    <Body size="body" muted={false} numberOfLines={1}>{it.name}</Body>
                    <Body size="micro">{it.portionLabel}</Body>
                  </View>
                  {!hide ? <Kcal value={it.kcal} size="small" weight="600" /> : null}
                </Pressable>
              );
            })}
          </View>
        </>
      )}

      {chosen.length ? (
        <View style={{ marginTop: 18 }}>
          {!hide ? (
            <Body size="small" style={{ textAlign: "center", marginBottom: 10 }}>
              {chosen.length} item{chosen.length === 1 ? "" : "s"} · {fmtKcal(total)} kcal
            </Body>
          ) : null}
          <LimeButton label={`Add to ${label}`} icon="checkmark" onPress={save} />
        </View>
      ) : null}
    </Screen>
  );
}
