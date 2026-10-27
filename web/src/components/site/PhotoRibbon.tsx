"use client";

import { useEffect, useRef } from "react";
import { photo } from "@/lib/photos";
import { Photo } from "@/components/app/ui";

/**
 * The hero's curved film-strip: the gym's photos on the inside of a cylinder,
 * so the centre recedes and the edges lean in towards you (the "Identity, with
 * room to breathe" pattern from the reference video). It drifts slowly; it
 * stops on hover, when off-screen, and entirely for reduced-motion visitors.
 * Decorative — every action it hints at is a real link in the hero above.
 */

const PHOTOS = [
  "strength", "treks-hero", "yoga", "hiit", "ladies", "people-trekker", "crossfit", "gym-floor",
  "personal", "discover-treks", "combat", "transform-centre", "cardio", "people-lifter", "gym-weights", "fitedit-ladies-hour",
];

export function PhotoRibbon() {
  const stage = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let offset = 0;
    let raf = 0;
    let visible = true;
    let hover = false;
    let last = performance.now();

    const layout = () => {
      const vw = el.clientWidth;
      const small = vw < 640;
      const w = small ? 120 : 172;
      const gap = small ? 10 : 16;
      const step = w + gap;
      const total = step * PHOTOS.length;
      const R = small ? vw * 0.5 : Math.max(vw * 0.6, 520); // radius of the cylinder
      cards.current.forEach((card, i) => {
        if (!card) return;
        // arc position of this card, wrapped into [-total/2, total/2)
        let s = i * step - offset;
        s = ((s % total) + total) % total;
        if (s >= total / 2) s -= total;
        const phi = s / R; // radians around the cylinder
        const hidden = Math.abs(phi) > 1.25;
        const x = R * Math.sin(phi);
        const z = R * (1 - Math.cos(phi)); // edges come towards the viewer
        card.style.transform = `translate3d(${x - w / 2}px, 0, ${z}px) rotateY(${-phi}rad)`;
        card.style.opacity = hidden ? "0" : String(Math.min(1, 1.6 - Math.abs(phi)));
        card.style.width = `${w}px`;
      });
    };

    const tick = (t: number) => {
      const dt = Math.min(64, t - last);
      last = t;
      if (!hover && visible) offset += dt * 0.028; // ~28 px a second
      layout();
      raf = requestAnimationFrame(tick);
    };

    layout();
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);
    const onEnter = () => (hover = true);
    const onLeave = () => (hover = false);
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", layout);
    if (!reduced) raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", layout);
    };
  }, []);

  return (
    <div
      ref={stage}
      aria-hidden
      className="relative h-[210px] w-full overflow-hidden sm:h-[300px]"
      style={{ perspective: "1100px", perspectiveOrigin: "50% 40%" }}
    >
      <div className="absolute left-1/2 top-4 h-full" style={{ transformStyle: "preserve-3d" }}>
        {PHOTOS.map((p, i) => (
          <div
            key={p}
            ref={(n) => {
              cards.current[i] = n;
            }}
            className="squircle absolute left-0 top-0 aspect-[4/5] w-[120px] overflow-hidden rounded-[14px] bg-surface-2 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)] will-change-transform sm:w-[172px]"
            style={{ backfaceVisibility: "hidden" }}
          >
            <Photo src={photo(p)} alt="" sizes="180px" />
          </div>
        ))}
      </div>
      {/* fade the strip into the page below */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20" style={{ background: "linear-gradient(180deg, transparent, var(--page-bg))" }} />
    </div>
  );
}
