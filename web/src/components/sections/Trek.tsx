"use client";

import { useEffect, useState } from "react";
import { Mountain, TrendingUp, Users, MapPin, ArrowUpRight } from "lucide-react";
import {
  upcomingTreks,
  nextTrek,
  trekIntro,
  inr,
  longDate,
  daysUntil,
  groupIndian,
  wa,
  type Trek as TrekType,
} from "@f7/content";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";
import { LoopVideo } from "@/components/ui/LoopVideo";

const difficultyStyles: Record<TrekType["difficulty"], string> = {
  Easy: "text-lime border-lime/30 bg-green/5",
  Moderate: "text-amber-300 border-amber-300/30 bg-amber-300/5",
  Challenging: "text-red-400 border-red-400/30 bg-red-400/5",
};

function Countdown({ iso }: { iso: string }) {
  // Rendered client-side only so the server and client can't disagree on "now".
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    setDays(daysUntil(iso));
    const id = setInterval(() => setDays(daysUntil(iso)), 60_000);
    return () => clearInterval(id);
  }, [iso]);

  if (days === null) return <span className="display text-6xl text-lime">—</span>;

  return (
    <span className="display text-6xl text-lime sm:text-7xl">
      {days}
      <span className="ml-2 text-lg text-white/50">
        {days === 1 ? "day" : "days"} out
      </span>
    </span>
  );
}

function TrekCard({ trek, featured }: { trek: TrekType; featured?: boolean }) {
  const soldOut = trek.slotsLeft === 0;
  const fillPct = Math.round(
    ((trek.slotsTotal - trek.slotsLeft) / trek.slotsTotal) * 100,
  );

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-3xl border border-line bg-surface/60 backdrop-blur transition-all duration-500 hover:border-lime/40",
        featured && "lg:col-span-2 lg:flex-row",
      )}
    >
      <div
        className={cn(
          "relative flex shrink-0 items-end overflow-hidden bg-gradient-to-br from-surface-2 to-ink p-7",
          featured ? "lg:w-[42%] lg:p-9" : "h-40",
        )}
      >
        {featured || trek.image.startsWith("http") ? (
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url(${trek.image.startsWith("http") ? trek.image : "/video/ascent-poster.jpg"})` }}
          />
        ) : null}
        <div
          className="absolute inset-0 opacity-60 transition-transform duration-700 group-hover:scale-105"
          style={{
            background:
              "linear-gradient(to top, var(--p-surface) 15%, transparent 70%), radial-gradient(120% 90% at 50% 100%, rgba(46,204,113,0.22) 0%, transparent 60%)",
          }}
        />
        <svg
          className="absolute inset-x-0 bottom-0 w-full text-lime/25"
          viewBox="0 0 400 120"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M0 120 L70 42 L110 78 L170 14 L232 82 L286 38 L340 92 L400 52 L400 120 Z" />
        </svg>
        <div className="relative">
          <span className="eyebrow">{trek.month}</span>
          <h3 className="display mt-2 text-3xl sm:text-4xl">{trek.title}</h3>
          <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-white/60">
            <MapPin className="size-3.5" strokeWidth={2} />
            {trek.location}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-7 lg:p-9">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wider",
              difficultyStyles[trek.difficulty],
            )}
          >
            {trek.difficulty}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted">
            <TrendingUp className="size-3" strokeWidth={2} />
            {trek.distanceKm} km · {groupIndian(trek.altitudeM)} m
          </span>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-white/70">{trek.summary}</p>

        {featured ? (
          <ul className="mt-5 grid gap-2 sm:grid-cols-2">
            {trek.highlights.map((h) => (
              <li key={h} className="flex items-start gap-2 text-sm text-white/60">
                <span className="mt-1.5 size-1 shrink-0 rounded-full bg-green" />
                {h}
              </li>
            ))}
          </ul>
        ) : null}

        <p className="mt-5 text-xs font-medium text-white/45">
          {longDate(trek.date)} · {trek.durationText}
        </p>

        {/* Slots */}
        <div className="mt-5">
          <div className="flex items-center justify-between text-[11px] font-medium">
            <span className="inline-flex items-center gap-1.5 text-muted">
              <Users className="size-3" strokeWidth={2} />
              {soldOut
                ? "Fully booked"
                : `${trek.slotsLeft} of ${trek.slotsTotal} slots left`}
            </span>
            <span className={soldOut ? "text-red-400" : "text-lime"}>{fillPct}% full</span>
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-line">
            <div
              className={cn("h-full rounded-full", soldOut ? "bg-red-400" : "bg-green")}
              style={{ width: `${fillPct}%` }}
            />
          </div>
        </div>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-7">
          <div>
            <p className="display text-3xl text-white">{inr(trek.memberPriceINR)}</p>
            <p className="text-[11px] text-muted">
              members · {inr(trek.priceINR)} for guests
            </p>
          </div>
          <a
            href={wa.trek(trek)}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={soldOut}
            className={cn(
              "group/btn inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300",
              soldOut
                ? "pointer-events-none border border-line text-white/30"
                : "btn-green hover:bg-white",
            )}
          >
            {soldOut ? "Fully booked" : "Book a slot"}
            {!soldOut ? (
              <ArrowUpRight
                className="size-4 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
                strokeWidth={2.4}
              />
            ) : null}
          </a>
        </div>
      </div>
    </article>
  );
}

/** `treks` comes from the server (database, or the built-in list) so the owner's posts show without a deploy. */
export function Trek({ treks }: { treks?: TrekType[] }) {
  const list = treks ? treks.filter((t) => daysUntil(t.date) >= 0 || t.date >= new Date().toISOString().slice(0, 10)).sort((a, b) => a.date.localeCompare(b.date)) : upcomingTreks();
  const next = treks ? list[0] : nextTrek();
  const rest = list.slice(1);

  return (
    <Section id="trek" className="overflow-hidden">
      {/* The climb, looping, under the calendar */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <LoopVideo
          src="/video/ascent-loop"
          poster="/video/ascent-poster.jpg"
          className="size-full object-cover opacity-[0.28]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink/70 to-ink" />
      </div>

      <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeading
          eyebrow={trekIntro.eyebrow}
          title={trekIntro.title}
          body={trekIntro.body}
        />
        {next ? (
          <Reveal delay={0.15}>
            <div className="rounded-3xl border border-lime/25 bg-green/[0.04] px-7 py-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/50">
                Next expedition
              </p>
              <Countdown iso={next.date} />
              <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-white">
                <Mountain className="size-4 text-lime" strokeWidth={2} />
                {next.title}
              </p>
            </div>
          </Reveal>
        ) : null}
      </div>

      <div className="mt-16 grid gap-6 lg:grid-cols-2">
        {next ? (
          <Reveal className="lg:col-span-2">
            <TrekCard trek={next} featured />
          </Reveal>
        ) : null}
        {rest.map((trek, i) => (
          <Reveal key={trek.id} delay={i * 0.08}>
            <TrekCard trek={trek} />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
