import { useMemo } from "react";
import { TRACKER_MEALS, defaultTargets, mealBudget, totalsOf, workoutGoalKcal, type DayTotals, type LogItem, type MacroTargets, type MealSlot } from "@f7/content";
import { useSession, today } from "@/state/session";
import { useFood, type FoodEntry } from "@/state/food";
import { targetFor } from "@/components/TargetCard";

/**
 * One day of the tracker, as every screen needs it: the targets (the
 * member's own when their numbers are in, else a 1,500 Cal default), the
 * log split by meal, totals and per-meal budgets.
 */
export type TrackerDay = {
  date: string;
  isToday: boolean;
  targets: MacroTargets;
  personal: boolean;
  entries: FoodEntry[];
  totals: DayTotals;
  byMeal: Record<MealSlot, FoodEntry[]>;
  mealTotals: Record<MealSlot, DayTotals>;
  mealBudgets: Record<MealSlot, number>;
  allMealsLogged: boolean;
  workoutGoal: number;
  latestKg: number | null;
};

export function useTrackerDay(date: string = today()): TrackerDay {
  const { member } = useSession();
  const { forDate } = useFood();
  const entries = forDate(date);
  return useMemo(() => {
    const t = targetFor(member);
    const targets: MacroTargets = t ? { kcal: t.kcal, proteinG: t.proteinG, fatG: t.fatG, carbsG: t.carbsG, fibreG: t.kcal >= 2000 ? 35 : 30 } : defaultTargets(1500);
    const byMeal = Object.fromEntries(TRACKER_MEALS.map((m) => [m.id, entries.filter((e) => e.meal === m.id)])) as Record<MealSlot, FoodEntry[]>;
    const mealTotals = Object.fromEntries(TRACKER_MEALS.map((m) => [m.id, totalsOf(byMeal[m.id] as LogItem[])])) as Record<MealSlot, DayTotals>;
    const mealBudgets = Object.fromEntries(TRACKER_MEALS.map((m) => [m.id, mealBudget(targets.kcal, m.id)])) as Record<MealSlot, number>;
    const latestKg = member?.weights.length ? member.weights[member.weights.length - 1].kg : null;
    return {
      date,
      isToday: date === today(),
      targets,
      personal: !!t,
      entries,
      totals: totalsOf(entries as LogItem[]),
      byMeal,
      mealTotals,
      mealBudgets,
      allMealsLogged: TRACKER_MEALS.every((m) => byMeal[m.id].length > 0),
      workoutGoal: workoutGoalKcal(latestKg ?? 65),
      latestKg,
    };
  }, [member, entries, date]);
}

export function fmt(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** "Today", "Yesterday", "Tue, 29 Sep" */
export function dayLabel(date: string): string {
  const t = today();
  if (date === t) return "Today";
  const d = new Date(date + "T12:00:00");
  const y = new Date(t + "T12:00:00");
  y.setDate(y.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return "Yesterday";
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

/** "Today, 2 Oct" */
export function dayLabelLong(date: string): string {
  const d = new Date(date + "T12:00:00");
  const base = dayLabel(date);
  return base === "Today" || base === "Yesterday" ? `${base}, ${d.getDate()} ${MONTHS[d.getMonth()]}` : base;
}

/** "2 Oct, 2026" */
export function shortDate(date: string): string {
  const d = new Date(date + "T12:00:00");
  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${d.getFullYear()}`;
}

/** "2 Oct" for chart axes */
export function axisDate(date: string): string {
  const d = new Date(date + "T12:00:00");
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function weekdayLetter(date: string): string {
  return "SMTWTFS"[new Date(date + "T12:00:00").getDay()];
}

/** "04:21 PM" from an ISO timestamp */
export function clockOf(iso: string): string {
  const d = new Date(iso);
  const h = d.getHours();
  const m = d.getMinutes();
  return `${String(h % 12 === 0 ? 12 : h % 12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}
