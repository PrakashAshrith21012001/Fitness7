"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowRight, Star } from "lucide-react";
import { brand, reviews, wa } from "@f7/content";
import { useOpenStatus } from "@/lib/useOpenStatus";
import { ScrollTrigger, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { heroScroll } from "@/lib/heroScroll";
import { Magnetic } from "@/components/home/Magnetic";

// three.js only loads in the browser, after the words are on screen.
const Dumbbell3D = dynamic(() => import("@/components/home/Dumbbell3D"), {
  ssr: false,
  loading: () => <div className="size-full" />,
});

/**
 * Hero: one sentence, one primary action, proof underneath, and a 3D
 * dumbbell that turns as you scroll. The live open/closed chip answers the
 * first local question before it's asked.
 */
const noop = () => () => {};

export function Hero() {
  const status = useOpenStatus();
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);
  const still = useSyncExternalStore(noop, prefersReducedMotion, () => false);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useGSAP(
    () => {
      ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          heroScroll.p = self.progress;
        },
      });
    },
    { scope: root },
  );

  return (
    <section id="top" ref={root} className="relative overflow-hidden">
      <div aria-hidden className="grid-paper pointer-events-none absolute inset-0 [mask-image:radial-gradient(70%_60%_at_70%_40%,#000_20%,transparent_75%)]" />

      <div className="relative mx-auto grid min-h-[100svh] max-w-7xl items-center gap-4 px-5 pb-10 pt-28 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:pb-16">
        <div className="relative z-10">
          <p data-reveal="up" className="inline-flex min-h-9 items-center gap-2 rounded-full border border-line bg-surface px-3.5 text-[13px] font-semibold text-fg">
            <span className="relative flex size-2">
              {status?.open ? <span className="absolute inset-0 animate-ping rounded-full bg-brand opacity-60" /> : null}
              <span className={`relative size-2 rounded-full ${status ? (status.open ? "bg-brand" : "bg-[#d39b2a]") : "bg-line"}`} />
            </span>
            {status?.text ?? `${brand.city} · Unisex · Air-conditioned`}
          </p>

          <h1 data-reveal="lines" className="h-hero mt-6 text-fg">
            The floor is just base&nbsp;camp.
          </h1>

          <p data-reveal="up" className="mt-6 max-w-lg text-[17px] leading-relaxed text-muted sm:text-lg">
            Coached strength, HIIT, yoga and ladies-only hours from 5&nbsp;AM in {brand.city} — and a guided hill trek every month.
          </p>

          <div data-reveal="up" className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Magnetic>
              <a href={wa.trial()} target="_blank" rel="noopener noreferrer" className="btn-primary h-14 w-full px-7 text-base sm:w-auto">
                Book a free session <ArrowRight className="size-4" strokeWidth={2.4} />
              </a>
            </Magnetic>
            <a href="#timetable" className="btn-secondary h-14 px-7 text-base">
              See the timetable
            </a>
          </div>

          <div data-reveal="up" className="mt-9 flex items-center gap-3 text-sm text-muted">
            <span className="flex" aria-hidden>
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} className="size-4 fill-[#e3a92b] text-[#e3a92b]" strokeWidth={0} />
              ))}
            </span>
            <span>
              <b className="tnum text-fg">{reviews.rating.toFixed(1)}</b> on Google · <span className="tnum">{reviews.count}</span> reviews<span className="hidden sm:inline"> · no joining fee</span>
            </span>
          </div>
        </div>

        <div ref={stage} className="relative h-[340px] sm:h-[460px] lg:h-[640px]" aria-hidden>
          <Dumbbell3D active={inView} still={still} />
          {/* floating facts */}
          <div data-speed="1.08" className="pointer-events-none absolute left-2 top-[12%] hidden sm:left-6 sm:block">
            <div className="glass rounded-2xl border border-line px-4 py-3 shadow-[0_20px_40px_-24px_rgba(18,19,22,0.35)]">
              <p className="cond tnum text-3xl leading-none text-fg">5 AM</p>
              <p className="mt-1 text-xs text-muted">first class, six days a week</p>
            </div>
          </div>
          <div data-speed="0.92" className="pointer-events-none absolute bottom-[14%] right-2 hidden sm:right-6 sm:block">
            <div className="glass rounded-2xl border border-line px-4 py-3 shadow-[0_20px_40px_-24px_rgba(18,19,22,0.35)]">
              <p className="cond tnum text-3xl leading-none text-fg">12 treks</p>
              <p className="mt-1 text-xs text-muted">a year, members first</p>
            </div>
          </div>
        </div>
      </div>

      {/* scroll cue */}
      <div aria-hidden className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-muted lg:flex">
        Scroll
        <span className="h-10 w-px overflow-hidden bg-line">
          <span className="block h-1/2 w-full animate-[scrollcue_1.8s_ease-in-out_infinite] bg-fg" />
        </span>
      </div>
    </section>
  );
}
