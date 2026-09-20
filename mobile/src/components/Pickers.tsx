import { Pressable, TextInput, View, type StyleProp, type ViewStyle } from "react-native";
import * as Haptics from "expo-haptics";
import { radius, type } from "@/theme";
import { useColors } from "@/theme/ThemeProvider";
import { Body } from "@/components/ui";

/** Pill-shaped segmented control — 2–3 short options that fit on one line. */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T | undefined;
  options: { id: T; label: string }[];
  onChange: (v: T) => void;
}) {
  const colors = useColors();
  return (
    <View style={{ flexDirection: "row", backgroundColor: colors.surface2, borderRadius: radius.pill, padding: 4, gap: 4 }}>
      {options.map((o) => {
        const on = o.id === value;
        return (
          <Pressable
            key={o.id}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              onChange(o.id);
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            style={{ flex: 1, minHeight: 40, alignItems: "center", justifyContent: "center", borderRadius: radius.pill, backgroundColor: on ? colors.green : "transparent" }}
          >
            <Body size="small" style={{ fontWeight: "700", color: on ? colors.onAccent : colors.white }}>
              {o.label}
            </Body>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Wrapping chips for lists whose labels don't fit a segmented bar. */
export function Chips<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T | undefined;
  options: { id: T; label: string }[];
  onChange: (v: T) => void;
}) {
  const colors = useColors();
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {options.map((o) => {
        const on = o.id === value;
        return (
          <Pressable
            key={o.id}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              onChange(o.id);
            }}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            style={{
              minHeight: 40,
              paddingHorizontal: 16,
              justifyContent: "center",
              borderRadius: radius.pill,
              borderWidth: 1,
              borderColor: on ? colors.green : colors.line,
              backgroundColor: on ? colors.green : colors.surface2,
            }}
          >
            <Body size="small" style={{ fontWeight: "600", color: on ? colors.onAccent : colors.white }}>
              {o.label}
            </Body>
          </Pressable>
        );
      })}
    </View>
  );
}

/** A number box with a unit on the right — height, age, grams. */
export function NumberField({
  value,
  onChange,
  unit,
  placeholder,
  label,
  maxLen = 3,
  decimal,
  style,
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  unit: string;
  placeholder: string;
  label: string;
  maxLen?: number;
  decimal?: boolean;
  style?: StyleProp<ViewStyle>;
  autoFocus?: boolean;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          minHeight: 52,
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor: colors.line,
          backgroundColor: colors.surface2,
          paddingHorizontal: 14,
        },
        style,
      ]}
    >
      <TextInput
        value={value}
        onChangeText={(v) => onChange((decimal ? v.replace(/[^\d.]/g, "") : v.replace(/\D/g, "")).slice(0, maxLen))}
        keyboardType={decimal ? "decimal-pad" : "number-pad"}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        accessibilityLabel={label}
        autoFocus={autoFocus}
        style={{ flex: 1, color: colors.white, ...type.title, paddingVertical: 12 }}
      />
      <Body size="small">{unit}</Body>
    </View>
  );
}
