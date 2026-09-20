"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

/** Appears once the hero is behind you; one click, back to the top. */
export function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.9);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toTop = () => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label="Back to top"
      tabIndex={show ? 0 : -1}
      className={`fixed bottom-[5.5rem] right-5 z-40 grid size-12 place-items-center rounded-full border border-line bg-surface text-white shadow-lg ring-[3px] ring-white/25 transition-all duration-300 hover:border-lime hover:text-lime sm:bottom-24 sm:right-6 ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <ArrowUp className="size-5" strokeWidth={2.2} />
    </button>
  );
}
