import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { buildPlan, planQuestions, type PlanAnswers } from "@f7/content";
import { useColors } from "@/theme/ThemeProvider";
import { CultButton, H, Label, NavyHeader, NavyPage, P, Pane, T } from "@/components/cult";
import { gymPhotos } from "@/lib/photos";
import { clearPlanAnswers, loadPlanAnswers, planComplete } from "@/components/PlanStore";
import { today } from "@/state/session";

/**
 * My Workout Plan — the result of the questionnaire: header, "{goal} · N
 * days", a Mon…Sun strip with the selected day highlighted (rest days
 * dimmed), the day's blocks as "REPEAT 3 TIMES" lists of exercises, a
 * Rest & recover card on rest days, START WORKOUT and REBUILD PLAN.
 */
export default function PlanResult() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [answers, setAnswers] = useState<PlanAnswers | null | undefined>(undefined);
  const todayIdx = (new Date(today() + "T12:00:00").getDay() + 6) % 7;
  const [sel, setSel] = useState(todayIdx);

  useEffect(() => {
    loadPlanAnswers().then((a) => {
      if (!planComplete(a, planQuestions.map((q) => q.id))) {
        router.replace("/plan");
        return;
      }
      setAnswers(a);
    });
  }, [router]);

  const plan = useMemo(() => (answers ? buildPlan(answers) : null), [answers]);
  const back = () => (router.canGoBack() ? router.back() : router.replace("/fitness"));

  if (!plan) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.black, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.white} />
      </View>
    );
  }

  const day = plan.days[sel];
  const firstEx = day.rest ? undefined : day.workout.blocks[0]?.exercises[0];
  const trainingDays = plan.days.filter((d) => !d.rest);
  const firstTraining = trainingDays[0];

  const rebuild = async () => {
    await clearPlanAnswers();
    router.replace("/plan");
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.black }}>
      <NavyPage top={false} header={<NavyHeader title={plan.title} onBack={back} />} contentStyle={{ paddingBottom: insets.bottom + 140 }}>
        <View style={{ paddingHorizontal: 16 }}>
          <P>{plan.sub}</P>
          {/* week strip */}
          <View style={{ flexDirection: "row", gap: 6, marginTop: 16 }}>
            {plan.days.map((d, i) => {
              const on = i === sel;
              return (
                <Pressable key={d.day} onPress={() => setSel(i)} accessibilityRole="tab" accessibilityLabel={`${d.day}${d.rest ? ", rest day" : `, ${d.workout.focus}`}`} accessibilityState={{ selected: on }} style={{ flex: 1, minHeight: 56, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: on ? "#ffffff" : colors.surface, borderWidth: 1, borderColor: on ? "#ffffff" : colors.line, opacity: d.rest && !on ? 0.45 : 1 }}>
                  <Text style={{ color: on ? colors.black : colors.white, fontSize: 12, fontWeight: "800" }}>{d.day.toUpperCase()}</Text>
                  <Text style={{ color: on ? colors.black : colors.muted, fontSize: 9, marginTop: 2 }} numberOfLines={1}>{d.rest ? "Rest" : d.workout.focus.split(" ")[0]}</Text>
                </Pressable>
              );
            })}
          </View>

          {day.rest ? (
            <Pane style={{ marginTop: 22, alignItems: "center", paddingVertical: 28 }}>
              <Ionicons name="bed-outline" size={32} color={colors.success} />
              <H size={18} style={{ marginTop: 12 }}>Rest & recover</H>
              <P style={{ marginTop: 6, textAlign: "center" }}>Muscle is built on the day off. Walk, stretch, sleep 7 hours, drink water.</P>
              {firstTraining ? <CultButton label={`See ${firstTraining.day}`} variant="dark" small style={{ marginTop: 16 }} onPress={() => setSel(plan.days.indexOf(firstTraining))} /> : null}
            </Pane>
          ) : (
            <View style={{ marginTop: 22 }}>
              <H size={20}>{day.workout.focus}</H>
              <P style={{ marginTop: 2 }}>{day.workout.muscles.length} muscle groups · ~{day.workout.kcal} kcal</P>
              {day.workout.blocks.map((b) => (
                <View key={b.title} style={{ marginTop: 20 }}>
                  <Label>Repeat 3 times · {b.title}</Label>
                  <Pane style={{ marginTop: 8 }} padding={6}>
                    {b.exercises.map((e, i) => (
                      <Pressable key={e.id} onPress={() => router.push(`/exercise/${e.id}`)} accessibilityRole="button" accessibilityLabel={`${e.name}, ${e.volume}`} style={({ pressed }) => [{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 60, paddingHorizontal: 8, borderTopWidth: i ? 1 : 0, borderTopColor: colors.line }, pressed && { opacity: 0.7 }]}>
                        <View style={{ width: 46, height: 46, borderRadius: 8, overflow: "hidden", backgroundColor: colors.surface2 }}>
                          <Image source={gymPhotos.weights} style={{ width: "100%", height: "100%", opacity: 0.6 }} resizeMode="cover" accessibilityIgnoresInvertColors />
                        </View>
                        <View style={{ flex: 1 }}>
                          <T>{e.name}</T>
                          <P size={12}>{e.volume}</P>
                        </View>
                        <Ionicons name="play" size={14} color={colors.white} />
                      </Pressable>
                    ))}
                  </Pane>
                </View>
              ))}
            </View>
          )}
        </View>
      </NavyPage>

      <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 10, paddingBottom: insets.bottom + 12, backgroundColor: colors.black, borderTopWidth: 1, borderTopColor: colors.line, gap: 8 }}>
        {firstEx ? <CultButton label="Start workout" variant="pink" onPress={() => router.push(`/exercise/${firstEx.id}`)} /> : <CultButton label="Rest day — see tomorrow" variant="dark" onPress={() => setSel((sel + 1) % 7)} />}
        <CultButton label="Rebuild plan" variant="ghost" onPress={rebuild} />
      </View>
    </View>
  );
}
