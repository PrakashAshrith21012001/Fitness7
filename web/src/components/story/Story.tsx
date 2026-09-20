"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useScroll, useMotionValueEvent } from "motion/react";
import { bands, altitudeAt, type BandId } from "@f7/content";
import { Scene3D } from "@/components/three/Scene3D";
import { FrameScrubber } from "./FrameScrubber";

/**
 * The climb.
 *
 * One pinned layer of terrain that falls past the viewer as they scroll, with
 * the chapters laid over it. Each chapter names the altitude band it sits in
 * (`data-band-id`); the wrapper carries the live one as `data-band`, which
 * re-maps every colour token inside it — so the page itself gets lighter as
 * you climb out of the valley and into the sun.
 */
export function Story({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [band, setBand] = useState<BandId>("valley");
  const [altitude, setAltitude] = useState(bands[0].altitude);
  const [climbed, setClimbed] = useState(0);
  const [footage, setFootage] = useState(false);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    setAltitude(altitudeAt(p));
    setClimbed(p);
  });

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const chapters = Array.from(root.querySelectorAll<HTMLElement>("[data-band-id]"));
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (hit) setBand((hit.target as HTMLElement).dataset.bandId as BandId);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.01, 0.5, 1] },
    );
    chapters.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-band={band === "valley" ? undefined : band}
      className="story-fade relative bg-ink text-white"
    >
      <div className="pointer-events-none sticky top-0 z-0 h-svh overflow-hidden">
        {/* Sky gradient behind the ranges — the part of dawn that isn't rock */}
        <div
          className="absolute inset-0 -z-10 transition-[background] duration-700"
          style={{
            background:
              "linear-gradient(to bottom, var(--p-bg) 0%, color-mix(in srgb, var(--p-green) 10%, var(--p-bg)) 60%, color-mix(in srgb, var(--p-green) 26%, var(--p-bg)) 100%)",
          }}
        />
        {/* The real ascent — Flow's drone climb, scrubbed by the scroll. The drawn
            ridgelines stay underneath as the fallback and fade once it is ready. */}
        <FrameScrubber
          dir="/story"
          progress={scrollYProgress}
          onReady={setFootage}
          priority="low"
          className="absolute inset-0 size-full"
        />
        <div
          className="story-wash absolute inset-0 transition-opacity duration-700"
          style={{ opacity: footage ? 1 : 0 }}
        />
        <div className={`size-full transition-opacity duration-700 ${footage ? "opacity-0" : "opacity-100"}`}>
          <Scene3D progress={scrollYProgress} className="size-full" />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-b from-transparent via-ink/80 to-ink lg:hidden" />
        {/* Desktop: a soft wash from the top so headlines never sit on rock */}
        <div className="absolute inset-x-0 top-0 hidden h-[78%] bg-gradient-to-b from-ink via-ink/85 to-transparent lg:block" />
      </div>

      <Altimeter altitude={altitude} progress={climbed} />

      <div className="relative z-10 -mt-[100svh]">{children}</div>
    </div>
  );
}

/**
 * Altitude readout. Pinned bottom-left, opposite the WhatsApp button, so it
 * never lands in a text column at any breakpoint.
 */
function Altimeter({ altitude, progress }: { altitude: number; progress: number }) {
  return (
    <div className="pointer-events-none sticky top-[calc(100svh-8rem)] z-20 hidden h-0 lg:block">
      <div className="flex items-end gap-3 pb-2 pl-8">
        <span
          className="relative block h-20 w-px bg-line"
          aria-hidden="true"
        >
          <span
            className="absolute inset-x-[-2px] bottom-0 block bg-green transition-[height] duration-300"
            style={{ height: `${Math.round(progress * 100)}%` }}
          />
        </span>
        <span>
          <span className="block text-[10px] font-bold uppercase tracking-[0.3em] text-muted">
            Altitude
          </span>
          <span className="display block text-3xl tabular-nums text-white">
            {altitude.toLocaleString("en-IN")}
            <span className="ml-1 text-sm text-muted">m</span>
          </span>
        </span>
      </div>
    </div>
  );
}
