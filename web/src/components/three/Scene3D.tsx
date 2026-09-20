"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { MotionValue } from "motion/react";

const AscentScene = dynamic(() => import("./AscentScene"), { ssr: false, loading: () => null });

/**
 * Mounts the climb once it is near the viewport, and never for people who
 * asked for reduced motion or are on a very low-memory device — they get the
 * same page with a still gradient behind it.
 */
export function Scene3D({
  progress,
  className = "",
}: {
  progress: MotionValue<number>;
  className?: string;
}) {
  const holder = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    if (reduced || (mem !== undefined && mem < 2)) return;

    const el = holder.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setShow(e.isIntersecting), { rootMargin: "300px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={holder} className={className} aria-hidden="true">
      {show ? <AscentScene progress={progress} /> : null}
    </div>
  );
}
