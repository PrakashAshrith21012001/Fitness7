"use client";

import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";

/**
 * One small status toast for the whole page (Visibility of System Status).
 * Anything can call `toast("Opening WhatsApp…")`; it shows for ~2.5 s,
 * is announced to screen readers, and never blocks the page.
 */
export function toast(message: string) {
  window.dispatchEvent(new CustomEvent("f7-toast", { detail: message }));
}

export function Toaster() {
  const [msg, setMsg] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => {
    const on = (e: Event) => {
      setMsg((e as CustomEvent<string>).detail);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setMsg(null), 2600);
    };
    window.addEventListener("f7-toast", on);
    return () => window.removeEventListener("f7-toast", on);
  }, []);
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-[96px] z-[70] flex justify-center px-4 sm:bottom-8">
      <div
        className={`flex max-w-[92vw] items-center gap-2 rounded-full border border-line bg-solid px-4 py-2.5 text-sm font-semibold text-white shadow-2xl transition-all duration-200 ${
          msg ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
      >
        <Check className="size-4 text-green" strokeWidth={2.6} />
        {msg ?? ""}
      </div>
    </div>
  );
}
