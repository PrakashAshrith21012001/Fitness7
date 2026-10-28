"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowUpRight, Dumbbell, Flame, HeartPulse, Sparkles, Swords, Target, Wind, Zap, type LucideIcon } from "lucide-react";
import { classes, wa } from "@f7/content";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { athlete, EXERCISE_FOR } from "@/lib/athlete";

const Athlete3D = dynamic(() => import("@/components/home/Athlete3D"), { ssr: false, loading: () => <div className="size-full" /> });
const noop = () => () => {};

/**
 * "What we train" — on desktop the section pins and the programmes slide
 * past sideways as you scroll down, each card swinging in on its hinge (3D)
 * as it arrives. On phones it's a swipeable row. No photos: the type and the
 * numbers carry it. A 3D athlete demonstrates each programme as its card
 * arrives — squats, jumping jacks, swings, running, yoga, lunges, a row,
 * punches — blending from one movement to the next.
 */
const ICON: Record<string, LucideIcon> = { Dumbbell, Flame, Zap, HeartPulse, Wind, Sparkles, Target, Swords };

export function Programs() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const angle = useRef<HTMLSpanElement>(null);
  const still = useSyncExternalStore(noop, prefersReducedMotion, () => false);

  const show = (i: number) => {
    const c = classes[Math.max(0, Math.min(classes.length - 1, i))];
    athlete.exercise = EXERCISE_FOR[c.id]?.id ?? "squat";
    setActive((v) => (v === i ? v : i));
  };

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: "200px" });
    io.observe(el);
    // phones: the card snapped into view picks the movement
    const row = track.current;
    const onRow = () => {
      if (!row || window.innerWidth >= 1024) return;
      const card = row.querySelector<HTMLElement>("[data-card]");
      const w = (card?.offsetWidth ?? 300) + 16;
      show(Math.round(row.scrollLeft / w));
    };
    row?.addEventListener("scroll", onRow, { passive: true });
    return () => {
      io.disconnect();
      row?.removeEventListener("scroll", onRow);
    };
  }, []);

  // live joint angle from the 3D scene, written straight to the DOM
  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    let last = -1;
    const tick = () => {
      if (angle.current && athlete.angle !== last) {
        last = athlete.angle;
        angle.current.textContent = `${last}°`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView]);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        const el = track.current!;
        const distance = () => el.scrollWidth - el.parentElement!.clientWidth;
        const tween = gsap.to(el, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: section.current,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onUpdate: (self) => show(Math.min(classes.length - 1, Math.floor(self.progress * classes.length * 1.08))),
          },
        });
        gsap.utils.toArray<HTMLElement>("[data-card]", el).forEach((card) => {
          gsap.fromTo(
            card,
            { rotateY: -28, z: -120, opacity: 0.35, transformOrigin: "left center" },
            {
              rotateY: 0,
              z: 0,
              opacity: 1,
              ease: "none",
              scrollTrigger: { trigger: card, containerAnimation: tween, start: "left 100%", end: "left 55%", scrub: true },
            },
          );
        });
      });
      return () => mm.revert();
    },
    { scope: section },
  );

  return (
    <section ref={section} id="programs" className="relative overflow-hidden py-20 sm:py-28 lg:flex lg:h-[100svh] lg:items-center lg:py-0">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:max-w-none lg:px-0">
        <div className="lg:flex lg:items-center">
          <header className="lg:w-[38vw] lg:shrink-0 lg:pl-[max(2rem,calc((100vw-80rem)/2+2rem))] lg:pr-10">
            <p className="eyebrow">What we train</p>
            <h2 data-reveal="lines" className="h-section mt-3 text-fg">
              Eight ways to get stronger.
            </h2>
            <p className="mt-4 max-w-sm text-base leading-relaxed text-muted">
              Every session is coached. Scale it to where you are today — nobody sits out.
            </p>

            {/* the 3D athlete: an anatomy chart that moves — working muscles glow, form line shows the joint angle */}
            {(() => {
              const mv = EXERCISE_FOR[classes[active].id];
              return (
                <div className="relative mt-6 overflow-hidden rounded-[24px] bg-[radial-gradient(120%_90%_at_50%_30%,#3a3c43_0%,#24252a_55%,#18191c_100%)] text-[#f2f0ea] ring-1 ring-black/20 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)]">
                  <div className="pointer-events-none absolute left-4 top-4 z-10 flex flex-wrap gap-1.5" aria-hidden>
                    {mv?.works.split(" · ").map((w) => (
                      <span key={w} className="rounded-full bg-[#e2452b]/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#ff8a72] ring-1 ring-[#e2452b]/40">
                        {w}
                      </span>
                    ))}
                  </div>
                  <div className="pointer-events-none absolute right-4 top-4 z-10 text-right" aria-hidden>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#f2f0ea]/55">{mv?.formLabel} angle</p>
                    <p className="cond tnum text-3xl leading-none text-[#8dff4f] [text-shadow:0_0_14px_rgba(141,255,79,0.55)]">
                      <span ref={angle}>180°</span>
                    </p>
                  </div>
                  <div ref={stage} className="h-[320px] sm:h-[360px] lg:h-[min(40vh,380px)]" aria-hidden>
                    <Athlete3D active={inView} still={still} />
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t border-[#f2f0ea]/10 px-4 py-3" aria-live="polite">
                    <span className="min-w-0">
                      <span className="cond tnum mr-2 text-lg text-[#f2f0ea]/45">{String(active + 1).padStart(2, "0")}</span>
                      <span className="text-sm font-bold">{mv?.label}</span>
                    </span>
                    <span className="truncate text-xs text-[#f2f0ea]/60">{classes[active].name}</span>
                  </div>
                </div>
              );
            })()}
          </header>

          <div className="relative mt-8 lg:mt-0 lg:min-w-0 lg:flex-1 lg:[clip-path:inset(-40%_-100vw_-40%_0)]" style={{ perspective: "1400px" }}>
            <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-16 bg-gradient-to-r from-paper to-transparent lg:block" />
            <div ref={track} className="snap-row -mx-5 flex gap-4 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:px-8 lg:mx-0 lg:w-max lg:overflow-visible lg:px-0 lg:pr-[10vw]" style={{ transformStyle: "preserve-3d" }}>
              {classes.map((c, i) => {
                const Icon = ICON[c.icon] ?? Dumbbell;
                return (
                  <article
                    key={c.id}
                    data-card
                    onPointerEnter={() => show(i)}
                    className="pane group flex h-[420px] w-[78vw] max-w-[340px] shrink-0 flex-col p-6 transition-shadow duration-300 hover:shadow-[0_30px_60px_-30px_rgba(18,19,22,0.35)] sm:w-[340px] lg:h-[460px] lg:w-[360px] lg:max-w-none"
                  >
                    <div className="flex items-start justify-between">
                      <span className="cond tnum text-[64px] leading-[0.8] text-transparent [-webkit-text-stroke:1.5px_var(--p-fg)]">{String(i + 1).padStart(2, "0")}</span>
                      <span className="grid size-12 place-items-center rounded-full bg-surface-2 transition-colors duration-300 group-hover:bg-brand">
                        <Icon className="size-5 text-fg" strokeWidth={1.8} />
                      </span>
                    </div>
                    <h3 className="mt-auto text-[28px] font-extrabold leading-[1.05] tracking-[-0.03em] text-fg">{c.name}</h3>
                    <p className="mt-2 text-[15px] font-semibold text-fg/80">{c.tagline}</p>
                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">{c.description}</p>
                    <dl className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
                      <dd className="tnum rounded-full bg-surface-2 px-3 py-1.5 text-fg">{c.durationMin} min</dd>
                      <dd className="rounded-full bg-surface-2 px-3 py-1.5 text-fg">{c.intensity}</dd>
                    </dl>
                  </article>
                );
              })}
              <a
                data-card
                href={wa.trial()}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-[420px] w-[78vw] max-w-[340px] shrink-0 flex-col justify-between rounded-[20px] bg-fg p-6 text-paper sm:w-[340px] lg:h-[460px] lg:w-[360px] lg:max-w-none"
              >
                <ArrowUpRight className="size-10 transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1" strokeWidth={1.6} />
                <span>
                  <span className="block text-[30px] font-extrabold leading-[1.05] tracking-[-0.03em]">Not sure where to start?</span>
                  <span className="mt-3 block text-[15px] text-paper/70">Train one free session with a coach. We&apos;ll point you to the right class.</span>
                  <span className="mt-6 inline-flex h-12 items-center rounded-full bg-paper px-5 text-sm font-bold text-fg">Book a free session</span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
