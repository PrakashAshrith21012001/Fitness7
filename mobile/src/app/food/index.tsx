import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { fmtKcal } from "@f7/content";
import { radius } from "@/theme";
import { useColors } from "@/theme/ThemeProvider";
import { useSession, today } from "@/state/session";
import { MEALS, useFood } from "@/state/food";
import { targetFor } from "@/components/TargetCard";
import { Ring, Bar } from "@/components/Ring";
import { Body, Card, Display, Eyebrow } from "@/components/ui";
import { Screen } from "@/components/Screen";

export const EXAMPLE = "2 idli, sambar, coffee";

/**
 * Food — today. The ring is the one accent element: eaten against target.
 * Meals below it in the order of the day. Three ways to add, equal size.
 * Copy stays plain: over target is "Above target today" in muted, never red.
 */
export default function Food() {
  const colors = useColors();
  const router = useRouter();
  const { member } = useSession();
  const { forDate, totals, remove } = useFood();
  if (!member) return null;

  const date = today();
  const entries = forDate(date);
  const t = totals(date);
  const target = targetFor(member);
  const hide = !!member.hideCalories;
  const ratio = target ? t.kcal / target.kcal : 0;
  const over = target ? t.kcal > target.kcal : false;
  const proteinRatio = target ? t.proteinG / target.proteinG : 0;

  const action = (label: string, icon: keyof typeof Ionicons.glyphMap, go: () => void, primary?: boolean) => (
    <Pressable
      key={label}
      onPress={go}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        {
          flex: 1,
          minHeight: 64,
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor: primary ? "rgba(46,204,113,0.45)" : colors.line,
          backgroundColor: primary ? colors.limeSoft : colors.surface,
        },
        pressed && { borderColor: colors.green },
      ]}
    >
      <Ionicons name={icon} size={20} color={colors.lime} />
      <Body size="small" muted={false} style={{ fontWeight: "600" }}>{label}</Body>
    </Pressable>
  );

  return (
    <Screen title="Food">
      {/* Today ring */}
      <Card accent>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 18 }}>
          <Ring size={104} stroke={11} progress={target ? ratio : t.count ? 1 : 0} color={target ? colors.green : colors.line}>
            {hide ? (
              <>
                <Display size="h2">{t.count}</Display>
                <Body size="micro">ITEMS</Body>
              </>
            ) : (
              <>
                <Display size="h2">{fmtKcal(t.kcal)}</Display>
                <Body size="micro">KCAL</Body>
              </>
            )}
          </Ring>
          <View style={{ flex: 1 }}>
            <Eyebrow>Today</Eyebrow>
            {hide ? (
              <Body size="title" muted={false} style={{ marginTop: 6, fontWeight: "700" }}>
                {t.count ? `${t.count} item${t.count === 1 ? "" : "s"} logged` : "Nothing logged yet"}
              </Body>
            ) : target ? (
              <>
                <Body size="title" muted={false} style={{ marginTop: 6, fontWeight: "700" }}>
                  {fmtKcal(t.kcal)} / {fmtKcal(target.kcal)} kcal
                </Body>
                <Body size="small" style={{ marginTop: 2 }}>
                  {over ? "Above target today" : `${fmtKcal(target.kcal - t.kcal)} kcal to go`}
                </Body>
              </>
            ) : (
              <>
                <Body size="title" muted={false} style={{ marginTop: 6, fontWeight: "700" }}>
                  {fmtKcal(t.kcal)} kcal
                </Body>
                <Pressable onPress={() => router.push("/settings")} accessibilityRole="button" hitSlop={6}>
                  <Body size="small" style={{ marginTop: 2, color: colors.lime, fontWeight: "600" }}>Add your numbers for a target</Body>
                </Pressable>
              </>
            )}
            <View style={{ marginTop: 12 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
                <Body size="micro">PROTEIN</Body>
                <Body size="micro">{Math.round(t.proteinG)}{target ? ` / ${target.proteinG}` : ""} G</Body>
              </View>
              <Bar progress={target ? proteinRatio : t.proteinG ? 1 : 0} />
            </View>
          </View>
        </View>
      </Card>

      {/* Add */}
      <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
        {action("Type it", "create-outline", () => router.push("/food/add"), true)}
        {action("Snap it", "camera-outline", () => router.push("/food/snap"))}
        {action("Recent", "time-outline", () => router.push("/food/recent"))}
      </View>

      {/* Meals */}
      {entries.length === 0 ? (
        <Card style={{ marginTop: 18 }}>
          <Body size="title" muted={false} style={{ fontWeight: "600" }}>Nothing logged yet</Body>
          <Body size="small" style={{ marginTop: 4 }}>Type what you ate in plain words — Tamil names work.</Body>
          <Pressable
            onPress={() => router.push({ pathname: "/food/add", params: { text: EXAMPLE } })}
            accessibilityRole="button"
            accessibilityLabel={`Try the example: ${EXAMPLE}`}
            style={({ pressed }) => [
              { marginTop: 12, minHeight: 44, flexDirection: "row", alignItems: "center", gap: 8, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface2, paddingHorizontal: 14 },
              pressed && { borderColor: colors.green },
            ]}
          >
            <Ionicons name="sparkles-outline" size={16} color={colors.lime} />
            <Body size="small" muted={false}>Try: "{EXAMPLE}"</Body>
          </Pressable>
        </Card>
      ) : (
        MEALS.map((m) => {
          const list = entries.filter((e) => e.meal === m.id);
          if (!list.length) return null;
          const kcal = list.reduce((a, b) => a + b.kcal, 0);
          return (
            <View key={m.id} style={{ marginTop: 20 }}>
              <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" }}>
                <Eyebrow>{m.label}</Eyebrow>
                {!hide ? <Body size="small">{fmtKcal(kcal)} kcal</Body> : null}
              </View>
              <View style={{ marginTop: 8, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, overflow: "hidden" }}>
                {list.map((e, i) => (
                  <View key={e.id} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 10, minHeight: 52, borderTopWidth: i ? 1 : 0, borderTopColor: colors.line }}>
                    <View style={{ flex: 1 }}>
                      <Body size="body" muted={false} numberOfLines={1}>{e.name}</Body>
                      <Body size="micro">{(e.portionLabel ?? `${e.grams} g`).toUpperCase()}{e.confidence < 0.85 ? " · ESTIMATE" : ""}</Body>
                    </View>
                    {!hide ? <Body size="small" muted={false} style={{ fontWeight: "600" }}>{e.kcal}</Body> : null}
                    <Pressable onPress={() => remove(e.id)} accessibilityRole="button" accessibilityLabel={`Remove ${e.name}`} hitSlop={8} style={{ width: 32, height: 32, alignItems: "center", justifyContent: "center" }}>
                      <Ionicons name="close" size={16} color={colors.muted} />
                    </Pressable>
                  </View>
                ))}
              </View>
            </View>
          );
        })
      )}

      <Body size="micro" style={{ marginTop: 24, textAlign: "center", letterSpacing: 0.4 }}>
        NUMBERS ARE FROM THE INDIAN FOOD TABLE OR AN ESTIMATE — NOT MEDICAL ADVICE
      </Body>
    </Screen>
  );
}
