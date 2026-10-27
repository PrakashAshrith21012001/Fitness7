"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";
import { scrollToTarget } from "@/lib/gsap";

/**
 * Back to top, stacked above the chat button (as on FirstGrade). It appears
 * once the hero is behind you, and its ring fills as you read down the page.
 */
const R = 22;
const C = 2 * Math.PI * R;

export function BackToTop() {
  const [show, setShow] = useState(false);
  const ring = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setShow(y > window.innerHeight * 0.9);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (ring.current) ring.current.style.strokeDashoffset = String(C * (1 - (max > 0 ? Math.min(1, y / max) : 0)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => scrollToTarget(0)}
      aria-label="Back to top"
      tabIndex={show ? 0 : -1}
      className={`group fixed bottom-[152px] right-[18px] z-40 grid size-[52px] place-items-center rounded-full bg-surface text-fg shadow-[0_12px_30px_-12px_rgba(18,19,22,0.35)] ring-1 ring-line transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 sm:bottom-[92px] sm:right-[26px] ${
        show ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-3 scale-90 opacity-0"
      }`}
    >
      <svg viewBox="0 0 52 52" className="absolute inset-0 -rotate-90" aria-hidden>
        <circle ref={ring} cx="26" cy="26" r={R} fill="none" stroke="var(--p-brand)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C} />
      </svg>
      <ArrowUp className="relative size-5 transition-transform duration-300 group-hover:-translate-y-0.5" strokeWidth={2.2} />
    </button>
  );
}
