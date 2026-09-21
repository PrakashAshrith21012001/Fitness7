import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { radius } from "@/theme";
import { useColors } from "@/theme/ThemeProvider";
import { Body } from "@/components/ui";

/**
 * Pickable food, two shapes. Tile — a square card for the shelves and
 * "usual" row; Line — a list row for search results. Both end in the same
 * round + button and show a count badge once something's on the plate, so
 * tapping twice reads as "two idli" rather than a mistake.
 */

type Props = {
  name: string;
  detail: string;
  kcal?: number | null;
  icon: keyof typeof Ionicons.glyphMap;
  count?: number;
  onAdd: () => void;
};

function useAdd(onAdd: () => void) {
  return () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onAdd();
  };
}

function PlusBadge({ count }: { count: number }) {
  const colors = useColors();
  const on = count > 0;
  return (
    <View style={{ width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: on ? colors.green : colors.surface2, borderWidth: on ? 0 : 1, borderColor: colors.line }}>
      {on ? (
        <Body size="small" style={{ fontWeight: "800", color: colors.onAccent }}>{count}</Body>
      ) : (
        <Ionicons name="add" size={20} color={colors.white} />
      )}
    </View>
  );
}

export function FoodTile({ name, detail, kcal, icon, count = 0, onAdd }: Props) {
  const colors = useColors();
  const add = useAdd(onAdd);
  return (
    <Pressable
      onPress={add}
      accessibilityRole="button"
      accessibilityLabel={`Add ${name}, ${detail}${kcal != null ? `, ${kcal} kcal` : ""}`}
      style={({ pressed }) => [
        { width: 148, borderRadius: radius.lg, borderWidth: 1, borderColor: count ? "rgba(46,204,113,0.45)" : colors.line, backgroundColor: count ? colors.limeSoft : colors.surface, padding: 14, minHeight: 150, justifyContent: "space-between" },
        pressed && { transform: [{ scale: 0.98 }] },
      ]}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface2, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name={icon} size={20} color={colors.lime} />
        </View>
        <PlusBadge count={count} />
      </View>
      <View style={{ marginTop: 14 }}>
        <Body size="body" muted={false} style={{ fontWeight: "600" }} numberOfLines={2}>{name}</Body>
        <Body size="micro" style={{ marginTop: 3 }} numberOfLines={1}>
          {detail.toUpperCase()}{kcal != null ? ` · ${kcal}` : ""}
        </Body>
      </View>
    </Pressable>
  );
}

export function FoodLine({ name, detail, kcal, icon, count = 0, onAdd, first }: Props & { first?: boolean }) {
  const colors = useColors();
  const add = useAdd(onAdd);
  return (
    <Pressable
      onPress={add}
      accessibilityRole="button"
      accessibilityLabel={`Add ${name}, ${detail}${kcal != null ? `, ${kcal} kcal` : ""}`}
      style={({ pressed }) => [
        { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, minHeight: 60, borderTopWidth: first ? 0 : 1, borderTopColor: colors.line },
        pressed && { backgroundColor: colors.surface2 },
      ]}
    >
      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface2, alignItems: "center", justifyContent: "center" }}>
        <Ionicons name={icon} size={18} color={colors.lime} />
      </View>
      <View style={{ flex: 1 }}>
        <Body size="body" muted={false} style={{ fontWeight: "600" }} numberOfLines={1}>{name}</Body>
        <Body size="micro" numberOfLines={1}>{detail.toUpperCase()}</Body>
      </View>
      {kcal != null ? <Body size="small" muted={false} style={{ fontWeight: "600" }}>{kcal}</Body> : null}
      <PlusBadge count={count} />
    </Pressable>
  );
}
