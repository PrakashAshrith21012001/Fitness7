"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowRight, Star } from "lucide-react";
import { brand, reviews, wa } from "@f7/content";
import { useOpenStatus } from "@/lib/useOpenStatus";
import { prefersReducedMotion } from "@/lib/gsap";
import { HERO_PHOTOS } from "@/lib/heroPhotos";
import { Magnetic } from "@/components/home/Magnetic";

/**
 * Hero: one sentence, one primary action, proof underneath, and a photo
 * stage of real training moments — each cross-fades in with a slow push-in,
 * labelled with its programme and the muscles it works. The live
 * open/closed chip answers the first local question before it's asked.
 */
const noop = () => () => {};

export function Hero() {
  const status = useOpenStatus();
  const stage = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);
  const still = useSyncExternalStore(noop, prefersReducedMotion, () => false);
  const [idx, setIdx] = useState(0);
  const count = HERO_PHOTOS.length;

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // next photo every 7 s while the stage is on screen
  useEffect(() => {
    if (!inView || still || count < 2) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % count), 7000);
    return () => clearInterval(id);
  }, [inView, still, count]);

  const photo = HERO_PHOTOS[idx];

  return (
    <section id="top" className="relative overflow-hidden">
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

        <div className="relative">
          <div ref={stage} className="relative h-[460px] overflow-hidden rounded-[28px] bg-surface-2 shadow-[0_40px_80px_-40px_rgba(18,19,22,0.55)] ring-1 ring-line sm:h-[560px] lg:h-[min(74vh,660px)]">
            {HERO_PHOTOS.map((p, i) => (
              <div key={p.src} className={`absolute inset-0 transition-opacity duration-[1200ms] ease-out ${i === idx ? "opacity-100" : "opacity-0"}`} aria-hidden={i !== idx}>
                <Image
                  src={p.src}
                  alt={p.alt}
                  fill
                  priority={i === 0}
                  sizes="(min-width: 1024px) 46vw, 100vw"
                  placeholder="blur"
                  blurDataURL={p.blur}
                  className={`object-cover ${i === idx && !still ? "animate-[kenburns_9s_ease-out_forwards]" : ""}`}
                  style={{ objectPosition: p.focus }}
                />
              </div>
            ))}
            {/* label strip */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-5 pb-5 pt-20 text-[#ffffff] sm:px-6 sm:pb-6">
              <div key={idx} className="animate-[fade_.6s_ease]">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#ffffff]/75">{photo.programme}</p>
                <p className="mt-1 text-xl font-extrabold tracking-[-0.02em] sm:text-2xl">{photo.move}</p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {photo.works.map((w) => (
                    <span key={w} className="rounded-full bg-[#ffffff]/15 px-2.5 py-1 text-[11px] font-semibold backdrop-blur-sm ring-1 ring-[#ffffff]/25">
                      {w}
                    </span>
                  ))}
                </div>
              </div>
              {count > 1 ? (
                <div className="absolute bottom-6 right-5 flex gap-1.5 sm:right-6" aria-hidden>
                  {HERO_PHOTOS.map((p, i) => (
                    <span key={p.src} className={`h-1 rounded-full transition-all duration-500 ${i === idx ? "w-6 bg-brand" : "w-2 bg-[#ffffff]/40"}`} />
                  ))}
                </div>
              ) : null}
            </div>
          </div>
          {/* floating facts */}
          <div data-speed="1.08" className="pointer-events-none absolute -left-7 top-[9%] hidden lg:block">
            <div className="glass rounded-2xl border border-line px-4 py-3 shadow-[0_20px_40px_-24px_rgba(18,19,22,0.35)]">
              <p className="cond tnum text-3xl leading-none text-fg">5 AM</p>
              <p className="mt-1 text-xs text-muted">first class, six days a week</p>
            </div>
          </div>
          <div data-speed="0.92" className="pointer-events-none absolute -right-5 top-[5%] hidden lg:block">
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
