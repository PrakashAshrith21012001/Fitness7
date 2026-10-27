"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollSmoother, ScrollTrigger, SplitText, prefersReducedMotion, scrollToTarget, useGSAP } from "@/lib/gsap";

/**
 * Buttery scrolling with GSAP ScrollSmoother (desktop and touch-light on
 * phones), plus `data-speed` parallax. In-page links (#treks) glide there
 * instead of jumping. Off entirely for reduced-motion visitors — the page is
 * then a normal page. Fixed UI (nav, bottom bar, chat) lives outside this.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const wrapper = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    (window as unknown as { __f7motion?: boolean }).__f7motion = true;
    if (prefersReducedMotion()) return;
    const smoother = ScrollSmoother.create({
      wrapper: wrapper.current!,
      content: content.current!,
      smooth: 1.1,
      smoothTouch: 0.08,
      effects: true,
      normalizeScroll: false,
    });

    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a[href*='#']") as HTMLAnchorElement | null;
      if (!a) return;
      const url = new URL(a.href, location.href);
      if (url.pathname !== location.pathname || !url.hash) return;
      const el = document.querySelector(url.hash);
      if (!el && url.hash !== "#top") return;
      e.preventDefault();
      scrollToTarget(url.hash === "#top" ? 0 : url.hash);
      history.replaceState(null, "", url.hash);
    };
    document.addEventListener("click", onClick);
    setupReveals();
    // Fonts change line breaks; re-measure once they're in.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => {
      document.removeEventListener("click", onClick);
      smoother.kill();
    };
  });

  return (
    <div id="smooth-wrapper" ref={wrapper}>
      <div id="smooth-content" ref={content}>
        {children}
      </div>
    </div>
  );
}

/**
 * Declarative entrances, so sections stay plain markup:
 *   data-reveal="lines"    headline rises line by line from behind a mask
 *   data-reveal="up"       fades up once
 *   data-reveal="stagger"  its children fade up one after another
 *   data-count="1200"      number counts up (data-decimals, data-suffix optional)
 */
function setupReveals() {
  const lines = gsap.utils.toArray<HTMLElement>('[data-reveal="lines"]');
  lines.forEach((el) => {
    SplitText.create(el, {
      type: "lines",
      mask: "lines",
      autoSplit: true,
      onSplit(self) {
        gsap.set(el, { visibility: "visible" });
        return gsap.from(self.lines, {
          yPercent: 110,
          duration: 1.1,
          stagger: 0.09,
          ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      },
    });
  });

  gsap.utils.toArray<HTMLElement>('[data-reveal="up"]').forEach((el) => {
    gsap.fromTo(el, { opacity: 0, y: 36 }, { opacity: 1, y: 0, duration: 1.1, scrollTrigger: { trigger: el, start: "top 90%", once: true } });
  });

  gsap.utils.toArray<HTMLElement>('[data-reveal="stagger"]').forEach((el) => {
    gsap.set(el, { opacity: 1 });
    gsap.fromTo(el.children, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.08, scrollTrigger: { trigger: el, start: "top 88%", once: true } });
  });

  gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
    const to = Number(el.dataset.count);
    const decimals = Number(el.dataset.decimals ?? 0);
    const suffix = el.dataset.suffix ?? "";
    const obj = { v: 0 };
    el.textContent = (0).toFixed(decimals) + suffix;
    gsap.to(obj, {
      v: to,
      duration: 1.8,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 90%", once: true },
      onUpdate: () => {
        el.textContent = obj.v.toFixed(decimals) + suffix;
      },
    });
  });

  ScrollTrigger.refresh();
}
