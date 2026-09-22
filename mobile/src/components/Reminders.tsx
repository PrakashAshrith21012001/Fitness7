import { useEffect } from "react";
import { AppState } from "react-native";
import { useRouter } from "expo-router";
import { useSession, today } from "@/state/session";
import { useFood } from "@/state/food";
import { useDay } from "@/state/day";
import { syncReminders, clearReminders, onReminderTap } from "@/lib/reminders";

/** What today still needs, from the app's own state. Shared by the notifications and the in-app nudge card. */
export function useDayStatus() {
  const { member } = useSession();
  const { forDate } = useFood();
  const { waterMl, waterGoal, glassMl } = useDay();
  const date = today();
  const entries = forDate(date);
  const logged = {
    breakfast: entries.some((e) => e.meal === "breakfast"),
    lunch: entries.some((e) => e.meal === "lunch"),
    snacks: entries.some((e) => e.meal === "snacks"),
    dinner: entries.some((e) => e.meal === "dinner"),
  };
  return { member, logged, waterMl: waterMl(date), waterGoalMl: waterGoal(date), glassMl, anyFood: entries.length > 0 };
}

export type Nudge = { title: string; body: string; url: "/food/add" | "/food"; icon: "restaurant-outline" | "water-outline" };

/**
 * One quiet suggestion at a time for Home — never a list of everything
 * missing. Returns null when the day is on track or the member turned the
 * reminders off.
 */
export function useNudge(): Nudge | null {
  const s = useDayStatus();
  if (!s.member) return null;
  const h = new Date().getHours();
  const n = s.member.notifications;
  if (n.meals) {
    if (h >= 21 && !s.logged.dinner) return { title: "Dinner not logged yet", body: "Tap your usual — it takes ten seconds.", url: "/food/add", icon: "restaurant-outline" };
    if (h >= 14 && h < 21 && !s.logged.lunch) return { title: "Lunch not logged yet", body: "Meals, biryani, curd rice — one tap each.", url: "/food/add", icon: "restaurant-outline" };
    if (h >= 10 && h < 14 && !s.logged.breakfast) return { title: "Breakfast not logged yet", body: "Idli, dosa, pongal — tap and it's logged.", url: "/food/add", icon: "restaurant-outline" };
  }
  if (n.water && h >= 16 && s.waterMl < s.waterGoalMl * 0.5) {
    const g = Math.round(s.waterMl / s.glassMl);
    const goal = Math.round(s.waterGoalMl / s.glassMl);
    return { title: `${g} of ${goal} glasses so far`, body: "Tap a glass on the Today screen as you drink.", url: "/food", icon: "water-outline" };
  }
  return null;
}

/**
 * Keeps the phone's scheduled reminders in step with what's logged. Mounted
 * once in the root layout. Also opens the right screen when a reminder is tapped.
 */
export function Reminders() {
  const router = useRouter();
  const s = useDayStatus();
  const member = s.member;
  const sig = JSON.stringify([member?.id, member?.notifications.meals, member?.notifications.water, s.logged, Math.round(s.waterMl / 50), s.waterGoalMl, s.glassMl]);

  useEffect(() => {
    if (!member || !member.onboarded) {
      void clearReminders();
      return;
    }
    const run = () =>
      void syncReminders({
        meals: member.notifications.meals,
        water: member.notifications.water,
        logged: s.logged,
        waterMl: s.waterMl,
        waterGoalMl: s.waterGoalMl,
        glassMl: s.glassMl,
        firstName: member.name.trim().split(/\s+/)[0] || undefined,
      });
    run();
    const sub = AppState.addEventListener("change", (st) => {
      if (st === "active") run();
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig]);

  useEffect(
    () =>
      onReminderTap((url) => {
        if (url === "/food/add" || url === "/food") router.push(url);
      }),
    [router],
  );

  return null;
}
