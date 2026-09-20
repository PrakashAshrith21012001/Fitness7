import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { classes } from "@f7/content";
import { radius, type } from "@/theme";
import { useColors } from "@/theme/ThemeProvider";
import { useSession, type Goal, type Slot } from "@/state/session";
import { Body, Display, LimeButton } from "@/components/ui";

/**
 * Three questions, one per screen, progress at the top. Each one changes what
 * the app shows next — name for the greeting, goal for the class suggestions,
 * slot so a woman who wants the ladies-only hours never sees the wrong
 * timings. Nothing here is collected because a form had space for it.
 */

const GOALS: { id: Goal; label: string; hint: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: "strength", label: "Get stronger", hint: "Barbell work, coached, in blocks", icon: "barbell" },
  { id: "fat-loss", label: "Lose weight", hint: "Conditioning plus a diet plan", icon: "flame" },
  { id: "trek", label: "Train for the treks", hint: "Legs and lungs for the hills", icon: "trail-sign" },
  { id: "general", label: "Stay fit", hint: "A routine that sticks", icon: "heart" },
];

const SLOTS: { id: Slot; label: string; hint: string }[] = [
  { id: "early", label: "5 – 8 AM", hint: "Quietest floor of the day" },
  { id: "morning", label: "8 AM – 12 PM", hint: "Coaches free for induction" },
  { id: "ladies", label: "11 AM – 1 PM · Ladies only", hint: classes.find((c) => c.id === "ladies")?.tagline ?? "" },
  { id: "evening", label: "4 – 10 PM", hint: "Busiest; most classes run now" },
];

export default function Onboarding() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { member, update } = useSession();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(member?.name ?? "");
  const [goal, setGoal] = useState<Goal | undefined>(member?.goal);
  const [slot, setSlot] = useState<Slot | undefined>(member?.slot);
  const total = 3;

  const canNext = step === 0 ? name.trim().length >= 2 : step === 1 ? !!goal : !!slot;

  const next = async () => {
    if (!canNext) return;
    Haptics.selectionAsync().catch(() => {});
    if (step < total - 1) {
      setStep(step + 1);
      return;
    }
    await update({ name: name.trim(), goal, slot, onboarded: true });
  };

  const Option = ({ selected, onPress, label, hint, icon }: { selected: boolean; onPress: () => void; label: string; hint?: string; icon?: keyof typeof Ionicons.glyphMap }) => (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        {
          minHeight: 64,
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
          padding: 16,
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor: selected ? colors.green : colors.line,
          backgroundColor: selected ? colors.limeSoft : colors.surface,
        },
        pressed && { opacity: 0.85 },
      ]}
    >
      {icon ? <Ionicons name={icon} size={20} color={selected ? colors.green : colors.muted} /> : null}
      <View style={{ flex: 1 }}>
        <Body size="title" muted={false} style={{ fontWeight: "600" }}>{label}</Body>
        {hint ? <Body size="small" style={{ marginTop: 2 }}>{hint}</Body> : null}
      </View>
      <Ionicons name={selected ? "checkmark-circle" : "ellipse-outline"} size={22} color={selected ? colors.green : colors.line} />
    </Pressable>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: colors.black }}>
      <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 24, flexDirection: "row", alignItems: "center", gap: 14 }}>
        <Pressable
          onPress={() => step > 0 && setStep(step - 1)}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center", opacity: step > 0 ? 1 : 0.3 }}
        >
          <Ionicons name="chevron-back" size={22} color={colors.white} />
        </Pressable>
        <View style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.line, overflow: "hidden" }}>
          <View style={{ width: `${((step + 1) / total) * 100}%`, height: "100%", backgroundColor: colors.green }} />
        </View>
        <Body size="micro">{step + 1}/{total}</Body>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 36, paddingBottom: insets.bottom + 24 }} keyboardShouldPersistTaps="handled">
        {step === 0 ? (
          <>
            <Body size="micro" style={{ letterSpacing: 1.4 }}>FIRST, THE EASY ONE</Body>
            <Display size="h1" style={{ marginTop: 8 }}>What should we call you?</Display>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={colors.muted}
              autoFocus
              autoCapitalize="words"
              textContentType="givenName"
              accessibilityLabel="Your name"
              returnKeyType="next"
              onSubmitEditing={next}
              style={{ marginTop: 28, color: colors.green, ...type.hero, paddingVertical: 8, borderBottomWidth: 2, borderBottomColor: colors.line }}
            />
          </>
        ) : step === 1 ? (
          <>
            <Body size="micro" style={{ letterSpacing: 1.4 }}>SO THE COACH KNOWS WHERE TO START</Body>
            <Display size="h1" style={{ marginTop: 8 }}>What are you here for?</Display>
            <View style={{ gap: 10, marginTop: 24 }}>
              {GOALS.map((g) => <Option key={g.id} selected={goal === g.id} onPress={() => setGoal(g.id)} label={g.label} hint={g.hint} icon={g.icon} />)}
            </View>
          </>
        ) : (
          <>
            <Body size="micro" style={{ letterSpacing: 1.4 }}>LAST ONE</Body>
            <Display size="h1" style={{ marginTop: 8 }}>When do you usually train?</Display>
            <View style={{ gap: 10, marginTop: 24 }}>
              {SLOTS.map((s) => <Option key={s.id} selected={slot === s.id} onPress={() => setSlot(s.id)} label={s.label} hint={s.hint} />)}
            </View>
          </>
        )}

        <View style={{ flex: 1 }} />
        <LimeButton
          label={step === total - 1 ? "Let's go" : "Next"}
          icon={step === total - 1 ? "flash" : "arrow-forward"}
          onPress={next}
          style={{ marginTop: 24, opacity: canNext ? 1 : 0.5 }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
