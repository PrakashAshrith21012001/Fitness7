"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionValueEvent, type MotionValue } from "motion/react";

/**
 * A JPEG frame sequence drawn to <canvas>, scrubbed by a scroll progress value.
 * Same reasoning as the hero: a <video> seeked through currentTime will not
 * scrub smoothly on iOS Safari, so real footage under scroll is frames, not video.
 *
 * Reports `onReady` once enough is buffered to draw, so the caller can fade out
 * whatever was standing in for it.
 */
export function FrameScrubber({
  dir,
  progress,
  onReady,
  className = "",
  priority = "high",
}: {
  dir: string;
  progress: MotionValue<number>;
  onReady?: (ready: boolean) => void;
  className?: string;
  /** "low" waits for an idle moment and yields bandwidth to the hero first */
  priority?: "high" | "low";
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const frames = useRef<HTMLImageElement[]>([]);
  const [ready, setReady] = useState(false);
  const last = useRef(-1);

  const draw = (i: number) => {
    const c = canvas.current;
    const img = frames.current[i];
    if (!c || !img || !img.complete || !img.naturalWidth) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.round(c.clientWidth * dpr);
    const h = Math.round(c.clientHeight * dpr);
    if (c.width !== w || c.height !== h) {
      c.width = w;
      c.height = h;
    }
    const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
    last.current = i;
  };

  useEffect(() => {
    const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      nav.connection?.saveData ||
      (nav.deviceMemory !== undefined && nav.deviceMemory < 2)
    )
      return;

    let cancelled = false;
    const start = () => fetch(`${dir}/manifest.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((m: { count?: number } | null) => {
        if (cancelled || !m?.count) return;
        const imgs: HTMLImageElement[] = [];
        let loaded = 0;
        for (let i = 1; i <= m.count; i++) {
          const img = new Image();
          img.decoding = "async";
          (img as HTMLImageElement & { fetchPriority?: string }).fetchPriority = priority;
          img.src = `${dir}/frames/${String(i).padStart(4, "0")}.jpg`;
          img.onload = () => {
            loaded++;
            if (loaded === Math.min(16, m.count!) && !cancelled) {
              frames.current = imgs;
              setReady(true);
              onReady?.(true);
              draw(Math.round(progress.get() * (imgs.length - 1)));
            }
          };
          imgs.push(img);
        }
      })
      .catch(() => {});

    let idle = 0;
    if (priority === "low" && "requestIdleCallback" in window) {
      idle = (window as Window & { requestIdleCallback: (cb: () => void, o?: { timeout: number }) => number })
        .requestIdleCallback(start, { timeout: 4000 });
    } else if (priority === "low") {
      idle = window.setTimeout(start, 2500);
    } else {
      start();
    }
    return () => {
      cancelled = true;
      if (idle) {
        if ("cancelIdleCallback" in window) (window as Window & { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(idle);
        clearTimeout(idle);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dir, priority]);

  useMotionValueEvent(progress, "change", (p) => {
    const n = frames.current.length;
    if (!n) return;
    const i = Math.round(Math.min(1, Math.max(0, p)) * (n - 1));
    if (i !== last.current) draw(i);
  });

  useEffect(() => {
    if (!ready) return;
    const onResize = () => draw(Math.max(0, last.current));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  return (
    <canvas
      ref={canvas}
      aria-hidden="true"
      className={`${className} transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}
    />
  );
}
