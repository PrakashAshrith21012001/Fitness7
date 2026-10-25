"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Star } from "lucide-react";
import { brand, heroSlides, reviews } from "@f7/content";
import { photo, routeToAnchor } from "@/lib/photos";
import { Photo, Wrap } from "@/components/app/ui";

/**
 * The app's Home hero. Phones get the same full-bleed photo carousel with
 * dots (swipe, or it advances every 6 s). Desktop shows all three slides
 * side by side under the headline — one photo per card keeps them sharp.
 * Always on the dark band: the photos are dark, so the nav reads white.
 */
export function HeroCarousel() {
  const rail = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback((i: number) => {
    const el = rail.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    const onScroll = () => setIndex(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)));
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => {
      const el = rail.current;
      if (!el || el.clientWidth === 0 || el.offsetParent === null) return;
      go((Math.round(el.scrollLeft / el.clientWidth) + 1) % heroSlides.length);
    }, 6000);
    return () => window.clearInterval(t);
  }, [paused, go]);

  return (
    <section id="top" data-tone="dark" aria-label="Highlights" className="relative bg-deep text-white">
      {/* ---------- phones: full-bleed carousel ---------- */}
      <div className="relative lg:hidden">
        <div
          ref={rail}
          className="snap-row flex overflow-x-auto"
          onPointerDown={() => setPaused(true)}
          onTouchStart={() => setPaused(true)}
          aria-roledescription="carousel"
        >
          {heroSlides.map((s, i) => (
            <div
              key={s.id}
              className="relative h-[min(600px,86svh)] min-h-[480px] w-full shrink-0"
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${heroSlides.length}`}
            >
              <Photo src={photo(s.photo)} alt="" sizes="100vw" priority={i === 0} />
              <div
                aria-hidden
                className="absolute inset-0"
                style={{ background: "linear-gradient(180deg, rgba(9,12,28,0.6) 0%, rgba(9,12,28,0) 25%, rgba(9,12,28,0.2) 60%, #090c1c 100%)" }}
              />
              <div className="absolute inset-x-6 bottom-14 flex flex-col items-center text-center">
                <p className="text-[26px] font-extrabold leading-[1.18] tracking-[-0.015em]">{s.title}</p>
                <a href={routeToAnchor(s.route)} className="btn-glass mt-5 inline-flex h-9 items-center px-4">
                  {s.cta}
                </a>
              </div>
            </div>
          ))}
        </div>
        <div className="absolute inset-x-0 bottom-6 flex justify-center gap-1.5">
          {heroSlides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setPaused(true);
                go(i);
              }}
              aria-label={`Show slide ${i + 1}`}
              aria-current={i === index}
              className="grid h-6 place-items-center"
            >
              <span className={`block h-1.5 rounded-full transition-all ${i === index ? "w-5 bg-[#fff]" : "w-1.5 bg-[rgba(255,255,255,0.4)]"}`} />
            </button>
          ))}
        </div>
      </div>

      {/* ---------- desktop: headline + the three slides as cards ---------- */}
      <Wrap className="hidden pb-10 pt-28 lg:block">
        <div className="flex items-end justify-between gap-8">
          <div>
            <p className="label">{brand.fullName} · {brand.city}</p>
            <h1 className="mt-2 max-w-3xl text-5xl font-extrabold leading-[1.05] tracking-[-0.025em]">
              Train on the floor. <span className="text-pink">Climb a hill</span> every month.
            </h1>
          </div>
          <p className="flex shrink-0 items-center gap-2 pb-1 text-sm text-muted">
            <Star className="size-4 fill-gold text-gold" strokeWidth={0} />
            <span className="font-bold text-white">{reviews.rating.toFixed(1)}</span> on Google · {reviews.count} reviews
          </p>
        </div>
        <div className="mt-8 grid grid-cols-3 gap-4">
          {heroSlides.map((s, i) => (
            <a
              key={s.id}
              href={routeToAnchor(s.route)}
              className="group relative block aspect-[4/5] max-h-[560px] overflow-hidden rounded-[14px] bg-surface-2"
            >
              <Photo src={photo(s.photo)} alt="" sizes="(min-width: 1280px) 410px, 33vw" priority={i === 0} className="transition-transform duration-700 group-hover:scale-[1.03]" />
              <div
                aria-hidden
                className="absolute inset-0"
                style={{ background: "linear-gradient(180deg, rgba(9,12,28,0) 35%, rgba(9,12,28,0.35) 60%, rgba(9,12,28,0.92) 100%)" }}
              />
              <div className="absolute inset-x-6 bottom-7 flex flex-col items-center text-center">
                <p className="text-2xl font-extrabold leading-[1.2] tracking-[-0.015em]">{s.title}</p>
                <span className="btn-glass mt-5 inline-flex h-9 items-center px-4">{s.cta}</span>
              </div>
            </a>
          ))}
        </div>
      </Wrap>

      {/* phones: the page needs one h1 for search; the slides carry the voice */}
      <h1 className="sr-only lg:hidden">
        {brand.fullName} — unisex gym in {brand.city} with a hill trek every month
      </h1>
    </section>
  );
}
