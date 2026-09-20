import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Member session.
 *
 * This is a LOCAL session — sign-in is accepted on the device and stored,
 * nothing is verified against a server yet. It exists so the whole flow
 * (welcome → login → onboarding → home in the right state) can be walked and
 * shown to the owner. To make it real, swap `signIn` for Supabase auth and
 * `member` for a row from the members table; every screen reads from here.
 */

export type Goal = "strength" | "fat-loss" | "trek" | "general";
export type Slot = "early" | "morning" | "ladies" | "evening";

export type Member = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  provider: "phone" | "google" | "apple" | "email";
  goal?: Goal;
  slot?: Slot;
  /** null = no active plan (the app's "empty" state) */
  plan: null | { id: string; name: string; renewsOn: string };
  joinedOn: string;
  onboarded: boolean;
  treksDone: number;
  /** Consecutive weeks (ending this week) with at least one check-in. Derived from `checkins`. */
  streakWeeks: number;
  notifications: { classes: boolean; treks: boolean; renewals: boolean };
  /** ISO dates (YYYY-MM-DD) the member checked in, newest last */
  checkins: string[];
  /** Weight log, oldest first */
  weights: { date: string; kg: number }[];
  /** Class ids the member follows (reminders + "your week") */
  followed: string[];
  /** Trek ids the member has reserved a slot for */
  reserved: string[];
};

const defaults: Pick<Member, "checkins" | "weights" | "followed" | "reserved" | "treksDone" | "streakWeeks"> = {
  checkins: [],
  weights: [],
  followed: [],
  reserved: [],
  treksDone: 0,
  streakWeeks: 0,
};

export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/** Monday-based ISO week key, e.g. "2026-W38" */
function weekKey(iso: string) {
  const d = new Date(iso + "T12:00:00");
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day + 3);
  const firstThu = new Date(d.getFullYear(), 0, 4);
  const week = 1 + Math.round(((d.getTime() - firstThu.getTime()) / 86400000 - 3 + ((firstThu.getDay() + 6) % 7)) / 7);
  return `${d.getFullYear()}-W${week}`;
}

export function streakFrom(checkins: string[]) {
  const weeks = new Set(checkins.map(weekKey));
  let streak = 0;
  const cursor = new Date();
  for (;;) {
    const iso = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
    if (!weeks.has(weekKey(iso))) {
      // The current week may still be in progress; only break the streak on a fully missed week.
      if (streak === 0 && weekKey(iso) === weekKey(today())) {
        cursor.setDate(cursor.getDate() - 7);
        continue;
      }
      break;
    }
    streak += 1;
    cursor.setDate(cursor.getDate() - 7);
  }
  return streak;
}

type Ctx = {
  ready: boolean;
  member: Member | null;
  signIn: (p: { provider: Member["provider"]; identity: string }) => Promise<void>;
  signOut: () => Promise<void>;
  update: (patch: Partial<Member>) => Promise<void>;
  checkIn: () => Promise<boolean>;
  logWeight: (kg: number) => Promise<void>;
  toggleFollow: (classId: string) => Promise<void>;
  toggleReserve: (trekId: string) => Promise<void>;
};

const KEY = "f7-session";
const SessionCtx = createContext<Ctx | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [member, setMember] = useState<Member | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((v) => {
        if (!v) return;
        const m = { ...defaults, ...(JSON.parse(v) as Member) };
        setMember({ ...m, streakWeeks: streakFrom(m.checkins) });
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const persist = useCallback(async (m: Member | null) => {
    setMember(m);
    if (m) await AsyncStorage.setItem(KEY, JSON.stringify(m));
    else await AsyncStorage.removeItem(KEY);
  }, []);

  const signIn = useCallback(async ({ provider, identity }: { provider: Member["provider"]; identity: string }) => {
    const m: Member = {
      id: `local-${Date.now()}`,
      name: "",
      phone: provider === "phone" ? identity : undefined,
      email: provider !== "phone" ? identity : undefined,
      provider,
      plan: null,
      joinedOn: new Date().toISOString().slice(0, 10),
      onboarded: false,
      notifications: { classes: true, treks: true, renewals: true },
      ...defaults,
    };
    await persist(m);
  }, [persist]);

  const signOut = useCallback(() => persist(null), [persist]);
  const update = useCallback(async (patch: Partial<Member>) => {
    if (!member) return;
    await persist({ ...member, ...patch });
  }, [member, persist]);

  const checkIn = useCallback(async () => {
    if (!member) return false;
    const t = today();
    if (member.checkins.includes(t)) return false;
    const checkins = [...member.checkins, t];
    await persist({ ...member, checkins, streakWeeks: streakFrom(checkins) });
    return true;
  }, [member, persist]);

  const logWeight = useCallback(async (kg: number) => {
    if (!member) return;
    const t = today();
    const weights = [...member.weights.filter((w) => w.date !== t), { date: t, kg }].sort((a, b) => a.date.localeCompare(b.date));
    await persist({ ...member, weights });
  }, [member, persist]);

  const toggleIn = (key: "followed" | "reserved") =>
    async (id: string) => {
      if (!member) return;
      const list = member[key];
      const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
      await persist({ ...member, [key]: next });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const toggleFollow = useCallback(toggleIn("followed"), [member, persist]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const toggleReserve = useCallback(toggleIn("reserved"), [member, persist]);

  const value = useMemo(
    () => ({ ready, member, signIn, signOut, update, checkIn, logWeight, toggleFollow, toggleReserve }),
    [ready, member, signIn, signOut, update, checkIn, logWeight, toggleFollow, toggleReserve],
  );
  return <SessionCtx.Provider value={value}>{children}</SessionCtx.Provider>;
}

/** "+919876543210" → "+91 98765 43210" */
export function prettyPhone(p?: string) {
  if (!p) return "";
  const m = p.replace(/\s/g, "").match(/^(\+91)?(\d{5})(\d{5})$/);
  return m ? `+91 ${m[2]} ${m[3]}` : p;
}

export function useSession() {
  const ctx = useContext(SessionCtx);
  if (!ctx) throw new Error("useSession outside SessionProvider");
  return ctx;
}
