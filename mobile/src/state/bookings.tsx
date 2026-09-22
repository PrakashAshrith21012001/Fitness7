import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { classes, workoutFor, type MuscleGroup } from "@f7/content";
import { useSession, today } from "@/state/session";

/**
 * Class bookings — the cult.fit "booked class" model.
 *
 * A booking is a class format + a date + a slot time. It moves through
 * confirmed → attended (MARK ATTENDANCE, which also checks the member in)
 * or cancelled. Attended bookings are the Past Activities list, the Memories
 * grid, the weekly muscle map and the "last 6 weeks" bars; the counts on
 * MY PROFILE (workouts, weeks active) are derived from them plus the
 * member's plain check-ins so a member who never books still sees a number.
 *
 * Local-first like everything else in the app; nothing here needs the
 * backend yet, so it lives in AsyncStorage only.
 */

export type BookingStatus = "confirmed" | "attended" | "cancelled" | "dropped";
export type Booking = {
  id: string;
  classId: string;
  /** YYYY-MM-DD */
  date: string;
  /** "06:00" */
  time: string;
  status: BookingStatus;
  /** minutes before the class to remind */
  reminderMin: number | null;
  buddies: string[];
  createdAt: string;
  /** which workout id ran that day, fixed at booking time */
  workoutId: string;
};

export type Memory = { id: string; bookingId: string; date: string; time: string; classId: string; photo: string };

type State = { bookings: Booking[] };

type Ctx = {
  bookings: Booking[];
  upcoming: Booking[];
  past: Booking[];
  byId: (id: string) => Booking | undefined;
  isBooked: (classId: string, date: string, time: string) => Booking | undefined;
  book: (classId: string, date: string, time: string) => Promise<Booking>;
  cancel: (id: string) => Promise<void>;
  dropout: (id: string) => Promise<void>;
  markAttendance: (id: string) => Promise<void>;
  setReminder: (id: string, minutes: number | null) => Promise<void>;
  invite: (id: string, buddyId: string) => Promise<void>;
  /** attended sessions (+ plain check-ins with no booking) — the number on MY PROFILE */
  workoutsTotal: number;
  weeksActive: number;
  /** attended this ISO week, and the target */
  thisWeek: { done: number; target: number };
  /** muscles trained in the week containing `date` */
  musclesFor: (weekStart: string) => MuscleGroup[];
  attendedIn: (from: string, to: string) => Booking[];
  memories: Memory[];
  /** the seeded demo history exists so a brand-new member sees the app alive; clears on sign-out */
  seeded: boolean;
};

const KEY = "f7-bookings";
const BookingsCtx = createContext<Ctx | null>(null);

export const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const addDays = (isoDate: string, n: number) => {
  const d = new Date(isoDate + "T12:00:00");
  d.setDate(d.getDate() + n);
  return iso(d);
};
/** Monday of the week containing the date */
export const weekStartOf = (isoDate: string) => {
  const d = new Date(isoDate + "T12:00:00");
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  return iso(d);
};

const uid = () => `b-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

/**
 * Demo history: a realistic 6-week run of attended classes so the profile,
 * memories and charts have something to show on first open. Replaced by real
 * bookings as the member books; dropped on sign-out.
 */
function seed(): Booking[] {
  const out: Booking[] = [];
  const t = today();
  const pattern = [7, 3, 5, 6, 5, 1]; // per week, oldest → this week (matches the reference chart)
  const ids = ["strength", "hiit", "crossfit", "strength", "combat", "strength", "yoga"];
  const times = ["18:00", "19:00", "06:00", "20:00", "17:00", "18:00", "06:00"];
  for (let w = 0; w < 6; w++) {
    const weekStart = addDays(weekStartOf(t), -7 * (5 - w));
    const n = pattern[w];
    for (let i = 0; i < n; i++) {
      const date = addDays(weekStart, i);
      if (date > t) break;
      const classId = ids[i % ids.length];
      const d = new Date(date + "T12:00:00");
      out.push({ id: `seed-${w}-${i}`, classId, date, time: times[i % times.length], status: "attended", reminderMin: 120, buddies: i % 3 === 0 ? ["hari"] : [], createdAt: date, workoutId: workoutFor(classId, d.getDay()).id });
    }
  }
  return out;
}

function upcomingSeed(): Booking[] {
  const t = today();
  const d0 = new Date(t + "T12:00:00");
  const d1 = addDays(t, 1);
  const d2 = addDays(t, 2);
  return [
    { id: "seed-up-0", classId: "strength", date: t, time: "17:00", status: "confirmed", reminderMin: 120, buddies: ["hari"], createdAt: t, workoutId: workoutFor("strength", d0.getDay()).id },
    { id: "seed-up-1", classId: "strength", date: d1, time: "20:00", status: "confirmed", reminderMin: 120, buddies: ["hari"], createdAt: t, workoutId: workoutFor("strength", (d0.getDay() + 1) % 7).id },
    { id: "seed-up-2", classId: "strength", date: d2, time: "06:00", status: "confirmed", reminderMin: null, buddies: [], createdAt: t, workoutId: workoutFor("strength", (d0.getDay() + 2) % 7).id },
  ];
}

export function BookingsProvider({ children }: { children: ReactNode }) {
  const { member, ready } = useSession();
  const [state, setState] = useState<State>({ bookings: [] });
  const [seeded, setSeeded] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    if (!ready) return;
    (async () => {
      try {
        const v = await AsyncStorage.getItem(KEY);
        if (v) {
          const s = JSON.parse(v) as State & { seeded?: boolean };
          setState({ bookings: s.bookings ?? [] });
          setSeeded(!!s.seeded);
        } else if (member) {
          const bookings = [...seed(), ...upcomingSeed()];
          setState({ bookings });
          setSeeded(true);
          await AsyncStorage.setItem(KEY, JSON.stringify({ bookings, seeded: true }));
        }
      } catch {
        /* fresh */
      }
      loaded.current = true;
    })();
  }, [ready, member?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // sign-out clears the demo history
  useEffect(() => {
    if (ready && !member && loaded.current) {
      setState({ bookings: [] });
      setSeeded(false);
      AsyncStorage.removeItem(KEY).catch(() => {});
    }
  }, [ready, member]);

  const persist = useCallback(
    async (bookings: Booking[]) => {
      setState({ bookings });
      await AsyncStorage.setItem(KEY, JSON.stringify({ bookings, seeded })).catch(() => {});
    },
    [seeded],
  );

  const stateRef = useRef(state);
  stateRef.current = state;

  const book = useCallback(
    async (classId: string, date: string, time: string) => {
      const existing = stateRef.current.bookings.find((b) => b.classId === classId && b.date === date && b.time === time && b.status !== "cancelled");
      if (existing) return existing;
      const d = new Date(date + "T12:00:00");
      const b: Booking = { id: uid(), classId, date, time, status: "confirmed", reminderMin: 120, buddies: [], createdAt: new Date().toISOString(), workoutId: workoutFor(classId, d.getDay()).id };
      await persist([...stateRef.current.bookings, b]);
      return b;
    },
    [persist],
  );

  const patch = useCallback(
    async (id: string, p: Partial<Booking>) => {
      await persist(stateRef.current.bookings.map((b) => (b.id === id ? { ...b, ...p } : b)));
    },
    [persist],
  );

  const cancel = useCallback((id: string) => patch(id, { status: "cancelled" }), [patch]);
  const dropout = useCallback((id: string) => patch(id, { status: "dropped" }), [patch]);
  const markAttendance = useCallback((id: string) => patch(id, { status: "attended" }), [patch]);
  const setReminder = useCallback((id: string, minutes: number | null) => patch(id, { reminderMin: minutes }), [patch]);
  const invite = useCallback(
    async (id: string, buddyId: string) => {
      const b = stateRef.current.bookings.find((x) => x.id === id);
      if (!b || b.buddies.includes(buddyId)) return;
      await patch(id, { buddies: [...b.buddies, buddyId] });
    },
    [patch],
  );

  const value = useMemo<Ctx>(() => {
    const t = today();
    const bookings = state.bookings;
    const live = bookings.filter((b) => b.status !== "cancelled" && b.status !== "dropped");
    const upcoming = live.filter((b) => b.status === "confirmed" && (b.date > t || (b.date === t))).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    const past = live.filter((b) => b.status === "attended").sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
    const attendedDates = new Set(past.map((b) => b.date));
    const checkinDates = new Set(member?.checkins ?? []);
    const allDates = new Set([...attendedDates, ...checkinDates]);
    const workoutsTotal = past.length + [...checkinDates].filter((d) => !attendedDates.has(d)).length;
    // weeks active = consecutive weeks (ending this or last week) with a session
    const weeks = new Set([...allDates].map(weekStartOf));
    let weeksActive = 0;
    let cursor = weekStartOf(t);
    if (!weeks.has(cursor)) cursor = addDays(cursor, -7);
    while (weeks.has(cursor)) {
      weeksActive += 1;
      cursor = addDays(cursor, -7);
    }
    const ws = weekStartOf(t);
    const doneThisWeek = past.filter((b) => b.date >= ws && b.date <= addDays(ws, 6)).length;
    const attendedIn = (from: string, to: string) => past.filter((b) => b.date >= from && b.date <= to);
    const musclesFor = (weekStart: string) => {
      const set = new Set<MuscleGroup>();
      for (const b of attendedIn(weekStart, addDays(weekStart, 6))) {
        const w = workoutFor(b.classId, new Date(b.date + "T12:00:00").getDay());
        (w.id === b.workoutId ? w : w).muscles.forEach((m) => set.add(m));
      }
      return [...set];
    };
    const memories: Memory[] = past.slice(0, 24).map((b, i) => ({ id: `m-${b.id}`, bookingId: b.id, date: b.date, time: b.time, classId: b.classId, photo: ["gym-floor", "strength", "crossfit", "hiit", "combat", "gym-weights"][i % 6] }));
    return {
      bookings,
      upcoming,
      past,
      byId: (id) => bookings.find((b) => b.id === id),
      isBooked: (classId, date, time) => live.find((b) => b.classId === classId && b.date === date && b.time === time),
      book,
      cancel,
      dropout,
      markAttendance,
      setReminder,
      invite,
      workoutsTotal,
      weeksActive,
      thisWeek: { done: doneThisWeek, target: 3 },
      musclesFor,
      attendedIn,
      memories,
      seeded,
    };
  }, [state, member?.checkins, book, cancel, dropout, markAttendance, setReminder, invite, seeded]);

  return <BookingsCtx.Provider value={value}>{children}</BookingsCtx.Provider>;
}

export function useBookings() {
  const ctx = useContext(BookingsCtx);
  if (!ctx) throw new Error("useBookings outside BookingsProvider");
  return ctx;
}

export const className = (id: string) => classes.find((c) => c.id === id)?.name ?? "Workout";
