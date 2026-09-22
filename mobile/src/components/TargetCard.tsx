import { useState } from "react";
import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ACTIVITY, dailyTarget, fmtKcal, type DailyTarget } from "@f7/content";
import { radius } from "@/theme";
import { useColors } from "@/theme/ThemeProvider";
import { useSession, type Member } from "@/state/session";
import { Body } from "@/components/ui";

/** The member's daily target from what they've told us, or null. */
export function targetFor(m: Member | null): DailyTarget | null {
  if (!m) return null;
  const kg = m.weights.length ? m.weights[m.weights.length - 1].kg : undefined;
  return dailyTarget({ kg, heightCm: m.heightCm, age: m.age, sex: m.sex, activity: m.activity, goal: m.goal });
}

/** What's still needed for a target, in plain words. */
export function missingNumbers(m: Member | null): string[] {
  if (!m) return [];
  return [!m.weights.length && "weight", !m.heightCm && "height", !m.age && "age", !m.sex && "sex", !m.activity && "training days"].filter(Boolean) as string[];
}

const goalWords: Record<NonNullable<Member["goal"]>, string> = {
  "fat-loss": "15 % below maintenance for steady fat loss",
  strength: "10 % above maintenance to build on",
  trek: "at maintenance — fuel for the hills",
  general: "at maintenance",
};

/**
 * Target + the working. One card, plain numbers, an expander for the
 * arithmetic so nobody has to take it on faith. No advice — the copy says
 * what the number is, not what to do about it.
 */
export function TargetCard() {
  const colors = useColors();
  const { member } = useSession();
  const [open, setOpen] = useState(false);
  const t = targetFor(member);
  const hasWeight = !!member?.weights.length;

  if (!member) return null;

  if (!t) {
    const missing = [
      !hasWeight && "weight",
      !member.heightCm && "height",
      !member.age && "age",
      !member.sex && "sex",
      !member.activity && "training frequency",
    ].filter(Boolean) as string[];
    return (
      <View style={{ borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface2, padding: 14 }}>
        <Body size="small" muted={false} style={{ fontWeight: "600" }}>No target yet</Body>
        <Body size="small" style={{ marginTop: 4 }}>Still needed: {missing.join(", ")}.</Body>
      </View>
    );
  }

  return (
    <View style={{ borderRadius: radius.md, borderWidth: 1, borderColor: colors.accentBorder, backgroundColor: colors.limeSoft, padding: 14 }}>
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6 }}>
        <Body size="title" muted={false} style={{ fontWeight: "700" }}>{fmtKcal(t.kcal)} kcal</Body>
        <Body size="small">· {t.proteinG} g protein a day</Body>
      </View>
      <Body size="small" style={{ marginTop: 4 }}>
        {t.carbsG} g carbs · {t.fatG} g fat
      </Body>
      <Pressable
        onPress={() => setOpen((o) => !o)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={{ minHeight: 44, flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 }}
      >
        <Body size="small" style={{ color: colors.lime, fontWeight: "600" }}>How this is calculated</Body>
        <Ionicons name={open ? "chevron-up" : "chevron-down"} size={14} color={colors.lime} />
      </Pressable>
      {open ? (
        <View style={{ gap: 6 }}>
          <Body size="small">
            Resting energy (Mifflin-St Jeor) from your height, weight, age and sex: {fmtKcal(t.basis.bmr)} kcal.
          </Body>
          <Body size="small">
            × {t.basis.activityFactor} for {ACTIVITY[member.activity ?? "gym3"].label.toLowerCase()}.
          </Body>
          <Body size="small">
            Then {goalWords[member.goal ?? "general"]} (× {t.basis.goalFactor}).
          </Body>
          <Body size="small">
            Protein {t.basis.proteinPerKg} g per kg of body weight; fat a quarter of the energy; carbs the rest.
          </Body>
          <Body size="small">A starting point, not a prescription — a coach can tune it with you.</Body>
        </View>
      ) : null}
    </View>
  );
}
