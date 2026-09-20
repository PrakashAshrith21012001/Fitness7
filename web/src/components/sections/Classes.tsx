"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Clock } from "lucide-react";
import { classes, wa } from "@f7/content";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

const intensityStyles: Record<string, string> = {
  Low: "text-white/85 border-white/25 bg-black/35",
  Moderate: "text-amber-200 border-amber-200/40 bg-black/45",
  High: "text-red-300 border-red-300/40 bg-black/45",
  "All levels": "text-lime border-lime/40 bg-black/45",
};

/**
 * The classes rail.
 *
 * A native scroll-snap track rather than a JS slider: it drags on touch,
 * flicks on a trackpad, tabs with a keyboard and needs no library. The arrows
 * scroll by one card and disable at the ends; the bar underneath reports
 * position, so nobody has to guess how much is left.
 */
export function Classes() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const measure = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setProgress(max > 0 ? el.scrollLeft / max : 0);
    setAtStart(el.scrollLeft < 8);
    setAtEnd(el.scrollLeft > max - 8);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      el.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  const step = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const by = card ? card.offsetWidth + 20 : el.clientWidth * 0.8;
    el.scrollBy({ left: by * dir, behavior: "smooth" });
  };

  return (
    <Section id="classes">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeading
          eyebrow="What we run"
          title="Eight ways to get strong"
          body="Every class is coached — not a room with music and a timer. Pick one, or move between them as your programme changes."
        />

        <div className="hidden shrink-0 items-center gap-3 pb-2 lg:flex">
          {([
            ["Previous classes", ArrowLeft, -1 as const, atStart],
            ["More classes", ArrowRight, 1 as const, atEnd],
          ] as const).map(([label, Ico, dir, disabled]) => (
            <button
              key={label}
              type="button"
              onClick={() => step(dir)}
              disabled={disabled}
              aria-label={label}
              className={cn(
                "grid size-12 place-items-center rounded-full border border-line text-white transition-all duration-300",
                disabled
                  ? "cursor-not-allowed opacity-35"
                  : "hover:border-lime hover:text-lime active:scale-95",
              )}
            >
              <Ico className="size-5" strokeWidth={1.8} />
            </button>
          ))}
        </div>
      </div>

      <Reveal>
        <div
          ref={trackRef}
          className="no-scrollbar mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain pb-2"
          style={{ scrollPaddingInline: "0px" }}
        >
          {classes.map((cls) => (
            <article
              key={cls.id}
              data-card
              className="w-[80%] shrink-0 snap-start sm:w-[47%] lg:w-[31.5%] xl:w-[30%]"
            >
              <div className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface transition-colors duration-300 hover:border-lime/40">
                {/* Photograph of the floor, with the name laid over it */}
                <div className="relative aspect-[4/5] overflow-hidden bg-ink">
                  {cls.image ? (
                    <img
                      src={cls.image}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="size-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
                    />
                  ) : null}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/35" />

                  <span className="absolute left-5 top-5 grid size-11 place-items-center rounded-2xl border border-white/20 bg-black/45 text-lime backdrop-blur-sm">
                    <Icon name={cls.icon} className="size-5" />
                  </span>

                  <span
                    className={cn(
                      "absolute right-5 top-5 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] backdrop-blur-sm",
                      intensityStyles[cls.intensity],
                    )}
                  >
                    {cls.intensity}
                  </span>

                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <h3 className="text-xl font-semibold leading-tight tracking-tight text-white">
                      {cls.name}
                    </h3>
                    <p className="mt-1 text-sm text-white/75">{cls.tagline}</p>
                  </div>
                </div>

                {/* What a session is */}
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-sm leading-relaxed text-muted">{cls.description}</p>

                  <div className="mt-auto flex items-end justify-between gap-4 border-t border-line pt-5 [margin-top:1.5rem]">
                    <div>
                      <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-lime">
                        <Clock className="size-3.5" strokeWidth={2} />
                        {cls.durationMin} min
                      </span>
                      <span className="mt-1.5 block text-xs leading-relaxed text-muted">
                        {cls.schedule}
                      </span>
                    </div>

                    <a
                      href={wa.class(cls.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Ask about ${cls.name} on WhatsApp`}
                      className="grid size-11 shrink-0 place-items-center rounded-full border border-line text-white/70 transition-colors hover:border-lime hover:bg-green/10 hover:text-lime"
                    >
                      <ArrowUpRight className="size-4" strokeWidth={2} />
                    </a>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Reveal>

      {/* How far along the rail you are */}
      <div className="mt-8 flex items-center gap-5">
        <div className="h-px flex-1 bg-line">
          <div
            className="h-px bg-green transition-[width,transform] duration-200"
            style={{ width: `${Math.max(12, 100 / Math.max(classes.length - 2, 1))}%`, transform: `translateX(${progress * (100 * Math.max(classes.length - 2, 1) - 100)}%)` }}
          />
        </div>
        <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.22em] text-muted">
          Swipe
        </span>
      </div>
    </Section>
  );
}
