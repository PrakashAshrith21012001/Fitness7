"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * The hero's media plane.
 *
 * Two modes, picked at runtime:
 *
 *  • sequence — a scroll-scrubbed walkthrough of the floor, drawn to <canvas>
 *    from a JPEG frame sequence. Deliberately NOT a <video> scrubbed through
 *    currentTime: iOS Safari will not seek a video smoothly under scroll, so
 *    that technique looks perfect on a desktop and dies on most real traffic.
 *    Drop frames at public/hero/frames/0001.jpg… and a manifest.json holding
 *    {"count": n} and this switches itself on.
 *
 *  • still — the gym's own wide floor photo with a slow scroll-driven push.
 *    This is what runs until the frames exist, and what low-end devices and
 *    reduced-motion visitors always get.
 */

const FRAME_DIR = "/hero/frames";
/** First frame of the walkthrough, so still and sequence are the same shot */
const STILL = "/hero/poster.jpg";
const STILL_BLUR = "/hero/poster-blur.jpg";

type Mode = "still" | "sequence";

export function HeroMedia({ sectionRef }: { sectionRef: React.RefObject<HTMLElement | null> }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const still = useRef<HTMLImageElement>(null);
  const [mode, setMode] = useState<Mode>("still");
  const [ready, setReady] = useState(false);
  const frames = useRef<HTMLImageElement[]>([]);
  const frameState = useRef({ i: 0 });

  // Look for a frame sequence. Absent (the normal case today) we stay on the still.
  useEffect(() => {
    const lowPower =
      (navigator as Navigator & { deviceMemory?: number }).deviceMemory !== undefined &&
      ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8) < 2;
    const saveData =
      (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (lowPower || saveData || reduced) return;

    let cancelled = false;
    fetch(`${FRAME_DIR}/manifest.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((m: { count?: number } | null) => {
        if (cancelled || !m?.count) return;
        const imgs: HTMLImageElement[] = [];
        let loaded = 0;
        for (let i = 1; i <= m.count; i++) {
          const img = new Image();
          img.src = `${FRAME_DIR}/${String(i).padStart(4, "0")}.jpg`;
          img.onload = () => {
            loaded++;
            // Start drawing once enough is buffered to scrub without gaps
            if (loaded === Math.min(24, m.count!) && !cancelled) {
              frames.current = imgs;
              setMode("sequence");
              setReady(true);
            }
          };
          imgs.push(img);
        }
      })
      .catch(() => {
        /* no sequence yet — the still is the design, not a fallback */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  /** cover-fit a frame into the canvas by hand; object-fit does not apply here */
  const draw = (img: HTMLImageElement) => {
    const c = canvas.current;
    if (!c || !img.complete || !img.naturalWidth) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = c.clientWidth * dpr;
    const h = c.clientHeight * dpr;
    if (c.width !== w || c.height !== h) {
      c.width = w;
      c.height = h;
    }
    const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
  };

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // One timeline drives everything. Per-element ScrollTriggers on a
        // pinned hero are the usual cause of drift between layers.
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom top",
            // A touch of lag is what separates expensive from twitchy.
            scrub: 1,
          },
        });

        if (mode === "sequence" && frames.current.length) {
          const last = frames.current.length - 1;
          tl.to(
            frameState.current,
            {
              i: last,
              ease: "none",
              onUpdate: () => {
                const f = frames.current[Math.round(frameState.current.i)];
                if (f) draw(f);
              },
            },
            0,
          );
        } else if (still.current) {
          // Slow push and drift on the photograph — the camera move we do not
          // have footage for yet.
          tl.fromTo(
            still.current,
            { scale: 1.06, yPercent: -1.5 },
            { scale: 1.16, yPercent: 3, ease: "none" },
            0,
          );
        }
      });

      return () => mm.revert();
    },
    { dependencies: [mode, ready], scope: sectionRef },
  );

  // First paint of the sequence, and redraw on resize
  useEffect(() => {
    if (mode !== "sequence") return;
    const first = frames.current[0];
    if (first) draw(first);
    const onResize = () => {
      const f = frames.current[Math.round(frameState.current.i)];
      if (f) draw(f);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [mode]);

  return (
    <div className="hero-media absolute inset-0 overflow-hidden transition-opacity duration-500" aria-hidden="true">
      {/* Tiny blurred placeholder paints instantly and holds the box */}
      <div
        className="absolute inset-0 scale-110 bg-cover bg-center blur-2xl"
        style={{ backgroundImage: `url(${STILL_BLUR})` }}
      />

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={still}
        src={STILL}
        alt=""
        width={1152}
        height={648}
        fetchPriority="high"
        decoding="async"
        className={`absolute inset-0 size-full object-cover object-center transition-opacity duration-700 ${
          mode === "sequence" && ready ? "opacity-0" : "opacity-100"
        }`}
      />

      <canvas
        ref={canvas}
        className={`absolute inset-0 size-full transition-opacity duration-700 ${
          mode === "sequence" && ready ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
