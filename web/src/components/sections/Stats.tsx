"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";
import { stats, groupIndian } from "@f7/content";

/** Counts a numeric stat up once it scrolls into view. */
function Counter({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!inView) return;
    const target = parseInt(value.replace(/\D/g, ""), 10);
    if (Number.isNaN(target)) {
      setDisplay(value);
      return;
    }
    const suffix = value.replace(/[0-9]/g, "");
    const duration = 1400;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - start) / duration));
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(groupIndian(Math.round(target * eased)) + suffix);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value]);

  return <span ref={ref}>{display}</span>;
}

export function Stats() {
  return (
    <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line bg-line lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-ink px-6 py-10 text-center sm:py-12">
            <dt className="display text-5xl text-lime sm:text-6xl">
              <Counter value={stat.value} />
            </dt>
            <dd className="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-muted">
              {stat.label}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
