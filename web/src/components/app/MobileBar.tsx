"use client";

import { useEffect, useState } from "react";
import { wa } from "@f7/content";

/**
 * The app's sticky bottom bar (TALK TO US | EXPLORE PLANS on Transform),
 * on phones only, once the hero is behind you. The chat button sits above it.
 */
export function MobileBar() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 flex gap-3 border-t border-line bg-deep px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 transition-transform duration-300 sm:hidden ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
      aria-hidden={!show}
    >
      <a href={wa.general()} target="_blank" rel="noopener noreferrer" tabIndex={show ? 0 : -1} className="flex h-12 flex-1 items-center justify-center rounded-lg bg-surface-2 text-[13px] font-extrabold uppercase tracking-[0.06em] text-white">
        Talk to us
      </a>
      <a href={wa.trial()} target="_blank" rel="noopener noreferrer" tabIndex={show ? 0 : -1} className="btn-pink flex h-12 flex-1 items-center justify-center">
        Try for free
      </a>
    </div>
  );
}
