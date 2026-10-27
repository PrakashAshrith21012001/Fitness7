"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/**
 * Bottom sheet on phones, centred dialog on desktop.
 *  - swipe the handle down to dismiss (drag follows your finger; let go past
 *    ~100 px or flick, and it closes — otherwise it springs back)
 *  - the phone's Back button closes it instead of leaving the page
 *    (Principle of Least Astonishment / predictive back)
 *  - Esc and a tap on the backdrop close it; focus moves in and comes back.
 */
const noop = () => () => {};

export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const panel = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const pushed = useRef(false);
  const drag = useRef<{ y: number; t: number } | null>(null);
  const [dy, setDy] = useState(0);
  const [dragging, setDragging] = useState(false);
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  // Latest onClose without re-running the open/close effect on every render
  // (re-running it would push a new history entry each time).
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const close = useCallback(() => {
    if (pushed.current) {
      pushed.current = false;
      history.back(); // popstate below calls onClose
    } else onCloseRef.current();
  }, []);

  useEffect(() => {
    if (!open) return;
    lastFocus.current = document.activeElement as HTMLElement | null;
    history.pushState({ f7sheet: true }, "");
    pushed.current = true;
    const onPop = () => {
      pushed.current = false;
      onCloseRef.current();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("popstate", onPop);
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => panel.current?.focus());
    return () => {
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      lastFocus.current?.focus?.();
      // Closed some other way while our history entry is still on top: remove it.
      if (pushed.current) {
        pushed.current = false;
        history.back();
      }
    };
  }, [open, close]);

  if (!mounted || !open) return null;

  const onDown = (e: React.PointerEvent) => {
    drag.current = { y: e.clientY, t: performance.now() };
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    setDy(Math.max(0, e.clientY - drag.current.y));
  };
  const onUp = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const dist = e.clientY - drag.current.y;
    const v = dist / Math.max(1, performance.now() - drag.current.t);
    drag.current = null;
    setDragging(false);
    setDy(0);
    if (dist > 100 || v > 0.6) close();
  };

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6" role="presentation">
      <button type="button" aria-label="Close" onClick={close} className="absolute inset-0 animate-[fade_200ms_ease] bg-[rgba(5,7,18,0.6)] backdrop-blur-[2px]" />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        style={{ transform: dy ? `translateY(${dy}px)` : undefined, transition: dragging ? "none" : "transform 220ms cubic-bezier(0.2,0.8,0.2,1)" }}
        className="squircle relative flex max-h-[88svh] w-full animate-[sheet-in_260ms_cubic-bezier(0.2,0.8,0.2,1)] flex-col overflow-hidden rounded-t-[22px] border border-line bg-solid outline-none sm:max-w-xl sm:rounded-[22px]"
      >
        <div
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          className="flex touch-none cursor-grab items-center justify-between gap-3 px-4 pb-2 pt-2.5 active:cursor-grabbing"
        >
          <span className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-surface-2 sm:hidden" aria-hidden />
          <h2 className="mt-3 truncate text-lg font-extrabold text-white">{title}</h2>
          <button type="button" onClick={close} aria-label="Close" className="press mt-2 grid size-11 shrink-0 place-items-center rounded-full hover:bg-surface">
            <X className="size-5 text-white" strokeWidth={2} />
          </button>
        </div>
        <div className="overflow-y-auto overscroll-contain px-4 pb-safe sm:pb-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
