import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import type { ActivityLogRow, FoodLogRow, MemberRow, NotificationPrefsRow } from "@f7/content";
import { supabase } from "./supabase";

/**
 * Offline write queue.
 *
 * Every write the app makes lands in local state first, then here. `flush()`
 * replays the queue against Supabase in order, stops at the first network
 * failure and tries again with backoff, on reconnect, and on the next write.
 * Every op is an upsert / delete keyed by primary key, so a replay is safe.
 *
 * Ops that Postgres rejects outright (a constraint, a bad column) are logged
 * and dropped — retrying them would block the queue forever.
 */

export type Op =
  | { kind: "member.update"; patch: Partial<Omit<MemberRow, "id" | "created_at" | "updated_at">> }
  | { kind: "prefs.update"; prefs: Omit<NotificationPrefsRow, "member_id"> }
  | { kind: "checkin.add"; date: string }
  | { kind: "weight.upsert"; date: string; kg: number }
  | { kind: "follow.set"; classId: string; on: boolean }
  | { kind: "reserve.set"; trekId: string; on: boolean }
  | { kind: "food.add"; row: Omit<FoodLogRow, "member_id" | "logged_at" | "deleted_at"> }
  | { kind: "food.remove"; id: string }
  | { kind: "water.set"; date: string; ml: number }
  | { kind: "activity.add"; row: Omit<ActivityLogRow, "member_id" | "logged_at" | "deleted_at"> }
  | { kind: "activity.remove"; id: string };

export type QueuedOp = Op & { id: string; memberId: string; at: number; tries: number };

const KEY = "f7-outbox";
const MAX_BACKOFF_MS = 60_000;

let queue: QueuedOp[] | null = null;
let flushing = false;
let retryTimer: ReturnType<typeof setTimeout> | null = null;
let listeners: (() => void)[] = [];

async function load(): Promise<QueuedOp[]> {
  if (queue) return queue;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    queue = raw ? (JSON.parse(raw) as QueuedOp[]) : [];
  } catch {
    queue = [];
  }
  return queue;
}

async function save() {
  try {
    if (queue && queue.length) await AsyncStorage.setItem(KEY, JSON.stringify(queue));
    else await AsyncStorage.removeItem(KEY);
  } catch {
    /* storage full or unavailable — the in-memory queue still flushes this session */
  }
  listeners.forEach((l) => l());
}

export function onOutboxChange(fn: () => void) {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}

export async function pendingCount() {
  return (await load()).length;
}

/** Add a write and kick off a flush. Never throws, never blocks the caller on the network. */
export async function enqueue(memberId: string, op: Op) {
  const q = await load();
  q.push({ ...op, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, memberId, at: Date.now(), tries: 0 });
  await save();
  void flush();
}

/** Drop everything (sign-out). */
export async function clearOutbox() {
  queue = [];
  if (retryTimer) clearTimeout(retryTimer);
  retryTimer = null;
  await save();
}

/** Errors Postgres/PostgREST return deterministically — retrying will not help. */
function isPermanent(err: { code?: string; message?: string } | null): boolean {
  if (!err) return false;
  const code = err.code ?? "";
  if (/^PGRST3/.test(code)) return false; // auth / JWT — retry after refresh
  if (/^\d{5}$/.test(code)) return true; // SQLSTATE (23505 unique, 23514 check, 42501 rls…)
  if (/^PGRST/.test(code)) return true; // other PostgREST errors (bad column etc.)
  return false; // network / unknown → retry
}

async function apply(op: QueuedOp): Promise<{ error: { code?: string; message?: string } | null }> {
  const c = supabase();
  if (!c) return { error: null }; // local mode: nothing to sync, treat as done
  const m = op.memberId;
  switch (op.kind) {
    case "member.update":
      return c.from("members").update(op.patch).eq("id", m);
    case "prefs.update":
      return c.from("notification_prefs").upsert({ member_id: m, ...op.prefs });
    case "checkin.add":
      return c.from("checkins").upsert({ member_id: m, date: op.date }, { onConflict: "member_id,date", ignoreDuplicates: true });
    case "weight.upsert":
      return c.from("weights").upsert({ member_id: m, date: op.date, kg: op.kg }, { onConflict: "member_id,date" });
    case "follow.set":
      return op.on
        ? c.from("class_follows").upsert({ member_id: m, class_id: op.classId }, { onConflict: "member_id,class_id", ignoreDuplicates: true })
        : c.from("class_follows").delete().eq("member_id", m).eq("class_id", op.classId);
    case "reserve.set":
      return op.on
        ? c.from("trek_reservations").upsert({ member_id: m, trek_id: op.trekId, status: "held" }, { onConflict: "member_id,trek_id", ignoreDuplicates: true })
        : c.from("trek_reservations").delete().eq("member_id", m).eq("trek_id", op.trekId);
    case "food.add":
      return c.from("food_logs").upsert({ ...op.row, member_id: m }, { onConflict: "id", ignoreDuplicates: true });
    case "food.remove":
      return c.from("food_logs").update({ deleted_at: new Date().toISOString() }).eq("id", op.id).eq("member_id", m);
    case "water.set":
      return c.from("water_logs").upsert({ member_id: m, date: op.date, ml: op.ml, updated_at: new Date().toISOString() }, { onConflict: "member_id,date" });
    case "activity.add":
      return c.from("activity_logs").upsert({ ...op.row, member_id: m }, { onConflict: "id", ignoreDuplicates: true });
    case "activity.remove":
      return c.from("activity_logs").update({ deleted_at: new Date().toISOString() }).eq("id", op.id).eq("member_id", m);
  }
}

/**
 * Replay the queue in order. Stops at the first transient failure and
 * schedules a retry. Safe to call as often as you like.
 */
export async function flush(): Promise<void> {
  if (flushing) return;
  flushing = true;
  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }
  try {
    const q = await load();
    while (q.length) {
      const op = q[0];
      let error: { code?: string; message?: string } | null;
      try {
        ({ error } = await apply(op));
      } catch (e) {
        error = { message: String(e) };
      }
      if (!error) {
        q.shift();
        await save();
        continue;
      }
      if (isPermanent(error)) {
        console.warn("outbox: dropping", op.kind, error.code, error.message);
        q.shift();
        await save();
        continue;
      }
      // transient: back off and try again
      op.tries += 1;
      await save();
      const wait = Math.min(MAX_BACKOFF_MS, 2000 * 2 ** Math.min(op.tries - 1, 5));
      retryTimer = setTimeout(() => void flush(), wait);
      break;
    }
  } finally {
    flushing = false;
  }
}

let wired = false;
/** Flush when the network comes back. Call once at app start. */
export function wireOutbox() {
  if (wired) return;
  wired = true;
  NetInfo.addEventListener((state) => {
    if (state.isConnected && state.isInternetReachable !== false) void flush();
  });
  void flush();
}
