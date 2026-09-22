import { useEffect, useState } from "react";
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { planCoach, planQuestions, type PlanAnswers, type PlanQuestion } from "@f7/content";
import { useColors } from "@/theme/ThemeProvider";
import { CultButton, H, P, T } from "@/components/cult";
import { Enter } from "@/components/motion";
import { classPhoto } from "@/lib/photos";
import { loadPlanAnswers, savePlanAnswers } from "@/components/PlanStore";

/**
 * Smart workout plan questionnaire — cult's flow: progress dashes on top,
 * × top-right, a coach intro (round photo, name, experience, creds, italic
 * paragraph, NEXT), then one full-screen question at a time with radio
 * options / a number underline / multi chips and PREVIOUS | NEXT at the
 * bottom. Answers persist as you go; finishing opens the plan.
 */
export default function PlanQuestionnaire() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [step, setStep] = useState(0); // 0 = intro, 1..n = questions
  const [answers, setAnswers] = useState<PlanAnswers>({});
  const total = planQuestions.length + 1;

  useEffect(() => {
    loadPlanAnswers().then((a) => { if (a) setAnswers(a); });
  }, []);

  const q: PlanQuestion | undefined = step > 0 ? planQuestions[step - 1] : undefined;
  const value = q ? answers[q.id] : undefined;
  const answered = q ? (Array.isArray(value) ? value.length > 0 : !!value && (q.kind !== "number" || Number(value) > 0)) : true;

  const set = (id: PlanQuestion["id"], v: string | string[]) => {
    const next = { ...answers, [id]: v };
    setAnswers(next);
    savePlanAnswers(next);
  };

  const close = () => (router.canGoBack() ? router.back() : router.replace("/fitness"));
  const next = async () => {
    Haptics.selectionAsync().catch(() => {});
    if (step < total - 1) {
      setStep(step + 1);
      return;
    }
    await savePlanAnswers(answers);
    router.replace("/plan/result");
  };
  const prev = () => setStep((s) => Math.max(0, s - 1));

  return (
    <View style={{ flex: 1, backgroundColor: colors.black }}>
      <LinearGradient pointerEvents="none" colors={[colors.navyDeep, colors.black, "#1a1d2e"]} locations={[0, 0.5, 1]} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />
      {/* progress dashes */}
      <View style={{ paddingTop: insets.top + 10, paddingHorizontal: 16, flexDirection: "row", gap: 4 }} accessibilityRole="progressbar" accessibilityLabel={`Step ${step + 1} of ${total}`}>
        {Array.from({ length: total }).map((_, i) => (
          <View key={i} style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: i <= step ? colors.white : colors.line }} />
        ))}
      </View>
      <View style={{ alignItems: "flex-end", paddingHorizontal: 8 }}>
        <Pressable onPress={close} accessibilityRole="button" accessibilityLabel="Close" hitSlop={10} style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="close" size={24} color={colors.white} />
        </Pressable>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16, paddingBottom: 20 }}>
          {!q ? (
            <Enter key="intro" style={{ alignItems: "center", paddingTop: 30 }}>
              <View style={{ width: 96, height: 96, borderRadius: 48, overflow: "hidden", borderWidth: 2, borderColor: colors.gold, backgroundColor: colors.surface2 }}>
                <Image source={classPhoto("personal")} style={{ width: "100%", height: "100%" }} resizeMode="cover" accessibilityIgnoresInvertColors accessibilityLabel={planCoach.name} />
              </View>
              <T style={{ marginTop: 14 }}>{planCoach.name}</T>
              <P size={12} style={{ marginTop: 4, textAlign: "center" }}>{planCoach.years}+ yrs fitness experience</P>
              {planCoach.creds.map((c) => (
                <P key={c} size={12} style={{ textAlign: "center" }}>{c}</P>
              ))}
              <Text style={{ color: colors.white, fontSize: 14, lineHeight: 22, fontStyle: "italic", textAlign: "center", marginTop: 40, paddingHorizontal: 12 }}>{planCoach.intro}</Text>
            </Enter>
          ) : (
            <Enter key={q.id} style={{ paddingTop: 10 }}>
              <H size={18}>{q.title}</H>
              {q.sub ? <P style={{ marginTop: 4 }}>{q.sub}</P> : null}

              {q.kind === "single" ? (
                <View style={{ marginTop: 16 }}>
                  {q.options?.map((o) => {
                    const on = value === o.id;
                    return (
                      <Pressable key={o.id} onPress={() => set(q.id, o.id)} accessibilityRole="radio" accessibilityLabel={o.label} accessibilityState={{ checked: on }} style={{ flexDirection: "row", alignItems: "center", gap: 14, minHeight: 48, paddingVertical: 8 }}>
                        <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: on ? colors.white : colors.muted, alignItems: "center", justifyContent: "center" }}>
                          {on ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.white }} /> : null}
                        </View>
                        <View style={{ flex: 1 }}>
                          <T style={{ color: on ? colors.white : colors.muted, fontWeight: on ? "700" : "500" }}>{o.label}</T>
                          {o.sub ? <P size={12}>{o.sub}</P> : null}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}

              {q.kind === "number" ? (
                <View style={{ marginTop: 56, alignItems: "center" }}>
                  <TextInput
                    value={typeof value === "string" ? value : ""}
                    onChangeText={(v) => set(q.id, v.replace(/[^0-9]/g, "").slice(0, 3))}
                    keyboardType="number-pad"
                    inputMode="numeric"
                    placeholder={q.placeholder}
                    placeholderTextColor={colors.muted}
                    accessibilityLabel={q.title}
                    style={{ width: "70%", textAlign: "center", color: colors.white, fontSize: 28, fontWeight: "800", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.white }}
                  />
                </View>
              ) : null}

              {q.kind === "multi" ? (
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 18 }}>
                  {q.options?.map((o) => {
                    const cur = Array.isArray(value) ? value : [];
                    const on = cur.includes(o.id);
                    return (
                      <Pressable key={o.id} onPress={() => set(q.id, on ? cur.filter((x) => x !== o.id) : [...cur, o.id])} accessibilityRole="checkbox" accessibilityLabel={o.label} accessibilityState={{ checked: on }} style={{ minHeight: 40, paddingHorizontal: 18, borderRadius: 999, borderWidth: 1, borderColor: on ? colors.white : colors.line, backgroundColor: on ? "#ffffff" : colors.surface, alignItems: "center", justifyContent: "center" }}>
                        <Text style={{ color: on ? colors.black : colors.white, fontSize: 13, fontWeight: "700" }}>{o.label}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}
            </Enter>
          )}
        </ScrollView>

        <View style={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 14, flexDirection: "row", gap: 10 }}>
          {step > 0 ? <CultButton label="Previous" variant="dark" onPress={prev} style={{ flex: 1 }} /> : null}
          <CultButton label={step === total - 1 ? "Build my plan" : "Next"} variant="white" onPress={next} disabled={!answered} style={{ flex: 1 }} />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
