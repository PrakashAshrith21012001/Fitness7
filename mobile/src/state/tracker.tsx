import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import type { MealSlot } from "@f7/content";
import { sleepMinutes } from "@f7/content";
import { useSession, today } from "@/state/session";
import type { DraftItem } from "@/state/food";

/**
 * Everything the HealthifyMe-style tracker keeps that the food, water and
 * activity logs don't: the setup answers, the weight goal, sleep, steps,
 * saved meals, snap thumbnails and progress photos.
 *
 * Phone-only for now (AsyncStorage), like the weekly goal and health flags
 * in bookings.tsx. Photos are small JPEG thumbnails kept on this phone and
 * never uploaded.
 */

export type SleepLog = { bed: string; wake: string; mins: number; source: "confirm" | "manual" };
export type SavedMeal = { id: string; name: string; slot: MealSlot; items: DraftItem[]; createdAt: string };
export type Snap = { id: string; date: string; meal: MealSlot; thumb: string; kcal: number; names: string[]; at: string };

export type TrackerState = {
  setupDone: boolean;
  lookingFor: string[];
  city?: string;
  language?: string;
  conditions: string[];
  healthSync: "apple" | "manual" | null;
  welcomeDismissed: boolean;
  unit: "kg" | "lb";
  targetKg?: number;
  goalStart?: { date: string; kg: number };
  weightReminder: boolean;
  sleepGoalH: number;
  bed: string;
  wake: string;
  remindBed: boolean;
  remindWake: boolean;
  sleepWelcomed: boolean;
  sleep: Record<string, SleepLog>;
  steps: Record<string, number>;
  stepsGoal: number;
  savedMeals: SavedMeal[];
  snaps: Snap[];
  weightPhotos: Record<string, string>;
};

export const TRACKER0: TrackerState = {
  setupDone: false,
  lookingFor: [],
  conditions: [],
  healthSync: null,
  welcomeDismissed: false,
  unit: "kg",
  weightReminder: false,
  sleepGoalH: 8,
  bed: "23:30",
  wake: "07:30",
  remindBed: true,
  remindWake: true,
  sleepWelcomed: false,
  sleep: {},
  steps: {},
  stepsGoal: 10000,
  savedMeals: [],
  snaps: [],
  weightPhotos: {},
};

const KEY = "f7-tracker";
const MAX_SNAPS = 40;
const MAX_PHOTOS = 30;
const KEEP_DAYS = 120;

type Ctx = {
  state: TrackerState;
  ready: boolean;
  patch: (p: Partial<TrackerState>) => Promise<void>;
  logSleep: (bed: string, wake: string, source: SleepLog["source"], date?: string) => Promise<void>;
  removeSleep: (date: string) => Promise<void>;
  setSteps: (n: number, date?: string) => Promise<void>;
  saveMeal: (name: string, slot: MealSlot, items: DraftItem[]) => Promise<SavedMeal | null>;
  removeMeal: (id: string) => Promise<void>;
  addSnap: (s: Omit<Snap, "id" | "at">) => Promise<void>;
  setWeightPhoto: (date: string, thumb: string | null) => Promise<void>;
  setGoal: (targetKg: number, currentKg: number) => Promise<void>;
};

const TrackerCtx = createContext<Ctx | null>(null);

function cutoff(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Older saves may miss newer keys, and a corrupt one must never crash the app. */
export function hydrateTracker(raw: unknown): TrackerState {
  if (!raw || typeof raw !== "object") return TRACKER0;
  const r = raw as Partial<TrackerState>;
  return {
    ...TRACKER0,
    ...r,
    lookingFor: Array.isArray(r.lookingFor) ? r.lookingFor : [],
    conditions: Array.isArray(r.conditions) ? r.conditions : [],
    sleep: r.sleep && typeof r.sleep === "object" ? r.sleep : {},
    steps: r.steps && typeof r.steps === "object" ? r.steps : {},
    savedMeals: Array.isArray(r.savedMeals) ? r.savedMeals : [],
    snaps: Array.isArray(r.snaps) ? r.snaps : [],
    weightPhotos: r.weightPhotos && typeof r.weightPhotos === "object" ? r.weightPhotos : {},
  };
}

export function TrackerProvider({ children }: { children: ReactNode }) {
  const { member, ready: sessionReady } = useSession();
  const memberId = member?.id ?? null;
  const [state, setState] = useState<TrackerState>(TRACKER0);
  const [ready, setReady] = useState(false);
  const ref = useRef<TrackerState>(state);
  ref.current = state;

  const persist = useCallback(async (next: TrackerState) => {
    const cut = cutoff(KEEP_DAYS);
    const trimmed: TrackerState = {
      ...next,
      sleep: Object.fromEntries(Object.entries(next.sleep).filter(([d]) => d >= cut)),
      steps: Object.fromEntries(Object.entries(next.steps).filter(([d]) => d >= cut)),
      snaps: next.snaps.slice(0, MAX_SNAPS),
      weightPhotos: Object.fromEntries(Object.entries(next.weightPhotos).sort(([a], [b]) => b.localeCompare(a)).slice(0, MAX_PHOTOS)),
    };
    ref.current = trimmed;
    setState(trimmed);
    try {
      await AsyncStorage.setItem(KEY, JSON.stringify(trimmed));
    } catch {
      /* best effort — e.g. storage full; state still holds for this session */
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(KEY)
      .then((v) => {
        if (cancelled) return;
        if (v) {
          try {
            const s = hydrateTracker(JSON.parse(v));
            ref.current = s;
            setState(s);
          } catch {
            /* corrupt — start fresh */
          }
        }
      })
      .catch(() => {})
      .finally(() => !cancelled && setReady(true));
    return () => {
      cancelled = true;
    };
  }, []);

  // signed out → forget this member's tracker on the phone
  useEffect(() => {
    if (sessionReady && !memberId && ready) {
      ref.current = TRACKER0;
      setState(TRACKER0);
      AsyncStorage.removeItem(KEY).catch(() => {});
    }
  }, [sessionReady, memberId, ready]);

  const patch = useCallback((p: Partial<TrackerState>) => persist({ ...ref.current, ...p }), [persist]);

  const logSleep = useCallback(
    (bed: string, wake: string, source: SleepLog["source"], date = today()) =>
      persist({ ...ref.current, sleep: { ...ref.current.sleep, [date]: { bed, wake, mins: sleepMinutes(bed, wake), source } } }),
    [persist],
  );
  const removeSleep = useCallback(
    (date: string) => {
      const sleep = { ...ref.current.sleep };
      delete sleep[date];
      return persist({ ...ref.current, sleep });
    },
    [persist],
  );
  const setSteps = useCallback(
    (n: number, date = today()) => persist({ ...ref.current, steps: { ...ref.current.steps, [date]: Math.max(0, Math.min(100000, Math.round(n))) } }),
    [persist],
  );
  const saveMeal = useCallback(
    async (name: string, slot: MealSlot, items: DraftItem[]) => {
      const clean = name.trim().slice(0, 60);
      if (!clean || !items.length) return null;
      const meal: SavedMeal = { id: Crypto.randomUUID(), name: clean, slot, items, createdAt: new Date().toISOString() };
      await persist({ ...ref.current, savedMeals: [meal, ...ref.current.savedMeals.filter((m) => m.name.toLowerCase() !== clean.toLowerCase())].slice(0, 50) });
      return meal;
    },
    [persist],
  );
  const removeMeal = useCallback((id: string) => persist({ ...ref.current, savedMeals: ref.current.savedMeals.filter((m) => m.id !== id) }), [persist]);
  const addSnap = useCallback(
    (s: Omit<Snap, "id" | "at">) => persist({ ...ref.current, snaps: [{ ...s, id: Crypto.randomUUID(), at: new Date().toISOString() }, ...ref.current.snaps] }),
    [persist],
  );
  const setWeightPhoto = useCallback(
    (date: string, thumb: string | null) => {
      const weightPhotos = { ...ref.current.weightPhotos };
      if (thumb) weightPhotos[date] = thumb;
      else delete weightPhotos[date];
      return persist({ ...ref.current, weightPhotos });
    },
    [persist],
  );
  const setGoal = useCallback(
    (targetKg: number, currentKg: number) => persist({ ...ref.current, targetKg: Math.round(targetKg * 10) / 10, goalStart: { date: today(), kg: currentKg } }),
    [persist],
  );

  const value = useMemo<Ctx>(
    () => ({ state, ready, patch, logSleep, removeSleep, setSteps, saveMeal, removeMeal, addSnap, setWeightPhoto, setGoal }),
    [state, ready, patch, logSleep, removeSleep, setSteps, saveMeal, removeMeal, addSnap, setWeightPhoto, setGoal],
  );
  return <TrackerCtx.Provider value={value}>{children}</TrackerCtx.Provider>;
}

export function useTracker() {
  const ctx = useContext(TrackerCtx);
  if (!ctx) throw new Error("useTracker outside TrackerProvider");
  return ctx;
}
