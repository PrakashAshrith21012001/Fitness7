import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import type { FoodLogRow, FoodSource, MealSlot } from "@f7/content";
import { parseLocal, slotForHour } from "@f7/content";
import { isConfigured, supabase } from "@/lib/supabase";
import { enqueue } from "@/lib/outbox";
import { api, apiConfigured } from "@/lib/api";
import { useSession, today } from "@/state/session";

/**
 * Food log. Same shape as everything else in the app: the phone is the
 * truth, Supabase is the copy. Adds and removes go local-first through the
 * outbox; the last 14 days are pulled on sign-in and merged by id.
 */

export type FoodEntry = {
  id: string;
  date: string;
  meal: MealSlot;
  name: string;
  foodId?: string;
  grams: number;
  portionLabel?: string;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  confidence: number;
  source: FoodSource;
  loggedAt: string;
};

/** What the parse/photo routes and the on-device parser both produce. */
export type DraftItem = {
  name: string;
  foodId?: string;
  grams: number;
  portionLabel: string;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  confidence: number;
  source: FoodSource;
  needsConfirm: boolean;
  estimate?: boolean;
};

export type ParseResponse = {
  items: DraftItem[];
  mealSlot: MealSlot;
  notes: string | null;
  handoff?: boolean;
  plateDescription?: string;
  notFood?: boolean;
  usage?: { modelCalled: boolean; remainingToday: number };
  /** true when the API could not be reached and only the table answered */
  offline?: boolean;
};

export type Totals = { kcal: number; proteinG: number; carbsG: number; fatG: number; count: number };

type Ctx = {
  entries: FoodEntry[];
  forDate: (date: string) => FoodEntry[];
  totals: (date: string) => Totals;
  addItems: (items: DraftItem[], meal: MealSlot, date?: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  recent: DraftItem[];
  parseText: (text: string, opts?: { allowApi?: boolean }) => Promise<ParseResponse>;
  analysePhoto: (imageBase64: string, hint?: string) => Promise<ParseResponse>;
  defaultSlot: () => MealSlot;
  /** The last save, for the "Added to lunch · Undo" toast. Cleared by dismissSaved or undoSaved. */
  lastSaved: SavedNote | null;
  dismissSaved: () => void;
  undoSaved: () => Promise<void>;
};

export type SavedNote = { ids: string[]; meal: MealSlot; kcal: number; count: number; at: number };

const KEY = "f7-food";
const KEEP_DAYS = 60;
const FoodCtx = createContext<Ctx | null>(null);

function fromRow(r: FoodLogRow): FoodEntry {
  return {
    id: r.id,
    date: r.date,
    meal: r.meal,
    name: r.name,
    foodId: r.food_id ?? undefined,
    grams: Number(r.grams),
    portionLabel: r.portion_label ?? undefined,
    kcal: Number(r.kcal),
    proteinG: Number(r.protein_g),
    carbsG: Number(r.carbs_g),
    fatG: Number(r.fat_g),
    confidence: Number(r.confidence),
    source: r.source,
    loggedAt: r.logged_at,
  };
}

function toRow(e: FoodEntry): Omit<FoodLogRow, "member_id" | "logged_at" | "deleted_at"> {
  return {
    id: e.id,
    date: e.date,
    meal: e.meal,
    name: e.name,
    food_id: e.foodId ?? null,
    grams: e.grams,
    portion_label: e.portionLabel ?? null,
    kcal: e.kcal,
    protein_g: e.proteinG,
    carbs_g: e.carbsG,
    fat_g: e.fatG,
    confidence: e.confidence,
    source: e.source,
  };
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function FoodProvider({ children }: { children: ReactNode }) {
  const { member, ready } = useSession();
  const memberId = member?.id ?? null;
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [lastSaved, setLastSaved] = useState<SavedNote | null>(null);
  const ref = useRef<FoodEntry[]>([]);
  ref.current = entries;

  const persist = useCallback(async (list: FoodEntry[]) => {
    const cutoff = daysAgo(KEEP_DAYS);
    const trimmed = list.filter((e) => e.date >= cutoff).sort((a, b) => a.loggedAt.localeCompare(b.loggedAt));
    ref.current = trimmed;
    setEntries(trimmed);
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
        if (v && !cancelled) await persist(JSON.parse(v) as FoodEntry[]);
      } catch {
        /* no cache */
      }
      const c = supabase();
      if (!c || !memberId || memberId.startsWith("local-")) return;
      try {
        const { data } = await c
          .from("food_logs")
          .select("*")
          .eq("member_id", memberId)
          .is("deleted_at", null)
          .gte("date", daysAgo(14))
          .order("logged_at", { ascending: true });
        if (data && !cancelled) {
          const server = (data as FoodLogRow[]).map(fromRow);
          const ids = new Set(server.map((e) => e.id));
          const local = ref.current.filter((e) => !ids.has(e.id));
          await persist([...server, ...local]);
        }
      } catch {
        /* offline — cache stands */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [memberId, persist]);

  // signed out → forget the log on this phone
  // Only once the session has actually loaded — before that, member is null
  // for a moment and this used to wipe the log on every launch.
  useEffect(() => {
    if (ready && !memberId) {
      ref.current = [];
      setEntries([]);
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

  const addItems = useCallback(
    async (items: DraftItem[], meal: MealSlot, date = today()) => {
      if (!items.length) return;
      const now = new Date().toISOString();
      const fresh: FoodEntry[] = items.map((i) => ({
        id: Crypto.randomUUID(),
        date,
        meal,
        name: i.name,
        foodId: i.foodId,
        grams: Math.round(i.grams),
        portionLabel: i.portionLabel,
        kcal: Math.round(i.kcal),
        proteinG: Math.round(i.proteinG * 10) / 10,
        carbsG: Math.round(i.carbsG * 10) / 10,
        fatG: Math.round(i.fatG * 10) / 10,
        confidence: i.confidence,
        source: i.source,
        loggedAt: now,
      }));
      await persist([...ref.current, ...fresh]);
      for (const e of fresh) push({ kind: "food.add", row: toRow(e) });
      setLastSaved({ ids: fresh.map((e) => e.id), meal, kcal: fresh.reduce((a, b) => a + b.kcal, 0), count: fresh.length, at: Date.now() });
    },
    [persist, push],
  );

  const remove = useCallback(
    async (id: string) => {
      await persist(ref.current.filter((e) => e.id !== id));
      push({ kind: "food.remove", id });
    },
    [persist, push],
  );

  const dismissSaved = useCallback(() => setLastSaved(null), []);
  const undoSaved = useCallback(async () => {
    const note = lastSaved;
    setLastSaved(null);
    if (!note) return;
    const gone = new Set(note.ids);
    await persist(ref.current.filter((e) => !gone.has(e.id)));
    for (const id of note.ids) push({ kind: "food.remove", id });
  }, [lastSaved, persist, push]);

  const forDate = useCallback((date: string) => entries.filter((e) => e.date === date), [entries]);

  const totals = useCallback(
    (date: string): Totals => {
      const list = entries.filter((e) => e.date === date);
      return list.reduce(
        (t, e) => ({ kcal: t.kcal + e.kcal, proteinG: t.proteinG + e.proteinG, carbsG: t.carbsG + e.carbsG, fatG: t.fatG + e.fatG, count: t.count + 1 }),
        { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0, count: 0 },
      );
    },
    [entries],
  );

  /** Last 20 distinct things logged, newest first — one tap to add again. */
  const recent = useMemo<DraftItem[]>(() => {
    const seen = new Set<string>();
    const out: DraftItem[] = [];
    for (const e of [...entries].reverse()) {
      const k = (e.foodId ?? e.name.toLowerCase()) + "|" + e.grams;
      if (seen.has(k)) continue;
      seen.add(k);
      out.push({
        name: e.name,
        foodId: e.foodId,
        grams: e.grams,
        portionLabel: e.portionLabel ?? `${e.grams} g`,
        kcal: e.kcal,
        proteinG: e.proteinG,
        carbsG: e.carbsG,
        fatG: e.fatG,
        confidence: e.confidence,
        source: e.source,
        needsConfirm: false,
      });
      if (out.length >= 20) break;
    }
    return out;
  }, [entries]);

  const defaultSlot = useCallback(() => slotForHour(new Date().getHours()), []);

  /**
   * Table first (instant, offline). If something is left and the API is
   * reachable, ask it for the rest. Never throws: the worst case is a result
   * with the unmatched text in `notes`.
   */
  const parseText = useCallback(
    async (text: string, opts?: { allowApi?: boolean }): Promise<ParseResponse> => {
      const local = parseLocal(text);
      const base: ParseResponse = {
        items: local.items.map((i) => ({ ...i })),
        mealSlot: local.mealSlot ?? slotForHour(new Date().getHours()),
        notes: null,
      };
      if (!local.unmatched.length || opts?.allowApi === false) return base;
      const canApi = apiConfigured && isConfigured && memberId && !memberId.startsWith("local-");
      if (!canApi) return { ...base, notes: `Couldn't read "${local.unmatched.join(", ")}" — add it by hand or try Recent.`, offline: true };
      try {
        const res = await api<ParseResponse>("/api/food/parse", {
          body: { text, memberContext: { goal: member?.goal, hour: new Date().getHours() } },
          timeoutMs: 20_000,
        });
        return res;
      } catch (e) {
        const msg = (e as Error).message || "";
        return { ...base, notes: /limit|day/i.test(msg) ? msg : `Couldn't read "${local.unmatched.join(", ")}" right now — add it by hand.`, offline: true };
      }
    },
    [memberId, member?.goal],
  );

  const analysePhoto = useCallback(
    async (imageBase64: string, hint?: string): Promise<ParseResponse> => {
      const canApi = apiConfigured && isConfigured && memberId && !memberId.startsWith("local-");
      if (!canApi) throw new Error("Photo logging needs an account and a connection. Type the meal instead.");
      return api<ParseResponse>("/api/food/photo", { body: { imageBase64, hint, hour: new Date().getHours() }, timeoutMs: 50_000 });
    },
    [memberId],
  );

  const value = useMemo<Ctx>(
    () => ({ entries, forDate, totals, addItems, remove, recent, parseText, analysePhoto, defaultSlot, lastSaved, dismissSaved, undoSaved }),
    [entries, forDate, totals, addItems, remove, recent, parseText, analysePhoto, defaultSlot, lastSaved, dismissSaved, undoSaved],
  );
  return <FoodCtx.Provider value={value}>{children}</FoodCtx.Provider>;
}

export function useFood() {
  const ctx = useContext(FoodCtx);
  if (!ctx) throw new Error("useFood outside FoodProvider");
  return ctx;
}

export const MEALS: { id: MealSlot; label: string }[] = [
  { id: "breakfast", label: "Breakfast" },
  { id: "lunch", label: "Lunch" },
  { id: "snacks", label: "Snacks" },
  { id: "dinner", label: "Dinner" },
];
