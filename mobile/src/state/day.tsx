import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import type { ActivityLogRow, WaterLogRow } from "@f7/content";
import { ACTIVITY_BY_ID, burnKcal, waterTargetMl } from "@f7/content";
import { isConfigured, supabase } from "@/lib/supabase";
import { enqueue } from "@/lib/outbox";
import { useSession, today } from "@/state/session";

/**
 * Water and activity for each day. Same shape as the food log: the phone is
 * the truth, writes go local-first through the outbox, the last 14 days are
 * pulled on sign-in and merged.
 */

export type ActivityEntry = {
  id: string;
  date: string;
  activityId: string;
  name: string;
  minutes: number;
  kcal: number;
  loggedAt: string;
};

type DayState = {
  water: Record<string, number>; // date → ml
  activities: ActivityEntry[];
};

type Ctx = {
  waterMl: (date: string) => number;
  /** goal for the day: the member's own setting, else from weight + today's activity */
  waterGoal: (date: string) => number;
  glassMl: number;
  addGlass: (date?: string) => Promise<void>;
  removeGlass: (date?: string) => Promise<void>;
  setWater: (ml: number, date?: string) => Promise<void>;
  activitiesFor: (date: string) => ActivityEntry[];
  burned: (date: string) => number;
  activeMinutes: (date: string) => number;
  addActivity: (activityId: string, minutes: number, date?: string) => Promise<ActivityEntry | null>;
  removeActivity: (id: string) => Promise<void>;
  /** the member's latest weight, for the burn formula */
  kg: number;
  recentActivities: string[];
};

const KEY = "f7-day";
const KEEP_DAYS = 60;
const DayCtx = createContext<Ctx | null>(null);

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function DayProvider({ children }: { children: ReactNode }) {
  const { member, ready } = useSession();
  const memberId = member?.id ?? null;
  const [state, setState] = useState<DayState>({ water: {}, activities: [] });
  const ref = useRef<DayState>(state);
  ref.current = state;

  const kg = member?.weights.length ? member.weights[member.weights.length - 1].kg : 65;
  const glassMl = member?.glassMl ?? 250;

  const persist = useCallback(async (next: DayState) => {
    const cutoff = daysAgo(KEEP_DAYS);
    const trimmed: DayState = {
      water: Object.fromEntries(Object.entries(next.water).filter(([d]) => d >= cutoff)),
      activities: next.activities.filter((a) => a.date >= cutoff).sort((a, b) => a.loggedAt.localeCompare(b.loggedAt)),
    };
    ref.current = trimmed;
    setState(trimmed);
    try {
      await AsyncStorage.setItem(KEY, JSON.stringify(trimmed));
    } catch {
      /* best effort */
    }
  }, []);

  // cache first, then the server copy
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const v = await AsyncStorage.getItem(KEY);
        if (v && !cancelled) await persist(JSON.parse(v) as DayState);
      } catch {
        /* no cache */
      }
      const c = supabase();
      if (!c || !memberId || memberId.startsWith("local-")) return;
      try {
        const since = daysAgo(14);
        const [w, a] = await Promise.all([
          c.from("water_logs").select("*").eq("member_id", memberId).gte("date", since),
          c.from("activity_logs").select("*").eq("member_id", memberId).is("deleted_at", null).gte("date", since).order("logged_at"),
        ]);
        if (cancelled) return;
        const cur = ref.current;
        const water = { ...cur.water };
        for (const r of (w.data as WaterLogRow[]) ?? []) water[r.date] = Math.max(water[r.date] ?? 0, Number(r.ml));
        const server = ((a.data as ActivityLogRow[]) ?? []).map<ActivityEntry>((r) => ({
          id: r.id, date: r.date, activityId: r.activity_id, name: r.name, minutes: r.minutes, kcal: r.kcal, loggedAt: r.logged_at,
        }));
        const ids = new Set(server.map((e) => e.id));
        await persist({ water, activities: [...server, ...cur.activities.filter((e) => !ids.has(e.id))] });
      } catch {
        /* offline — cache stands */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [memberId, persist]);

  // Only once the session has actually loaded — before that, member is null
  // for a moment and this used to wipe the log on every launch.
  useEffect(() => {
    if (ready && !memberId) {
      ref.current = { water: {}, activities: [] };
      setState({ water: {}, activities: [] });
      AsyncStorage.removeItem(KEY).catch(() => {});
    }
  }, [ready, memberId]);

  const push = useCallback(
    (op: Parameters<typeof enqueue>[1]) => {
      if (!isConfigured || !memberId || memberId.startsWith("local-")) return;
      void enqueue(memberId, op);
    },
    [memberId],
  );

  const waterMl = useCallback((date: string) => state.water[date] ?? 0, [state.water]);
  const activitiesFor = useCallback((date: string) => state.activities.filter((a) => a.date === date), [state.activities]);
  const activeMinutes = useCallback((date: string) => activitiesFor(date).reduce((t, a) => t + a.minutes, 0), [activitiesFor]);
  const burned = useCallback((date: string) => activitiesFor(date).reduce((t, a) => t + a.kcal, 0), [activitiesFor]);
  const waterGoal = useCallback(
    (date: string) => member?.waterGoalMl ?? waterTargetMl(kg, activeMinutes(date), glassMl),
    [member?.waterGoalMl, kg, activeMinutes, glassMl],
  );

  const setWater = useCallback(
    async (ml: number, date = today()) => {
      const v = Math.max(0, Math.min(10000, Math.round(ml)));
      await persist({ ...ref.current, water: { ...ref.current.water, [date]: v } });
      push({ kind: "water.set", date, ml: v });
    },
    [persist, push],
  );
  const addGlass = useCallback((date = today()) => setWater((ref.current.water[date] ?? 0) + glassMl, date), [setWater, glassMl]);
  const removeGlass = useCallback((date = today()) => setWater((ref.current.water[date] ?? 0) - glassMl, date), [setWater, glassMl]);

  const addActivity = useCallback(
    async (activityId: string, minutes: number, date = today()) => {
      const a = ACTIVITY_BY_ID[activityId];
      if (!a || minutes <= 0) return null;
      const entry: ActivityEntry = {
        id: Crypto.randomUUID(),
        date,
        activityId,
        name: a.name,
        minutes: Math.round(minutes),
        kcal: burnKcal(a.met, minutes, kg),
        loggedAt: new Date().toISOString(),
      };
      await persist({ ...ref.current, activities: [...ref.current.activities, entry] });
      push({ kind: "activity.add", row: { id: entry.id, date, activity_id: activityId, name: entry.name, minutes: entry.minutes, kcal: entry.kcal } });
      return entry;
    },
    [persist, push, kg],
  );

  const removeActivity = useCallback(
    async (id: string) => {
      await persist({ ...ref.current, activities: ref.current.activities.filter((a) => a.id !== id) });
      push({ kind: "activity.remove", id });
    },
    [persist, push],
  );

  const recentActivities = useMemo(() => {
    const seen: string[] = [];
    for (const a of [...state.activities].reverse()) {
      if (!seen.includes(a.activityId)) seen.push(a.activityId);
      if (seen.length >= 4) break;
    }
    return seen;
  }, [state.activities]);

  const value = useMemo<Ctx>(
    () => ({ waterMl, waterGoal, glassMl, addGlass, removeGlass, setWater, activitiesFor, burned, activeMinutes, addActivity, removeActivity, kg, recentActivities }),
    [waterMl, waterGoal, glassMl, addGlass, removeGlass, setWater, activitiesFor, burned, activeMinutes, addActivity, removeActivity, kg, recentActivities],
  );
  return <DayCtx.Provider value={value}>{children}</DayCtx.Provider>;
}

export function useDay() {
  const ctx = useContext(DayCtx);
  if (!ctx) throw new Error("useDay outside DayProvider");
  return ctx;
}
