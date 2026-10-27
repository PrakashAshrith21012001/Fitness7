"use client";

import { ArrowRight, Star } from "lucide-react";
import { brand, reviews, wa } from "@f7/content";
import { useOpenStatus } from "@/lib/useOpenStatus";
import { PhotoRibbon } from "@/components/site/PhotoRibbon";

/**
 * Hero: one message, one loud action, proof right under it, then the curved
 * photo strip. The live "Open now" chip is the first thing a local visitor
 * wants to know (Visibility of System Status); pink appears once — on the
 * button that matters (Von Restorff).
 */
export function Hero() {
  const status = useOpenStatus();
  return (
    <section id="top" data-tone="dark" className="relative overflow-hidden text-white" style={{ background: "linear-gradient(180deg, #090c1c 0%, #090c1c 55%, var(--page-bg) 100%)" }}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(60% 50% at 50% 0%, rgba(122,162,255,0.16) 0%, rgba(9,12,28,0) 70%)" }}
      />
      <div className="relative mx-auto flex max-w-4xl flex-col items-center px-4 pt-28 text-center sm:pt-32">
        <p className="inline-flex min-h-8 items-center gap-2 rounded-full border border-line bg-surface px-3 text-xs font-semibold text-white/85">
          <span className={`size-2 rounded-full ${status ? (status.open ? "bg-[#3ddc84]" : "bg-[#ffc857]") : "bg-[rgba(255,255,255,0.4)]"}`} />
          {status?.text ?? `${brand.city} · Unisex · Air-conditioned`}
        </p>

        <h1 className="mt-5 text-[40px] font-extrabold leading-[1.04] tracking-[-0.03em] sm:text-6xl lg:text-[68px]">
          Train on the floor.
          <br />
          <span className="text-[#ffc857]">Climb a hill</span> every month.
        </h1>

        <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
          Coached strength, HIIT, yoga and ladies-only hours from 5 AM in {brand.city} — and a guided trek every month. Your first session is free.
        </p>

        <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
          <a href={wa.trial()} target="_blank" rel="noopener noreferrer" className="btn-pink press flex h-12 w-full items-center justify-center gap-2 px-6 sm:w-auto">
            Book your free session <ArrowRight className="size-4" strokeWidth={2.4} />
          </a>
          <a href="#timetable" className="press flex h-12 w-full items-center justify-center rounded-lg border border-line bg-surface px-6 text-[13px] font-extrabold uppercase tracking-[0.06em] text-white hover:bg-surface-2 sm:w-auto">
            See this week&apos;s timetable
          </a>
        </div>

        <p className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[13px] text-muted">
          <span className="flex items-center gap-1.5">
            <span className="flex" aria-hidden>
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} className="size-3.5 fill-[#ffc857] text-[#ffc857]" strokeWidth={0} />
              ))}
            </span>
            <b className="tnum text-white">{reviews.rating.toFixed(1)}</b> from <span className="tnum">{reviews.count}</span> Google reviews
          </span>
          <span aria-hidden className="hidden sm:inline">·</span>
          <span>No joining fee</span>
        </p>
      </div>

      <div className="relative mt-10 sm:mt-14">
        <PhotoRibbon />
      </div>
    </section>
  );
}
