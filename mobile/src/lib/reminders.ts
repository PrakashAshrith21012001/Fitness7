import { Platform } from "react-native";
import Constants, { ExecutionEnvironment } from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type * as NotificationsModule from "expo-notifications";

/**
 * Local reminders — no server, no push.
 *
 * The app knows what has been logged today, so every time it comes to the
 * foreground (and after every log) it cancels its reminders and schedules
 * only the ones still needed: "logged lunch?" at 1:30 pm only if lunch is
 * empty, the water nudge at 5 pm only if under half the goal, and so on.
 * Tomorrow's meal reminders are scheduled unconditionally — if the app isn't
 * opened tomorrow, nothing was logged, so they are right by definition.
 *
 * Copy stays plain: a nudge, never a scold.
 */

export type ReminderInput = {
  meals: boolean;
  water: boolean;
  logged: { breakfast: boolean; lunch: boolean; dinner: boolean };
  waterMl: number;
  waterGoalMl: number;
  glassMl: number;
  firstName?: string;
};

const ASKED_KEY = "f7-notif-asked";
const CHANNEL = "reminders";

/**
 * expo-notifications throws the moment it is imported inside Expo Go on
 * Android (SDK 53+ removed it there), and that would take down every screen
 * that imports this file. So it is required lazily, and only outside Expo
 * Go. In Expo Go the app simply has no reminders; a dev/store build has them.
 */
type N = typeof NotificationsModule;
let mod: N | null | undefined;

function notifications(): N | null {
  if (mod !== undefined) return mod;
  mod = null;
  if (Platform.OS === "web" || Constants.executionEnvironment === ExecutionEnvironment.StoreClient) return mod;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const m = require("expo-notifications") as N;
    m.setNotificationHandler({
      handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: false, shouldSetBadge: false, shouldShowBanner: true, shouldShowList: true }),
    });
    mod = m;
  } catch {
    mod = null;
  }
  return mod;
}

export const remindersAvailable = () => notifications() !== null;

/** Tap on a reminder → open the screen it points at. No-op where notifications aren't available. */
export function onReminderTap(handler: (url: string) => void): () => void {
  const N = notifications();
  if (!N) return () => {};
  const sub = N.addNotificationResponseReceivedListener((res) => {
    const url = res.notification.request.content.data?.url;
    if (typeof url === "string") handler(url);
  });
  return () => sub.remove();
}

export async function ensureChannel() {
  const Notifications = notifications();
  if (Platform.OS !== "android" || !Notifications) return;
  await Notifications.setNotificationChannelAsync(CHANNEL, {
    name: "Reminders",
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: undefined,
    vibrationPattern: [0, 120],
  }).catch(() => {});
}

/** Ask once, the first time reminders are relevant; returns whether we may notify. */
export async function ensurePermission(askIfNeeded: boolean): Promise<boolean> {
  const Notifications = notifications();
  if (!Notifications) return false;
  try {
    const cur = await Notifications.getPermissionsAsync();
    if (cur.granted) return true;
    if (!askIfNeeded) return false;
    if ((await AsyncStorage.getItem(ASKED_KEY)) === "1" && !cur.canAskAgain) return false;
    await AsyncStorage.setItem(ASKED_KEY, "1");
    const res = await Notifications.requestPermissionsAsync();
    return res.granted;
  } catch {
    return false;
  }
}

function at(dayOffset: number, h: number, m: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(h, m, 0, 0);
  return d;
}

type Planned = { when: Date; title: string; body: string; url: string; id: string };

export function planReminders(input: ReminderInput): Planned[] {
  const now = Date.now();
  const name = input.firstName ? `${input.firstName}, ` : "";
  const out: Planned[] = [];
  const add = (p: Planned) => {
    if (p.when.getTime() > now + 60_000) out.push(p);
  };

  if (input.meals) {
    if (!input.logged.breakfast) add({ id: "bf-0", when: at(0, 9, 30), title: "Breakfast logged?", body: `${name}two taps — type it or snap the plate.`, url: "/food/add" });
    if (!input.logged.lunch) add({ id: "lu-0", when: at(0, 13, 30), title: "Lunch logged?", body: "Type it in plain words — Tamil names work.", url: "/food/add" });
    if (!input.logged.dinner) add({ id: "di-0", when: at(0, 21, 0), title: "How was dinner?", body: "Log it and the day is complete.", url: "/food/add" });
    // tomorrow, unconditional
    add({ id: "lu-1", when: at(1, 13, 30), title: "Lunch logged?", body: "Type it in plain words — Tamil names work.", url: "/food/add" });
    add({ id: "di-1", when: at(1, 21, 0), title: "How was dinner?", body: "Log it and the day is complete.", url: "/food/add" });
  }
  if (input.water) {
    const glasses = Math.round(input.waterMl / input.glassMl);
    const goal = Math.round(input.waterGoalMl / input.glassMl);
    if (input.waterMl < input.waterGoalMl * 0.5) {
      add({ id: "wa-0", when: at(0, 17, 0), title: "Water check", body: `${glasses} of ${goal} glasses so far — a glass now helps the evening session.`, url: "/food" });
    }
    if (input.waterMl < input.waterGoalMl * 0.8) {
      add({ id: "wa-1", when: at(0, 20, 30), title: "Water check", body: `${glasses} of ${goal} glasses today. One more before bed?`, url: "/food" });
    }
    add({ id: "wa-2", when: at(1, 11, 0), title: "Water check", body: "Mid-morning — how many glasses so far?", url: "/food" });
  }
  return out;
}

let last = "";

/** Cancel everything and schedule what's still needed. Cheap; call freely. */
export async function syncReminders(input: ReminderInput): Promise<void> {
  const Notifications = notifications();
  if (!Notifications) return;
  const ok = await ensurePermission(false);
  if (!ok) return;
  const plan = planReminders(input);
  const sig = JSON.stringify(plan.map((p) => [p.id, p.when.getTime(), p.body]));
  if (sig === last) return;
  last = sig;
  try {
    await ensureChannel();
    await Notifications.cancelAllScheduledNotificationsAsync();
    for (const p of plan) {
      await Notifications.scheduleNotificationAsync({
        identifier: p.id,
        content: { title: p.title, body: p.body, data: { url: p.url }, sound: false },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: p.when, channelId: CHANNEL },
      });
    }
  } catch {
    /* Expo Go without notification support, or a denied permission mid-flight — nothing to do */
  }
}

export async function clearReminders() {
  const Notifications = notifications();
  last = "";
  if (!Notifications) return;
  await Notifications.cancelAllScheduledNotificationsAsync().catch(() => {});
}
