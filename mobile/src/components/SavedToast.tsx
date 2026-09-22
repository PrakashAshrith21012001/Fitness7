import { useEffect } from "react";
import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fmtKcal } from "@f7/content";
import { useColors } from "@/theme/ThemeProvider";
import { useSession } from "@/state/session";
import { MEALS, useFood } from "@/state/food";
import { Body } from "@/components/ui";
import { Glass } from "@/components/motion";

/**
 * "Added to lunch · 538 kcal — Undo". Shown for five seconds after any save,
 * above whatever screen you land on, so there is never a doubt that it
 * stuck. Undo removes exactly what was just added.
 */
export function SavedToast() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { member } = useSession();
  const { lastSaved, dismissSaved, undoSaved } = useFood();

  useEffect(() => {
    if (!lastSaved) return;
    const t = setTimeout(dismissSaved, 5000);
    return () => clearTimeout(t);
  }, [lastSaved, dismissSaved]);

  if (!lastSaved) return null;
  const meal = MEALS.find((m) => m.id === lastSaved.meal)?.label.toLowerCase() ?? lastSaved.meal;
  const what = member?.hideCalories ? `${lastSaved.count} item${lastSaved.count === 1 ? "" : "s"}` : `${fmtKcal(lastSaved.kcal)} kcal`;

  return (
    <Animated.View key={lastSaved.at} entering={FadeInDown.duration(220)} exiting={FadeOutDown.duration(180)} pointerEvents="box-none" style={{ position: "absolute", left: 16, right: 16, bottom: insets.bottom + 96 }}>
      <Glass strength="strong" intensity={60} radius={999} style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingLeft: 14, paddingRight: 6, minHeight: 52 }}>
        <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.green, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="checkmark" size={16} color={colors.onAccent} />
        </View>
        <Body size="body" muted={false} style={{ flex: 1, fontWeight: "600" }} numberOfLines={1} >
          Added to {meal} · {what}
        </Body>
        <Pressable onPress={() => void undoSaved()} accessibilityRole="button" accessibilityLabel="Undo" hitSlop={6} style={{ minHeight: 40, paddingHorizontal: 14, justifyContent: "center", borderRadius: 999 }}>
          <Body size="body" style={{ color: colors.lime, fontWeight: "700" }}>Undo</Body>
        </Pressable>
      </Glass>
    </Animated.View>
  );
}
