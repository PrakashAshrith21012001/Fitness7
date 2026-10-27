"use client";

import { useSyncExternalStore } from "react";
import { openStatus } from "@/lib/hours";

/**
 * Live "Open now · closes 12 PM" for the visitor, refreshed every minute.
 * Server render returns null (the page is cached), so callers show a neutral
 * fallback until the browser fills it in — no hydration mismatch.
 */
const subscribe = (cb: () => void) => {
  const t = window.setInterval(cb, 60_000);
  return () => window.clearInterval(t);
};

export function useOpenStatus() {
  const text = useSyncExternalStore(subscribe, () => openStatus().text, () => null);
  const index = useSyncExternalStore(subscribe, () => openStatus().todayIndex, () => null);
  return text === null ? null : { text, open: text.startsWith("Open"), todayIndex: index ?? 0 };
}
