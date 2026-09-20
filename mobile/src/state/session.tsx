import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Session, User } from "@supabase/supabase-js";
import type { CheckinRow, ClassFollowRow, MemberRow, NotificationPrefsRow, TrekReservationRow, WeightRow } from "@f7/content";
import { isConfigured, supabase } from "@/lib/supabase";
import { clearOutbox, enqueue, flush, wireOutbox, type Op } from "@/lib/outbox";
import { sendOtp, verifyOtp, signInWithGoogleIdToken, signInWithApple, signOutEverywhere } from "@/lib/auth";

/**
 * Member session.
 *
 * Offline-first: the member record lives on the phone (AsyncStorage) and every
 * screen reads from this one hook, exactly as before. What changed underneath:
 *
 *  - sign-in is real (Supabase phone OTP / Google / Apple) when
 *    EXPO_PUBLIC_SUPABASE_URL is set; without it the app runs in local mode
 *    and behaves like the prototype.
 *  - every write updates local state first, then goes into an outbox
 *    (src/lib/outbox.ts) that syncs to Supabase in the background and retries
 *    on reconnect. Nothing waits for the network, no screen got a spinner.
 *  - on boot / sign-in the server copy is pulled and merged with the cache.
 *  - a session that existed before the backend (id "local-…") is migrated
 *    into the new account on first sign-in.
 */

export type Goal = "strength" | "fat-loss" | "trek" | "general";
export type Slot = "early" | "morning" | "ladies" | "evening";
export type Sex = "male" | "female";
export type Activity = "gym3" | "gym5" | "trek";

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
  /** "Your numbers" — optional, for the daily target */
  heightCm?: number;
  age?: number;
  sex?: Sex;
  activity?: Activity;
  /** Some members don't want to see calories at all */
  hideCalories?: boolean;
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
  /** Phone: sends the OTP and sets `pendingPhone`; Google: `identity` is the ID token; Apple: opens the native sheet. */
  signIn: (p: { provider: Member["provider"]; identity: string }) => Promise<void>;
  /** Phone only — the number waiting for its code, or null. */
  pendingPhone: string | null;
  verifyCode: (code: string) => Promise<void>;
  cancelPending: () => void;
  signOut: () => Promise<void>;
  update: (patch: Partial<Member>) => Promise<void>;
  checkIn: () => Promise<boolean>;
  logWeight: (kg: number) => Promise<void>;
  toggleFollow: (classId: string) => Promise<void>;
  toggleReserve: (trekId: string) => Promise<void>;
};

const KEY = "f7-session";
const SessionCtx = createContext<Ctx | null>(null);

/* ------------------------------------------------------------------ */
/* Row ↔ Member                                                        */
/* ------------------------------------------------------------------ */

function fromRows(
  row: MemberRow,
  prefs: NotificationPrefsRow | null,
  checkins: CheckinRow[],
  weights: WeightRow[],
  follows: ClassFollowRow[],
  reservations: TrekReservationRow[],
): Member {
  const ck = checkins.map((c) => c.date).sort();
  return {
    id: row.id,
    name: row.name ?? "",
    phone: row.phone ?? undefined,
    email: row.email ?? undefined,
    provider: row.provider,
    goal: row.goal ?? undefined,
    slot: row.slot ?? undefined,
    plan: row.plan_id && row.plan_name && row.renews_on ? { id: row.plan_id, name: row.plan_name, renewsOn: row.renews_on } : null,
    joinedOn: row.joined_on,
    onboarded: row.onboarded,
    treksDone: row.treks_done ?? 0,
    streakWeeks: streakFrom(ck),
    notifications: prefs ? { classes: prefs.classes, treks: prefs.treks, renewals: prefs.renewals } : { classes: true, treks: true, renewals: true },
    checkins: ck,
    weights: weights.map((w) => ({ date: w.date, kg: Number(w.kg) })).sort((a, b) => a.date.localeCompare(b.date)),
    followed: follows.map((f) => f.class_id),
    reserved: reservations.filter((r) => r.status !== "cancelled").map((r) => r.trek_id),
    heightCm: row.height_cm ?? undefined,
    age: row.age ?? undefined,
    sex: row.sex ?? undefined,
    activity: row.activity ?? undefined,
    hideCalories: row.hide_calories ?? false,
  };
}

/** Member patch → members-table patch (only the columns that changed). */
function toRowPatch(patch: Partial<Member>): Op | null {
  const p: NonNullable<Extract<Op, { kind: "member.update" }>["patch"]> = {};
  if ("name" in patch && patch.name !== undefined) p.name = patch.name;
  if ("goal" in patch) p.goal = patch.goal ?? null;
  if ("slot" in patch) p.slot = patch.slot ?? null;
  if ("onboarded" in patch && patch.onboarded !== undefined) p.onboarded = patch.onboarded;
  if ("treksDone" in patch && patch.treksDone !== undefined) p.treks_done = patch.treksDone;
  if ("plan" in patch) {
    p.plan_id = patch.plan?.id ?? null;
    p.plan_name = patch.plan?.name ?? null;
    p.renews_on = patch.plan?.renewsOn ?? null;
  }
  if ("heightCm" in patch) p.height_cm = patch.heightCm ?? null;
  if ("age" in patch) p.age = patch.age ?? null;
  if ("sex" in patch) p.sex = patch.sex ?? null;
  if ("activity" in patch) p.activity = patch.activity ?? null;
  if ("hideCalories" in patch) p.hide_calories = !!patch.hideCalories;
  return Object.keys(p).length ? { kind: "member.update", patch: p } : null;
}

const union = (a: string[], b: string[]) => Array.from(new Set([...a, ...b])).sort();

/* ------------------------------------------------------------------ */
/* Provider                                                            */
/* ------------------------------------------------------------------ */

export function SessionProvider({ children }: { children: ReactNode }) {
  const [member, setMember] = useState<Member | null>(null);
  const [ready, setReady] = useState(false);
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);
  // Always-current member for callbacks that must not close over stale state.
  const memberRef = useRef<Member | null>(null);
  memberRef.current = member;

  const persist = useCallback(async (m: Member | null) => {
    memberRef.current = m;
    setMember(m);
    try {
      if (m) await AsyncStorage.setItem(KEY, JSON.stringify(m));
      else await AsyncStorage.removeItem(KEY);
    } catch {
      /* keep going — state is set, storage is best-effort */
    }
  }, []);

  /** Push a write to Supabase in the background (no-op in local mode). */
  const push = useCallback((m: Member, op: Op | null) => {
    if (!op || !isConfigured || m.id.startsWith("local-")) return;
    void enqueue(m.id, op);
  }, []);

  /**
   * Pull the member from Supabase and merge with what is on the phone.
   *  - a "local-…" cache (pre-backend session) is migrated into this account
   *  - otherwise server profile wins, lists are unioned (offline adds survive)
   */
  const hydrate = useCallback(
    async (user: User) => {
      const c = supabase();
      if (!c) return;
      const [rowRes, prefsRes, ckRes, wRes, fRes, rRes] = await Promise.all([
        c.from("members").select("*").eq("id", user.id).maybeSingle(),
        c.from("notification_prefs").select("*").eq("member_id", user.id).maybeSingle(),
        c.from("checkins").select("member_id,date").eq("member_id", user.id),
        c.from("weights").select("member_id,date,kg").eq("member_id", user.id),
        c.from("class_follows").select("member_id,class_id").eq("member_id", user.id),
        c.from("trek_reservations").select("member_id,trek_id,status").eq("member_id", user.id),
      ]);
      if (rowRes.error) throw rowRes.error;

      let row = rowRes.data as MemberRow | null;
      if (!row) {
        // Trigger hasn't run yet (rare) — create the row ourselves.
        const provider: MemberRow["provider"] = user.phone ? "phone" : (user.app_metadata?.provider as MemberRow["provider"]) ?? "email";
        const ins = await c
          .from("members")
          .upsert({ id: user.id, phone: user.phone ?? null, email: user.email ?? null, provider })
          .select("*")
          .single();
        if (ins.error) throw ins.error;
        row = ins.data as MemberRow;
      }

      const server = fromRows(
        row,
        (prefsRes.data as NotificationPrefsRow | null) ?? null,
        (ckRes.data as CheckinRow[]) ?? [],
        (wRes.data as WeightRow[]) ?? [],
        (fRes.data as ClassFollowRow[]) ?? [],
        (rRes.data as TrekReservationRow[]) ?? [],
      );

      const local = memberRef.current;
      let merged: Member = server;

      if (local && local.id.startsWith("local-")) {
        // ---- migrate the pre-backend session into this account ----
        const profile: Partial<Member> = {};
        if (!server.name && local.name) profile.name = local.name;
        if (!server.goal && local.goal) profile.goal = local.goal;
        if (!server.slot && local.slot) profile.slot = local.slot;
        if (!server.plan && local.plan) profile.plan = local.plan;
        if (!server.onboarded && local.onboarded) profile.onboarded = true;
        merged = {
          ...server,
          ...profile,
          checkins: union(server.checkins, local.checkins),
          weights: [...server.weights, ...local.weights.filter((w) => !server.weights.some((s) => s.date === w.date))].sort((a, b) => a.date.localeCompare(b.date)),
          followed: union(server.followed, local.followed),
          reserved: union(server.reserved, local.reserved),
        };
        merged.streakWeeks = streakFrom(merged.checkins);
        const ops: Op[] = [];
        const rp = toRowPatch(profile);
        if (rp) ops.push(rp);
        local.checkins.filter((d) => !server.checkins.includes(d)).forEach((date) => ops.push({ kind: "checkin.add", date }));
        local.weights.filter((w) => !server.weights.some((s) => s.date === w.date)).forEach((w) => ops.push({ kind: "weight.upsert", date: w.date, kg: w.kg }));
        local.followed.filter((id) => !server.followed.includes(id)).forEach((classId) => ops.push({ kind: "follow.set", classId, on: true }));
        local.reserved.filter((id) => !server.reserved.includes(id)).forEach((trekId) => ops.push({ kind: "reserve.set", trekId, on: true }));
        for (const op of ops) void enqueue(server.id, op);
      } else if (local && local.id === server.id) {
        // ---- same account: server profile, union of the lists ----
        merged = {
          ...server,
          checkins: union(server.checkins, local.checkins),
          weights: [...server.weights, ...local.weights.filter((w) => !server.weights.some((s) => s.date === w.date))].sort((a, b) => a.date.localeCompare(b.date)),
          followed: union(server.followed, local.followed),
          reserved: union(server.reserved, local.reserved),
        };
        merged.streakWeeks = streakFrom(merged.checkins);
      }
      await persist(merged);
    },
    [persist],
  );

  // ---- boot: cache first (instant), then the server copy if signed in ----
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const v = await AsyncStorage.getItem(KEY);
        if (v && !cancelled) {
          const m = { ...defaults, ...(JSON.parse(v) as Member) };
          await persist({ ...m, streakWeeks: streakFrom(m.checkins) });
        }
      } catch {
        /* no cache */
      }
      if (!cancelled) setReady(true);

      const c = supabase();
      if (!c) return;
      wireOutbox();
      try {
        const { data } = await c.auth.getSession();
        if (data.session?.user && !cancelled) await hydrate(data.session.user);
      } catch {
        /* offline at boot — the cache is the truth for now */
      }
    })();

    const c = supabase();
    const sub = c?.auth.onAuthStateChange((event: string, session: Session | null) => {
      if (event === "SIGNED_IN" && session?.user) {
        hydrate(session.user).catch(() => {});
      }
    });
    return () => {
      cancelled = true;
      sub?.data.subscription.unsubscribe();
    };
  }, [hydrate, persist]);

  /* ---------------- sign in / out ---------------- */

  const localSignIn = useCallback(
    async (provider: Member["provider"], identity: string) => {
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
    },
    [persist],
  );

  const signIn = useCallback(
    async ({ provider, identity }: { provider: Member["provider"]; identity: string }) => {
      if (!isConfigured) return localSignIn(provider, identity);
      if (provider === "phone") {
        await sendOtp(identity);
        setPendingPhone(identity);
        return;
      }
      if (provider === "google") {
        if (!identity || identity === "google@member") throw new Error("google-not-configured");
        await signInWithGoogleIdToken(identity); // onAuthStateChange → hydrate
        return;
      }
      if (provider === "apple") {
        const ok = await signInWithApple();
        if (!ok) throw new Error("apple-cancelled");
        return;
      }
      throw new Error("unsupported-provider");
    },
    [localSignIn],
  );

  const verifyCode = useCallback(
    async (code: string) => {
      if (!pendingPhone) return;
      await verifyOtp(pendingPhone, code); // onAuthStateChange → hydrate
      setPendingPhone(null);
    },
    [pendingPhone],
  );

  const cancelPending = useCallback(() => setPendingPhone(null), []);

  const signOut = useCallback(async () => {
    await flush().catch(() => {});
    await clearOutbox();
    await signOutEverywhere();
    setPendingPhone(null);
    await persist(null);
  }, [persist]);

  /* ---------------- writes: local first, then the outbox ---------------- */

  const update = useCallback(
    async (patch: Partial<Member>) => {
      const m = memberRef.current;
      if (!m) return;
      const next = { ...m, ...patch };
      await persist(next);
      push(next, toRowPatch(patch));
      if (patch.notifications) push(next, { kind: "prefs.update", prefs: patch.notifications });
    },
    [persist, push],
  );

  const checkIn = useCallback(async () => {
    const m = memberRef.current;
    if (!m) return false;
    const t = today();
    if (m.checkins.includes(t)) return false;
    const checkins = [...m.checkins, t];
    const next = { ...m, checkins, streakWeeks: streakFrom(checkins) };
    await persist(next);
    push(next, { kind: "checkin.add", date: t });
    return true;
  }, [persist, push]);

  const logWeight = useCallback(
    async (kg: number) => {
      const m = memberRef.current;
      if (!m) return;
      const t = today();
      const weights = [...m.weights.filter((w) => w.date !== t), { date: t, kg }].sort((a, b) => a.date.localeCompare(b.date));
      const next = { ...m, weights };
      await persist(next);
      push(next, { kind: "weight.upsert", date: t, kg });
    },
    [persist, push],
  );

  const toggleFollow = useCallback(
    async (classId: string) => {
      const m = memberRef.current;
      if (!m) return;
      const on = !m.followed.includes(classId);
      const next = { ...m, followed: on ? [...m.followed, classId] : m.followed.filter((x) => x !== classId) };
      await persist(next);
      push(next, { kind: "follow.set", classId, on });
    },
    [persist, push],
  );

  const toggleReserve = useCallback(
    async (trekId: string) => {
      const m = memberRef.current;
      if (!m) return;
      const on = !m.reserved.includes(trekId);
      const next = { ...m, reserved: on ? [...m.reserved, trekId] : m.reserved.filter((x) => x !== trekId) };
      await persist(next);
      push(next, { kind: "reserve.set", trekId, on });
    },
    [persist, push],
  );

  const value = useMemo<Ctx>(
    () => ({ ready, member, signIn, pendingPhone, verifyCode, cancelPending, signOut, update, checkIn, logWeight, toggleFollow, toggleReserve }),
    [ready, member, signIn, pendingPhone, verifyCode, cancelPending, signOut, update, checkIn, logWeight, toggleFollow, toggleReserve],
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
