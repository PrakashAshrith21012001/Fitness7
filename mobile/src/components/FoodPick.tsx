import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { radius } from "@/theme";
import { useColors, useTheme } from "@/theme/ThemeProvider";
import { Body } from "@/components/ui";
import { PressScale, elevation } from "@/components/motion";
import { Kcal } from "@/components/Kcal";

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
  const { theme } = useTheme();
  const dark = theme === "dark";
  return (
    <PressScale
      onPress={onAdd}
      scale={0.96}
      accessibilityRole="button"
      accessibilityLabel={`Add ${name}, ${detail}${kcal != null ? `, ${kcal} kcal` : ""}`}
      style={[
        { width: 148, borderRadius: radius.lg, borderWidth: dark || count ? 1 : 0, borderColor: count ? colors.accentBorder : colors.line, backgroundColor: count ? colors.limeSoft : colors.surface, padding: 14, minHeight: 150, justifyContent: "space-between" },
        elevation(dark),
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
          {detail}{kcal != null ? ` · ${kcal} kcal` : ""}
        </Body>
      </View>
    </PressScale>
  );
}

export function FoodLine({ name, detail, kcal, icon, count = 0, onAdd, first }: Props & { first?: boolean }) {
  const colors = useColors();
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onAdd();
      }}
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
        <Body size="micro" numberOfLines={1}>{detail}</Body>
      </View>
      {kcal != null ? <Kcal value={kcal} size="small" weight="600" /> : null}
      <PlusBadge count={count} />
    </Pressable>
  );
}
