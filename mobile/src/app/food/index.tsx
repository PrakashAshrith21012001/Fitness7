import { useEffect, useRef, useState } from "react";
import { Image, Pressable, ScrollView, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { TRACKER_MEALS, fmtDuration, pctLabel, pct } from "@f7/content";
import { useSession, today } from "@/state/session";
import { useDay } from "@/state/day";
import { useTracker } from "@/state/tracker";
import { ArcRing, Card, Divider, HMSheet, HT, IconBubble, Line2, PlusBtn, SparkleFab, Sparkline, Wash, hm, tap, Btn } from "@/components/hm";
import { DateChip, DateSheet, MealPickerSheet, TrackerTabBar, useMealPicker } from "@/components/TrackerKit";
import { clockOf, fmt, useTrackerDay } from "@/lib/tracker-day";
import { StepsSheet } from "@/components/StepsSheet";

/**
 * Tracker Home — HealthifyMe's "Your Trackers" page: Track Food with the
 * calorie arc, snaps, macros, then Weight · Workout · Steps · Sleep · Water,
 * and Today's Logs as a timeline. The + in the bar opens "Select a Meal".
 */
export default function TrackerHome() {
  const router = useRouter();
  const params = useLocalSearchParams<{ date?: string }>();
  const date = params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date) ? params.date : today();
  const { member } = useSession();
  const { state, patch, ready } = useTracker();
  // First visit: run the setup questions once (Skip marks it done too).
  const asked = useRef(false);
  useEffect(() => {
    if (ready && !state.setupDone && !asked.current) {
      asked.current = true;
      router.push("/food/setup");
    }
  }, [ready, state.setupDone, router]);
  const day = useTrackerDay(date);
  const { waterMl, waterGoal, glassMl, addGlass, burned, activitiesFor } = useDay();
  const meal = useMealPicker(date);
  const [dateOpen, setDateOpen] = useState(false);
  const [goalsOpen, setGoalsOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [stepsOpen, setStepsOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  if (!member) return null;

  const t = day.totals;
  const tg = day.targets;
  const glasses = Math.round(waterMl(date) / glassMl);
  const glassGoal = Math.max(1, Math.round(waterGoal(date) / glassMl));
  const burn = burned(date);
  const steps = state.steps[date] ?? 0;
  const sleep = state.sleep[date];
  const weights = member.weights;
  const latest = day.latestKg;
  const startKg = state.goalStart?.kg ?? weights[0]?.kg ?? latest ?? 0;
  const lost = latest !== null ? Math.max(0, Math.round((startKg - latest) * 10) / 10) : 0;
  const gained = latest !== null ? Math.max(0, Math.round((latest - startKg) * 10) / 10) : 0;
  const wantsGain = state.targetKg !== undefined && latest !== null && state.targetKg > latest;
  const firstName = member.name.split(" ")[0] || "there";
  const go = (p: string) => router.push(p as never);
  const q = date !== today() ? `?date=${date}` : "";

  const macro = (label: string, v: number, target: number) => (
    <View style={{ flex: 1 }} accessible accessibilityLabel={`${label} ${pctLabel(v, target)} of target`}>
      <HT size={12} color={hm.ink2}>{label}: <HT size={12} weight="600">{t.count ? pctLabel(v, target) : "0%"}</HT></HT>
      <Line2 progress={pct(v, target)} color={pct(v, target) > 1.1 ? hm.red : hm.teal} style={{ marginTop: 8, marginRight: 18 }} />
    </View>
  );

  const row = (icon: keyof typeof Ionicons.glyphMap, title: string, sub: string, action: "plus" | "sync", onPress: () => void, onAction: () => void, a11y: string) => (
    <Pressable onPress={() => { tap(); onPress(); }} accessibilityRole="button" accessibilityLabel={`${title}. ${sub}`} style={({ pressed }) => [{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 58 }, pressed && { opacity: 0.7 }]}>
      <IconBubble name={icon} />
      <View style={{ flex: 1 }}>
        <HT size={15} weight="500">{title}</HT>
        <HT size={12} color={hm.sub}>{sub}</HT>
      </View>
      {action === "plus" ? (
        <PlusBtn label={a11y} color="#8e8e93" onPress={onAction} />
      ) : (
        <Pressable onPress={() => { tap(); onAction(); }} accessibilityRole="button" accessibilityLabel={a11y} hitSlop={10} style={{ width: 36, height: 36, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="sync-outline" size={20} color="#8e8e93" />
        </Pressable>
      )}
    </Pressable>
  );

  const trackers = [
    row("scale-outline", "Weight", wantsGain ? `${gained} kg gained` : `${lost} kg lost`, "plus", () => go("/food/weight"), () => go("/food/weight?add=1"), "Log weight"),
    row("flame-outline", "Workout", burn ? `${fmt(burn)} of ${fmt(day.workoutGoal)} cal burnt` : `Goal: ${fmt(day.workoutGoal)} cal`, "plus", () => go("/food/activity"), () => go("/food/activity"), "Log a workout"),
    row("footsteps-outline", "Steps", steps ? `${fmt(steps)} of ${fmt(state.stepsGoal)} steps` : `Goal: ${fmt(state.stepsGoal)} steps`, "sync", () => setStepsOpen(true), () => setStepsOpen(true), "Update steps"),
    row("moon-outline", "Sleep", sleep ? `${fmtDuration(sleep.mins)} of ${state.sleepGoalH}hr` : state.sleepWelcomed ? `Goal: ${state.sleepGoalH}hr` : "Set Up Sleep Goal", "sync", () => go("/food/sleep"), () => go("/food/sleep"), "Open sleep tracker"),
    row("water-outline", "Water", glasses ? `${glasses} of ${glassGoal} glasses` : `Goal: ${glassGoal} glasses`, "plus", () => go("/food/water"), () => addGlass(date), "Add a glass of water"),
  ];

  // Today's Logs — a timeline, oldest first
  type Log = { at: string; key: string; node: React.ReactNode };
  const logs: Log[] = [];
  for (const w of weights.filter((x) => x.date === date)) {
    logs.push({
      at: `${date}T00:00:00`,
      key: "w",
      node: (
        <Card onPress={() => go("/food/weight")} accessibilityLabel={`Weight ${w.kg} kilograms`} padding={14}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Ionicons name="scale-outline" size={14} color={hm.purple} />
            <HT size={13} weight="500" color={hm.purple}>Weight</HT>
          </View>
          <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginTop: 8 }}>
            <HT size={24} weight="600">{w.kg}<HT size={12} color={hm.sub}> kg</HT></HT>
            <Sparkline values={weights.slice(-6).map((x) => x.kg)} />
          </View>
        </Card>
      ),
    });
  }
  for (const m of TRACKER_MEALS) {
    const list = day.byMeal[m.id];
    if (!list.length) continue;
    const mt = day.mealTotals[m.id];
    logs.push({
      at: list[0].loggedAt,
      key: m.id,
      node: (
        <Card onPress={() => go(`/food/insights?meal=${m.id}${date !== today() ? `&date=${date}` : ""}`)} accessibilityLabel={`${m.label}: ${fmt(mt.kcal)} of ${fmt(day.mealBudgets[m.id])} calories. View insight`} padding={14}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Ionicons name="restaurant" size={13} color={hm.orange} />
            <HT size={13} weight="500" color={hm.orange}>{m.label}</HT>
          </View>
          <HT size={22} weight="600" style={{ marginTop: 6 }}>{fmt(mt.kcal)}<HT size={13} color={hm.sub}> / {fmt(day.mealBudgets[m.id])} Cal Eaten</HT></HT>
          <HT size={12} color={hm.ink2} style={{ marginTop: 6 }} numberOfLines={2}>{list.map((e) => e.name).join(" • ")}</HT>
          <Divider style={{ marginVertical: 12 }} />
          <View style={{ flexDirection: "row" }}>
            {([["Protein", mt.proteinG], ["Fats", mt.fatG], ["Carbs", mt.carbsG], ["Fibre", mt.fibreG]] as const).map(([l, v]) => (
              <View key={l} style={{ flex: 1, alignItems: "center" }}>
                <HT size={13} weight="600">{Math.round(v)} g</HT>
                <HT size={11} color={hm.sub}>{l}</HT>
              </View>
            ))}
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12, alignSelf: "flex-start", backgroundColor: hm.tealSoft, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}>
            <Ionicons name="analytics-outline" size={14} color={hm.teal} />
            <HT size={12} weight="500" color={hm.teal}>View insight</HT>
          </View>
          <HT size={12} weight="500" style={{ marginTop: 10 }}>Is this {m.label} helping you reach your fitness goal?</HT>
        </Card>
      ),
    });
  }
  for (const a of activitiesFor(date)) {
    logs.push({
      at: a.loggedAt,
      key: a.id,
      node: (
        <Card onPress={() => go("/food/activity")} accessibilityLabel={`${a.name}, ${a.minutes} minutes`} padding={14}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Ionicons name="flame" size={13} color={hm.red} />
            <HT size={13} weight="500" color={hm.red}>Workout</HT>
          </View>
          <HT size={18} weight="600" style={{ marginTop: 6 }}>{a.name}</HT>
          <HT size={12} color={hm.sub}>{a.minutes} min · {fmt(a.kcal)} cal burnt</HT>
        </Card>
      ),
    });
  }
  if (sleep) {
    logs.push({
      at: `${date}T${sleep.wake}:00`,
      key: "sleep",
      node: (
        <Card onPress={() => go("/food/sleep")} accessibilityLabel={`Slept ${fmtDuration(sleep.mins)}`} padding={14}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Ionicons name="moon" size={13} color={hm.sleepBlue} />
            <HT size={13} weight="500" color={hm.sleepBlue}>Sleep</HT>
          </View>
          <HT size={22} weight="600" style={{ marginTop: 6 }}>{fmtDuration(sleep.mins)}<HT size={13} color={hm.sub}> of {state.sleepGoalH}h</HT></HT>
        </Card>
      ),
    });
  }
  if (glasses) {
    logs.push({
      at: `${date}T23:59:00`,
      key: "water",
      node: (
        <Card onPress={() => go("/food/water")} accessibilityLabel={`Water ${glasses} of ${glassGoal} glasses`} padding={14}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Ionicons name="water" size={13} color={hm.blue} />
            <HT size={13} weight="500" color={hm.blue}>Water</HT>
          </View>
          <HT size={22} weight="600" style={{ marginTop: 6 }}>{glasses}<HT size={13} color={hm.sub}> / {glassGoal} glasses</HT></HT>
        </Card>
      ),
    });
  }
  logs.sort((a, b) => a.at.localeCompare(b.at));

  const showWelcome = !state.welcomeDismissed && !t.count;
  const snaps = state.snaps;

  return (
    <Wash>
      <ScrollView contentContainerStyle={{ paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
        <TopBar date={date} onDate={() => setDateOpen(true)} onAvatar={() => go("/profile")} plan={member.plan?.name ?? null} onPlan={() => go("/membership")} />

        {showWelcome ? (
          <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
            <HT size={28} weight="500" style={{ lineHeight: 36 }}>Welcome to your{"\n"}tracker, {firstName}!</HT>
            <HT size={14} color={hm.ink2} style={{ marginTop: 10, lineHeight: 21 }}>
              I'm your F7 Coach. Here you'll find your daily goals for nutrition, hydration, sleep and exercise, with quick insights on every meal. Ready to start?
            </HT>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 16 }}>
              <View style={{ flexDirection: "row" }}>
                {(["restaurant", "flame", "moon", "footsteps", "water"] as const).map((n, i) => (
                  <View key={n} style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", marginLeft: i ? -6 : 0, borderWidth: 1, borderColor: hm.line }}>
                    <Ionicons name={n} size={12} color={[hm.orange, hm.red, hm.sleepBlue, hm.purple, hm.blue][i]} />
                  </View>
                ))}
              </View>
              <HT size={13} color={hm.ink2}>Your daily goals are ready!</HT>
            </View>
            <Btn label="View My Daily Goals" onPress={() => setGoalsOpen(true)} style={{ marginTop: 14 }} />
          </View>
        ) : null}

        <HT size={17} weight="500" style={{ marginHorizontal: 16, marginTop: 22, marginBottom: 12 }}>Your Trackers</HT>

        {/* Track Food */}
        <Card style={{ marginHorizontal: 12 }} padding={14}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Pressable onPress={() => go(`/food/day${q}`)} accessibilityRole="button" accessibilityLabel={`Track Food. ${t.count ? `${fmt(t.kcal)} of ${fmt(tg.kcal)} calories eaten` : `Eat ${fmt(tg.kcal)} calories`}`} style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
              <ArcRing size={46} progress={pct(t.kcal, tg.kcal)} over={t.kcal > tg.kcal * 1.1}>
                <Ionicons name="restaurant-outline" size={18} color={hm.ink2} />
              </ArcRing>
              <View style={{ flex: 1 }}>
                <HT size={15} weight="500">Track Food</HT>
                <HT size={12} color={hm.sub}>{t.count ? `${fmt(t.kcal)} of ${fmt(tg.kcal)} Cal Eaten` : `Eat ${fmt(tg.kcal)} Cal`}</HT>
              </View>
            </Pressable>
            <Pressable onPress={() => { tap(); go(`/food/snap${q}`); }} accessibilityRole="button" accessibilityLabel="Snap a plate" hitSlop={8} style={{ width: 36, height: 36, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="camera-outline" size={22} color={hm.ink2} />
            </Pressable>
            <PlusBtn label="Track a meal" onPress={meal.show} />
          </View>

          <Pressable onPress={() => { tap(); go("/food/snaps"); }} accessibilityRole="button" accessibilityLabel="Browse all your past snaps in one place" style={({ pressed }) => [{ flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#f3f4f6", borderRadius: 12, padding: 12, marginTop: 14 }, pressed && { opacity: 0.85 }]}>
            <SnapStack thumbs={snaps.slice(0, 3).map((s) => s.thumb)} />
            <HT size={13} weight="500" style={{ flex: 1 }}>{snaps.length ? `Browse all your ${snaps.length} past snap${snaps.length === 1 ? "" : "s"} in one place` : "Browse all your past snaps\nin one place"}</HT>
            <Ionicons name="arrow-forward" size={20} color={hm.ink} />
          </Pressable>

          <View style={{ flexDirection: "row", marginTop: 16 }}>
            {macro("Protein", t.proteinG, tg.proteinG)}
            {macro("Fats", t.fatG, tg.fatG)}
          </View>
          <View style={{ flexDirection: "row", marginTop: 16 }}>
            {macro("Carbs", t.carbsG, tg.carbsG)}
            {macro("Fibre", t.fibreG, tg.fibreG)}
          </View>
          <Pressable onPress={() => { tap(); go(`/food/insights${q}`); }} accessibilityRole="button" accessibilityLabel="Your meal ideas are ready. Open insights" style={({ pressed }) => [{ flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: hm.tealSoft, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, marginTop: 16 }, pressed && { opacity: 0.85 }]}>
            <Ionicons name="restaurant-outline" size={14} color={hm.teal} />
            <HT size={12} weight="500" color={hm.teal} style={{ flex: 1 }}>{day.personal ? "Your meal plan is ready!" : "Add your numbers for a personal plan"}</HT>
            <Ionicons name="arrow-forward-circle-outline" size={20} color={hm.teal} />
          </Pressable>
        </Card>

        {/* Other trackers */}
        <Card style={{ marginHorizontal: 12, marginTop: 14 }} padding={14}>
          {(collapsed ? trackers.slice(0, 2) : trackers).map((r, i) => (
            <View key={i}>{r}</View>
          ))}
          <Pressable onPress={() => { tap(); setMoreOpen(true); }} accessibilityRole="button" accessibilityLabel="Track more" style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 54 }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#f2f3f5", alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="add" size={20} color={hm.teal} />
            </View>
            <HT size={15} weight="500" color={hm.teal}>Track More</HT>
          </Pressable>
          <Pressable onPress={() => { tap(); setCollapsed((c) => !c); }} accessibilityRole="button" accessibilityLabel={collapsed ? "Show all trackers" : "Show fewer trackers"} style={{ alignItems: "center", paddingTop: 4 }} hitSlop={8}>
            <Ionicons name={collapsed ? "chevron-down" : "chevron-up"} size={18} color={hm.ink2} />
          </Pressable>
        </Card>

        {/* Today's Logs */}
        <HT size={17} weight="500" style={{ marginHorizontal: 16, marginTop: 26, marginBottom: 12 }}>{day.isToday ? "Today's Logs" : "Logs"}</HT>
        {logs.length ? (
          logs.map((l) => (
            <View key={l.key} style={{ flexDirection: "row", paddingHorizontal: 12, marginBottom: 12 }}>
              <View style={{ width: 52, alignItems: "center", paddingTop: 4 }}>
                <HT size={10} color={hm.sub} center>{l.key === "w" || l.key === "water" ? "" : clockOf(l.at).replace(" ", "\n")}</HT>
              </View>
              <View style={{ flex: 1 }}>{l.node}</View>
            </View>
          ))
        ) : (
          <Card style={{ marginHorizontal: 12 }} padding={18}>
            <HT size={14} weight="500">Nothing logged {day.isToday ? "today" : "on this day"} yet</HT>
            <HT size={12} color={hm.sub} style={{ marginTop: 4 }}>Tap + to track a meal, or log your weight, water and sleep above.</HT>
          </Card>
        )}
      </ScrollView>

      <SparkleFab onPress={() => go("/chat")} bottom={86} />
      <TrackerTabBar active="home" onPlus={meal.show} date={date} />

      <MealPickerSheet open={meal.open} onClose={meal.close} day={day} onPick={meal.go} />
      <DateSheet open={dateOpen} onClose={() => setDateOpen(false)} value={date} onPick={(d) => router.setParams({ date: d === today() ? "" : d })} />
      <StepsSheet open={stepsOpen} onClose={() => setStepsOpen(false)} date={date} />

      <HMSheet open={goalsOpen} onClose={() => setGoalsOpen(false)} title="Your Daily Goals">
        {([
          ["restaurant-outline", "Calories", `${fmt(tg.kcal)} Cal`, hm.orange],
          ["barbell-outline", "Protein", `${tg.proteinG} g`, hm.teal],
          ["flame-outline", "Workout", `${fmt(day.workoutGoal)} cal`, hm.red],
          ["footsteps-outline", "Steps", fmt(state.stepsGoal), hm.purple],
          ["moon-outline", "Sleep", `${state.sleepGoalH} hours`, hm.sleepBlue],
          ["water-outline", "Water", `${glassGoal} glasses`, hm.blue],
        ] as const).map(([icon, l, v, c]) => (
          <View key={l} style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 48 }}>
            <IconBubble name={icon} color={c} size={34} />
            <HT size={15} style={{ flex: 1 }}>{l}</HT>
            <HT size={15} weight="600">{v}</HT>
          </View>
        ))}
        <HT size={12} color={hm.sub} style={{ marginTop: 8 }}>{day.personal ? "Worked out from your weight, height, age and goal." : "A starting point. Add your height, age and weight in setup for goals made for you."}</HT>
        <Btn label={day.personal ? "Got it" : "Personalise my goals"} onPress={() => { setGoalsOpen(false); patch({ welcomeDismissed: true }); if (!day.personal) go("/food/setup"); }} style={{ marginTop: 16 }} />
      </HMSheet>

      <HMSheet open={moreOpen} onClose={() => setMoreOpen(false)} title="Track More">
        {([
          ["camera-outline", "Snap a plate", "/food/snap"],
          ["create-outline", "Describe a meal", "/food/add"],
          ["analytics-outline", "Today's insights", `/food/insights${q}`],
          ["book-outline", "Healthy recipes", "/food/recipes"],
          ["bookmark-outline", "My meals", "/food/meals"],
          ["settings-outline", "Tracker setup", "/food/setup"],
        ] as const).map(([icon, l, p]) => (
          <Pressable key={l} onPress={() => { setMoreOpen(false); go(p); }} accessibilityRole="button" accessibilityLabel={l} style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 52 }}>
            <IconBubble name={icon} size={34} color={hm.teal} />
            <HT size={15} style={{ flex: 1 }}>{l}</HT>
            <Ionicons name="chevron-forward" size={18} color={hm.faint} />
          </Pressable>
        ))}
      </HMSheet>
    </Wash>
  );
}

function TopBar({ date, onDate, onAvatar, plan, onPlan }: { date: string; onDate: () => void; onAvatar: () => void; plan: string | null; onPlan: () => void }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 8 }}>
      <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back" hitSlop={8} style={{ width: 32, height: 40, justifyContent: "center" }}>
        <Ionicons name="chevron-back" size={22} color={hm.ink} />
      </Pressable>
      <Pressable onPress={onAvatar} accessibilityRole="button" accessibilityLabel="My profile" style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#eceef2", alignItems: "center", justifyContent: "center" }}>
        <Ionicons name="person-outline" size={18} color={hm.ink2} />
      </Pressable>
      <View style={{ flex: 1 }} />
      <Pressable onPress={onPlan} accessibilityRole="button" accessibilityLabel={plan ? `${plan} plan` : "Join Fitness 7"} style={{ flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderColor: hm.teal, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: "#fff" }}>
        <Ionicons name="ribbon-outline" size={14} color={hm.teal} />
        <HT size={12} weight="500" color={hm.teal}>{plan ? `${plan} member` : "Join Fitness 7"}</HT>
      </Pressable>
      <DateChip date={date} onPress={onDate} />
    </View>
  );
}

function SnapStack({ thumbs }: { thumbs: string[] }) {
  if (!thumbs.length) {
    return (
      <View style={{ width: 44, height: 44 }}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={{ position: "absolute", left: i * 4, top: 4 - i * 2, width: 34, height: 38, borderRadius: 6, backgroundColor: ["#c88a3a", "#e0a54a", "#f2c46b"][i], borderWidth: 2, borderColor: "#fff", transform: [{ rotate: `${-10 + i * 10}deg` }] }}>
            {i === 2 ? <Ionicons name="fast-food" size={16} color="#fff" style={{ alignSelf: "center", marginTop: 9 }} /> : null}
          </View>
        ))}
      </View>
    );
  }
  return (
    <View style={{ width: 44, height: 44 }}>
      {thumbs.slice(0, 3).reverse().map((u, i) => (
        <Image key={i} source={{ uri: u }} style={{ position: "absolute", left: i * 4, top: 4 - i * 2, width: 34, height: 38, borderRadius: 6, borderWidth: 2, borderColor: "#fff", transform: [{ rotate: `${-10 + i * 10}deg` }] }} />
      ))}
    </View>
  );
}
