"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion, useGSAP } from "@/lib/gsap";

/**
 * An ink band of what happens on the floor. It drifts on its own and speeds
 * up — and flips direction — with your scroll (Law of Common Fate: the words
 * move together, so they read as one list).
 */
const WORDS = ["Strength", "HIIT", "Functional", "Yoga & mobility", "Ladies-only hours", "Boxing", "Personal training", "Monthly treks"];

export function Marquee() {
  const track = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const el = track.current;
    if (!el || prefersReducedMotion()) return;
    const loop = gsap.to(el, { xPercent: -50, ease: "none", duration: 38, repeat: -1 });
    let dir = 1;
    const st = ScrollTrigger.create({
      onUpdate: (self) => {
        const v = self.getVelocity();
        if (Math.abs(v) > 10) dir = v > 0 ? 1 : -1;
        const boost = gsap.utils.clamp(1, 6, 1 + Math.abs(v) / 400);
        gsap.to(loop, { timeScale: dir * boost, duration: 0.2, overwrite: true });
        gsap.to(loop, { timeScale: dir, duration: 1.2, delay: 0.2, overwrite: false });
      },
    });
    return () => {
      st.kill();
      loop.kill();
    };
  });

  const row = (
    <div className="flex shrink-0 items-center">
      {WORDS.map((w) => (
        <span key={w} className="flex items-center">
          <span className="cond whitespace-nowrap px-6 text-[44px] leading-none sm:text-[72px]">{w}</span>
          <span aria-hidden className="size-3 rotate-45 bg-brand sm:size-4" />
        </span>
      ))}
    </div>
  );

  return (
    <section aria-label="What we train" className="relative overflow-hidden bg-fg py-6 text-paper sm:py-8">
      <div ref={track} className="flex w-max will-change-transform">
        {row}
        <div aria-hidden className="flex">{row}</div>
      </div>
    </section>
  );
}
