"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { RevealWords, Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

const rows = [
  { word: "Strength", score: 9.1, note: "Barbell work, coached, in four-week blocks" },
  { word: "Conditioning", score: 8.6, note: "The lungs that get you up the last hour" },
  { word: "Mobility", score: 7.4, note: "The block that keeps you climbing at forty" },
  { word: "Community", score: 9.8, note: "Twenty people on a ridge at six in the morning" },
];

function Row({ word, score, note, i }: (typeof rows)[number] & { i: number }) {
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px -20% 0px" });
  const reduced = useReducedMotion();
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setN(score);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const u = Math.min(1, Math.max(0, (t - start) / 1200));
      setN(Math.round(score * (1 - Math.pow(1 - u, 3)) * 10) / 10);
      if (u < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduced, score]);

  return (
    <li ref={ref} className="grid items-end gap-2 border-t border-line py-3 sm:grid-cols-[auto_1fr_auto] sm:gap-8">
      <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted">
        0{i + 1} / {word}
      </span>

      <div className="min-w-0">
        <span
          className={cn(
            "display block text-[clamp(1.7rem,4.4vw,3.4rem)] leading-none transition-all duration-700",
            inView ? "text-white" : "display-outline",
          )}
        >
          {word}
        </span>
        <div className="mt-3 h-px w-full bg-line">
          <motion.div
            className="h-full bg-green"
            initial={{ width: 0 }}
            animate={inView ? { width: `${score * 10}%` } : { width: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          />
        </div>
        <p className="mt-2 text-xs text-white">{note}</p>
      </div>

      <span className="display text-4xl text-lime tabular-nums sm:text-5xl">
        {n.toFixed(1)}
        <span className="ml-1 text-base text-muted">/10</span>
      </span>
    </li>
  );
}

/** The "flavour meter" from the reference, for what a session actually builds. */
export function Meter() {
  return (
    <section
      data-band-id="summit"
      className="relative flex min-h-svh items-end pb-24 pt-[28svh] lg:items-start lg:pb-0 lg:pt-[13svh]"
    >
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <Reveal>
          <div className="flex items-center gap-4">
            <span className="display text-5xl sm:text-6xl">04</span>
            <span className="h-px w-12 bg-line" />
            <span className="eyebrow">What the climb is made of</span>
          </div>
        </Reveal>
        <h2 className="display mt-5 max-w-3xl text-[clamp(2rem,4.6vw,3.6rem)]">
          <RevealWords text="Four things that get you up there." />
        </h2>

        <ul className="mt-8 border-b border-line lg:ml-auto lg:max-w-4xl">
          {rows.map((r, i) => (
            <Row key={r.word} {...r} i={i} />
          ))}
        </ul>
      </div>
    </section>
  );
}
