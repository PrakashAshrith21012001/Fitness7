import { useState } from "react";
import { Pressable, ScrollView, View, useWindowDimensions } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  MEAL_LABEL, TRACKER_MEALS, TREND_LABEL, bestIdea, budgetVerdict, healthierSwaps, highCarbItems, isMealSlot, last7, macroBand, mealTargets, pct,
  proteinRichItems, topContributors, weekTrend, type LogItem, type MealSlot, type TrendMetric,
} from "@f7/content";
import { today } from "@/state/session";
import { useFood } from "@/state/food";
import { BudgetFace, Card, Divider, HMHeader, HMSheet, HT, Line2, LockedRows, UnderlineTabs, WeekBars, hm, tap } from "@/components/hm";
import { DateSheet } from "@/components/TrackerKit";
import { dayLabel, fmt, useTrackerDay, weekdayLetter } from "@/lib/tracker-day";

type Tab = "all" | MealSlot;

/**
 * Today's Insights — All Meals or one meal: the calorie budget face, macro
 * breakup with top contributors, high-carb foods with healthier swaps, a
 * meal suggestion, micronutrients, and 7-day trends. Everything is worked
 * out on the phone from the log; nothing is behind a paywall.
 */
export default function Insights() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{ meal?: string; date?: string }>();
  const date = params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date) ? params.date : today();
  const [tab, setTab] = useState<Tab>(isMealSlot(params.meal) ? params.meal : "all");
  const [dateOpen, setDateOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [openCarb, setOpenCarb] = useState<string | null>(null);
  const [metric, setMetric] = useState<TrendMetric>("kcal");
  const [metricOpen, setMetricOpen] = useState(false);
  const day = useTrackerDay(date);
  const { entries } = useFood();

  const items: LogItem[] = tab === "all" ? day.entries : day.byMeal[tab];
  const totals = tab === "all" ? day.totals : day.mealTotals[tab];
  const targets = tab === "all" ? day.targets : mealTargets(day.targets, tab);
  const verdict = budgetVerdict(totals.kcal, targets.kcal, tab === "all" ? "day" : tab, day.allMealsLogged);
  const trend = weekTrend((tab === "all" ? entries : entries.filter((e) => e.meal === tab)) as LogItem[], date, metric);
  const trendGoal = metric === "kcal" ? targets.kcal : metric === "proteinG" ? targets.proteinG : metric === "carbsG" ? targets.carbsG : metric === "fatG" ? targets.fatG : targets.fibreG;
  const unit = metric === "kcal" ? "Cal" : "g";
  const carbs = highCarbItems(items);
  const protein = proteinRichItems(items);
  const top = topContributors(items, 5);
  const label = tab === "all" ? "today" : MEAL_LABEL[tab];
  const idea = tab !== "all" ? bestIdea(tab, targets.kcal) : null;
  const chartW = width - 56;

  const section = (title: string, sub: string, grey?: boolean) => (
    <View style={{ marginTop: 22, marginBottom: 10, paddingHorizontal: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: grey ? "#8e8e93" : hm.red, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="pulse" size={13} color="#fff" />
        </View>
        <HT size={15} weight="500">{title}</HT>
      </View>
      <HT size={12} color={hm.sub} style={{ marginTop: 6 }}>{sub}</HT>
    </View>
  );

  const macroRow = (icon: keyof typeof Ionicons.glyphMap, l: string, v: number, t: number) => {
    const band = macroBand(v, t);
    const color = band === "over" ? hm.red : hm.amber;
    return (
      <View key={l} style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 9 }} accessible accessibilityLabel={`${l} ${Math.round(v)} of ${t} grams, ${Math.round(pct(v, t) * 100)} percent`}>
        <Ionicons name={icon} size={15} color={hm.ink} />
        <HT size={12} style={{ width: 62 }}>{l}</HT>
        <HT size={12} color={hm.ink2} style={{ width: 70 }}>{Math.round(v)}g / {t}g</HT>
        <Line2 progress={pct(v, t)} color={color} style={{ flex: 1 }} height={4} />
        <HT size={12} weight="600" color={color} style={{ width: 44, textAlign: "right" }}>{Math.round(pct(v, t) * 100)}%</HT>
      </View>
    );
  };

  const empty = !items.length;

  return (
    <View style={{ flex: 1, backgroundColor: hm.bg }}>
      <View style={{ backgroundColor: hm.card }}>
        <HMHeader
          title={tab === "all" ? (day.isToday ? "Today's Insights" : `Insights · ${dayLabel(date)}`) : `${MEAL_LABEL[tab]} Insights`}
          onBack={() => router.back()}
          right={
            <Pressable onPress={() => setDateOpen(true)} accessibilityRole="button" accessibilityLabel="Choose a day" hitSlop={8} style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="calendar-outline" size={22} color={hm.ink} />
            </Pressable>
          }
        />
        <UnderlineTabs<Tab> items={[{ id: "all", label: "All Meals" }, ...TRACKER_MEALS.map((m) => ({ id: m.id as Tab, label: m.label }))]} value={tab} onChange={(t) => { setTab(t); setShowTop(false); setOpenCarb(null); }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {empty ? (
          <Card style={{ margin: 12, marginTop: 16 }}>
            <HT size={17} weight="500">You haven't tracked {tab === "all" ? "anything" : "this meal"} yet.</HT>
            <HT size={12} color={hm.sub} style={{ marginTop: 6 }}>Track to get insights on nutrients, good/bad foods, and get healthy food suggestions.</HT>
            <Pressable onPress={() => router.push(`/food/log?meal=${tab === "all" ? "breakfast" : tab}${date !== today() ? `&date=${date}` : ""}` as never)} accessibilityRole="button" accessibilityLabel={`Track ${tab === "all" ? "a meal" : MEAL_LABEL[tab]}`} style={{ flexDirection: "row", alignItems: "center", marginTop: 16 }}>
              <HT size={13} weight="500" color={hm.red} style={{ flex: 1 }}>Track {tab === "all" ? "a meal" : MEAL_LABEL[tab]}</HT>
              <Ionicons name="arrow-forward" size={18} color={hm.red} />
            </Pressable>
          </Card>
        ) : null}

        {section("Food Log Analysis", empty ? `You haven't tracked your ${label} yet. Start tracking to monitor your progress and see meal recommendations.` : tab === "all" ? "See your daily calorie intake and budget here. Track your meals every day to get accurate daily insights." : `Your calorie intake and calorie budget for ${MEAL_LABEL[tab]} are shown below. Track your ${MEAL_LABEL[tab]} every day for accurate insights.`, empty)}
        <Card style={{ marginHorizontal: 12 }}>
          <HT size={14} weight="500">Your Calorie Budget</HT>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 12 }}>
            <BudgetFace mood={verdict.mood} />
            <View style={{ flex: 1, marginLeft: -6 }}>
              <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
                <View style={{ flex: 1, height: 2, backgroundColor: verdict.mood === "balanced" ? "#57b947" : verdict.mood === "over" ? hm.red : hm.amber, marginBottom: 10 }} />
                <HT size={26} weight="300" color={verdict.mood === "balanced" ? "#57b947" : verdict.mood === "over" ? hm.red : hm.amber}>{Math.round(verdict.pct * 100)}%</HT>
              </View>
              <HT size={11} color={hm.ink2} style={{ marginLeft: 16 }}>{fmt(totals.kcal)}/ {fmt(targets.kcal)} Cal</HT>
            </View>
          </View>
          <HT size={12} color={hm.sub} style={{ marginTop: 12 }}>{verdict.line}</HT>

          <Divider style={{ marginVertical: 14 }} />
          <HT size={12} color={hm.sub} style={{ marginBottom: 4 }}>Macronutrients Breakup</HT>
          {macroRow("barbell-outline", "Proteins", totals.proteinG, targets.proteinG)}
          {macroRow("water-outline", "Fats", totals.fatG, targets.fatG)}
          {macroRow("cloud-outline", "Carbs", totals.carbsG, targets.carbsG)}
          {macroRow("leaf-outline", "Fiber", totals.fibreG, targets.fibreG)}

          {top.length ? (
            <>
              <Pressable onPress={() => { tap(); setShowTop((s) => !s); }} accessibilityRole="button" accessibilityState={{ expanded: showTop }} aria-expanded={showTop} accessibilityLabel="View top contributors" style={{ flexDirection: "row", alignItems: "center", marginTop: 10, minHeight: 36 }}>
                <HT size={13} weight="500" color={hm.red} style={{ flex: 1 }}>View Top Contributors</HT>
                <Ionicons name={showTop ? "chevron-up" : "arrow-forward"} size={18} color={hm.red} />
              </Pressable>
              {showTop
                ? top.map((c, i) => (
                    <View key={c.id} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 8, borderTopWidth: i ? 1 : 0, borderTopColor: hm.line }}>
                      <HT size={13} weight="600" color={hm.sub} style={{ width: 22 }}>{i + 1}</HT>
                      <View style={{ flex: 1 }}>
                        <HT size={13} numberOfLines={1}>{c.name}</HT>
                        {tab === "all" ? <HT size={11} color={hm.sub}>{MEAL_LABEL[c.meal]}</HT> : null}
                      </View>
                      <HT size={12} color={hm.ink2}>{fmt(c.kcal)} Cal · {Math.round(c.share * 100)}%</HT>
                    </View>
                  ))
                : null}
            </>
          ) : null}
        </Card>

        {!empty ? (
          <>
            {section("Detailed Analysis", "I've looked at what you ate and where the calories came from, and suggested lighter swaps where they help.")}
            {protein.length ? (
              <Card style={{ marginHorizontal: 12, marginBottom: 12, backgroundColor: "#eef8ef" }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Ionicons name="thumbs-up-outline" size={16} color={hm.green} />
                  <HT size={14} weight="500">Good protein choices</HT>
                </View>
                <HT size={12} color={hm.ink2} style={{ marginTop: 6 }}>{protein.map((p) => p.name).join(", ")} — {protein.length === 1 ? "this gives" : "these give"} a quarter or more of {protein.length === 1 ? "its" : "their"} energy as protein. Keep them.</HT>
              </Card>
            ) : null}

            {carbs.length ? (
              <Card style={{ marginHorizontal: 12 }} padding={0}>
                <View style={{ backgroundColor: hm.redSoft, paddingHorizontal: 14, paddingVertical: 12, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
                  <HT size={14} weight="500">High carb Foods in {tab === "all" ? "your day" : MEAL_LABEL[tab]}</HT>
                </View>
                {carbs.map((e, i) => {
                  const open = openCarb === e.id;
                  const swaps = open ? healthierSwaps(e.foodId) : [];
                  return (
                    <View key={e.id} style={{ borderTopWidth: i ? 1 : 0, borderTopColor: hm.line }}>
                      <Pressable onPress={() => { tap(); setOpenCarb(open ? null : e.id); }} accessibilityRole="button" accessibilityState={{ expanded: open }} aria-expanded={open} accessibilityLabel={`${e.name}, ${Math.round(e.carbsG)} grams carbs. Healthier alternatives`} style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 12 }}>
                        <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: hm.red }} />
                        <View style={{ flex: 1 }}>
                          <HT size={13} weight="500">{e.name}</HT>
                          <HT size={11} color={hm.sub}>{e.portionLabel ?? `${e.grams} g`} · {fmt(e.kcal)} Cal · <HT size={11} color={hm.red}>{Math.round(e.carbsG)} gm Carbs</HT></HT>
                        </View>
                        <Ionicons name={open ? "chevron-up" : "chevron-down"} size={18} color={hm.ink} />
                      </Pressable>
                      {open ? (
                        <View style={{ paddingHorizontal: 14, paddingBottom: 14 }}>
                          <HT size={12} color={hm.sub}>This food was high in carbs. Stay within your macro budget for the best fitness results.</HT>
                          <HT size={13} weight="500" style={{ marginTop: 12, marginBottom: 4 }}>Healthier alternatives for this food</HT>
                          {swaps.length ? (
                            swaps.map((s) => (
                              <View key={s.food.id} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 8 }}>
                                <View style={{ flex: 1 }}>
                                  <HT size={13}>{s.food.name}</HT>
                                  <HT size={11} color={hm.sub}>{s.label} · {Math.round(s.proteinG)} g protein · {Math.round(s.carbsG)} g carbs</HT>
                                </View>
                                <HT size={12} color={hm.ink2}>{fmt(s.kcal)} Cal</HT>
                              </View>
                            ))
                          ) : (
                            <HT size={12} color={hm.sub}>Have a smaller portion next time, and add dal, egg or curd alongside for protein.</HT>
                          )}
                        </View>
                      ) : null}
                    </View>
                  );
                })}
              </Card>
            ) : (
              <Card style={{ marginHorizontal: 12 }}>
                <HT size={14} weight="500">No high-carb foods</HT>
                <HT size={12} color={hm.sub} style={{ marginTop: 4 }}>Nothing {tab === "all" ? "today" : `in ${MEAL_LABEL[tab]}`} was carb-heavy. Nicely balanced.</HT>
              </Card>
            )}

            {idea ? (
              <Card style={{ marginHorizontal: 12, marginTop: 12 }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <HT size={14} weight="500" style={{ flex: 1 }}>{MEAL_LABEL[tab as MealSlot]} Suggestion</HT>
                  <HT size={14} weight="500">{fmt(idea.kcal)} Cal</HT>
                </View>
                <HT size={12} color={hm.sub} style={{ marginTop: 6 }}>
                  {verdict.mood === "balanced" ? "Amazing job on meeting your calorie budget! Here's another balanced option for next time." : verdict.mood === "over" ? "This would have kept you inside the budget:" : "This fills the meal's budget with good protein:"}
                </HT>
                {idea.items.map((x) => (
                  <View key={x.food.id} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 8, borderTopWidth: 1, borderTopColor: hm.line, marginTop: 6 }}>
                    <View style={{ flex: 1 }}>
                      <HT size={13}>{x.food.name}</HT>
                      <HT size={11} color={hm.sub}>{x.label}</HT>
                    </View>
                    <HT size={12} color={hm.ink2}>{fmt(x.kcal)} Cal</HT>
                  </View>
                ))}
              </Card>
            ) : null}
          </>
        ) : null}

        {section("Micronutrient Analysis", "Did you know calcium keeps your bones strong and healthy? Iron carries oxygen to your muscles.", empty)}
        <Card style={{ marginHorizontal: 12 }}>
          {tab === "all" ? (
            <LockedRows title="Micronutrients coming soon" line="We're adding iron, calcium, B12 and more to the Indian food table." rows={5} />
          ) : (
            <HT size={12} color={hm.sub}>Micronutrient analysis is not available for individual meals. Switch back to <HT size={12} weight="600" color={hm.ink} >All Meals</HT> at the top to see your overall progress.</HT>
          )}
        </Card>

        {section("Weekly Trends", "See your weekly calorie and macro (protein, fat, carbs and fibre) intake here. For an accurate analysis, track every meal every day.")}
        <Card style={{ marginHorizontal: 12 }}>
          <HT size={14} weight="500">Last 7 days</HT>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 12 }}>
            <HT size={11} color={hm.sub} style={{ flex: 1 }}>Choose Calories or Macro:</HT>
            <Pressable onPress={() => setMetricOpen(true)} accessibilityRole="button" accessibilityLabel={`Showing ${TREND_LABEL[metric]}. Change`} style={{ flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderColor: hm.line, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}>
              <HT size={12}>{TREND_LABEL[metric]}</HT>
              <Ionicons name="chevron-down" size={14} color={hm.ink} />
            </Pressable>
          </View>
          <View style={{ flexDirection: "row", gap: 30, marginTop: 14 }}>
            <View>
              <HT size={20} weight="500">{fmt(trend.total)} {unit}</HT>
              <HT size={10} color={hm.sub}>Weekly Total</HT>
            </View>
            <View>
              <HT size={20} weight="500">{fmt(trend.avg)} {unit}</HT>
              <HT size={10} color={hm.sub}>Average Per Day</HT>
            </View>
          </View>
          <View style={{ marginTop: 16 }}>
            <WeekBars width={chartW} values={trend.days.map((d) => d.value)} labels={last7(date).map(weekdayLetter)} goal={trendGoal} goalLabel={`Goal: ${fmt(trendGoal)} ${unit}`} color={hm.amber} />
          </View>
        </Card>
      </ScrollView>

      <DateSheet open={dateOpen} onClose={() => setDateOpen(false)} value={date} onPick={(d) => router.setParams({ date: d === today() ? "" : d })} />
      <HMSheet open={metricOpen} onClose={() => setMetricOpen(false)} title="Show">
        {(Object.keys(TREND_LABEL) as TrendMetric[]).map((k) => (
          <Pressable key={k} onPress={() => { setMetric(k); setMetricOpen(false); }} accessibilityRole="radio" accessibilityState={{ checked: k === metric }} aria-checked={k === metric} accessibilityLabel={TREND_LABEL[k]} style={{ flexDirection: "row", alignItems: "center", minHeight: 48, borderBottomWidth: 1, borderBottomColor: hm.line }}>
            <HT size={15} weight={k === metric ? "600" : "400"} style={{ flex: 1 }}>{TREND_LABEL[k]}</HT>
            {k === metric ? <Ionicons name="checkmark" size={18} color={hm.teal} /> : null}
          </Pressable>
        ))}
      </HMSheet>
    </View>
  );
}
