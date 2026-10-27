"use client";

import { useState } from "react";
import { CalendarDays, Check, Clock, MapPin, Mountain, Users } from "lucide-react";
import { groupIndian, inr, longDate, shortDate, trekIntro, wa, type Trek } from "@f7/content";
import { photo, trekPhoto } from "@/lib/photos";
import { Photo, Wrap } from "@/components/app/ui";
import { SectionHeader } from "@/components/site/SectionHeader";
import { Sheet } from "@/components/site/Sheet";
import { toast } from "@/components/site/Toaster";

/**
 * Monthly treks. The next trek gets the spotlight (Serial Position: first
 * thing seen); the rest follow as equal cards (Similarity). A seats bar shows
 * how full each trek is (Goal-Gradient — the closer to full, the stronger the
 * nudge). Full details open in a sheet instead of stretching the page.
 */

const DIFF_TONE: Record<Trek["difficulty"], string> = {
  Easy: "text-[#3ddc84]",
  Moderate: "text-[#ffc857]",
  Challenging: "text-[#ff8a8a]",
};

function Seats({ trek }: { trek: Trek }) {
  const booked = trek.slotsTotal - trek.slotsLeft;
  const pct = Math.round((booked / Math.max(1, trek.slotsTotal)) * 100);
  if (booked === 0)
    return (
      <p className="flex items-center gap-1.5 text-xs text-muted">
        <span className="size-1.5 rounded-full bg-[#3ddc84]" /> Booking open · <span className="tnum font-bold text-white">{trek.slotsTotal}</span> seats
      </p>
    );
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted">
          <span className="tnum font-bold text-white">{booked}</span> of <span className="tnum">{trek.slotsTotal}</span> seats taken
        </span>
        <span className={`tnum font-bold ${trek.slotsLeft === 0 ? "text-[#ff8a8a]" : trek.slotsLeft <= 10 ? "text-[#ffc857]" : "text-muted"}`}>
          {trek.slotsLeft === 0 ? "Full" : `${trek.slotsLeft} left`}
        </span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuemin={0} aria-valuemax={trek.slotsTotal} aria-valuenow={booked} aria-label="Seats taken">
        <div className="h-full rounded-full bg-[#ffc857]" style={{ width: `${Math.max(4, pct)}%` }} />
      </div>
    </div>
  );
}

function Facts({ trek }: { trek: Trek }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-[13px] text-muted">
      <li className="flex items-center gap-1.5"><CalendarDays className="size-3.5" strokeWidth={2} />{shortDate(trek.date)}</li>
      <li className="flex items-center gap-1.5"><MapPin className="size-3.5" strokeWidth={2} />{trek.location}</li>
      <li className="tnum flex items-center gap-1.5"><Mountain className="size-3.5" strokeWidth={2} />{trek.distanceKm} km · {groupIndian(trek.altitudeM)} m</li>
      <li className={`font-semibold ${DIFF_TONE[trek.difficulty]}`}>{trek.difficulty}</li>
    </ul>
  );
}

export function Treks({ treks }: { treks: Trek[] }) {
  const [open, setOpen] = useState<Trek | null>(null);
  const [next, ...rest] = treks;
  if (!next) return null;

  const reserve = (t: Trek) => toast(`Opening WhatsApp — ${t.title}`);

  return (
    <section id="treks" className="pt-16 sm:pt-24">
      <Wrap>
        <SectionHeader kicker="Monthly treks" title={trekIntro.title} sub="One guided trek every month. Members get first seats and a lower price; first-timers get a lead who has walked it before." />

        {/* ---------- next trek (spotlight) ---------- */}
        <article className="pane grid overflow-hidden lg:grid-cols-[1.15fr_1fr]">
          <div className="relative min-h-[240px] sm:min-h-[320px]">
            <Photo src={next.image && /^https?:/.test(next.image) ? next.image : photo("treks-hero")} alt={`${next.title} — trek photo`} sizes="(min-width: 1024px) 660px, 100vw" />
            <span className="absolute left-3 top-3 rounded-md bg-[rgba(9,12,28,0.85)] px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#ffc857]">
              Next trek · {shortDate(next.date)}
            </span>
          </div>
          <div className="flex flex-col gap-4 p-5 sm:p-6">
            <div>
              <h3 className="text-2xl font-extrabold leading-tight text-white">{next.title}</h3>
              <p className="mt-1 text-sm text-muted">{next.durationText}</p>
            </div>
            <Facts trek={next} />
            <p className="text-sm leading-relaxed text-muted">{next.summary}</p>
            <Seats trek={next} />
            <div className="mt-auto flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="tnum">
                <p className="text-xs text-muted">Members</p>
                <p className="text-xl font-extrabold text-white">{inr(next.memberPriceINR)}</p>
                <p className="text-xs text-muted">Guests {inr(next.priceINR)}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setOpen(next)} className="press h-12 shrink-0 rounded-lg border border-line px-4 text-[13px] font-extrabold uppercase tracking-[0.06em] text-white hover:bg-surface">
                  Details
                </button>
                <a
                  href={wa.trek(next)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => reserve(next)}
                  className="press flex h-12 flex-1 items-center justify-center whitespace-nowrap rounded-lg bg-[#ffc857] px-5 text-[13px] font-extrabold uppercase tracking-[0.06em] text-[#1a1400] hover:brightness-105 sm:flex-none"
                >
                  {next.slotsLeft === 0 ? "Join waitlist" : "Reserve a seat"}
                </a>
              </div>
            </div>
          </div>
        </article>

        {/* ---------- later treks ---------- */}
        {rest.length ? (
          <>
            <h3 className="mb-3 mt-8 text-lg font-bold text-white">Coming up after that</h3>
            <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {rest.map((t) => (
                <li key={t.id}>
                  <button type="button" onClick={() => setOpen(t)} className="pane press group flex w-full flex-col overflow-hidden text-left hover:border-white/30">
                    <div className="relative h-36 w-full">
                      <Photo src={trekPhoto(t.image)} alt="" sizes="(min-width: 1024px) 400px, (min-width: 768px) 50vw, 100vw" />
                      <span className="absolute left-2.5 top-2.5 rounded-md bg-[rgba(9,12,28,0.85)] px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#fff]">
                        {shortDate(t.date)}
                      </span>
                    </div>
                    <div className="flex w-full flex-col gap-3 p-4">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-base font-bold text-white">{t.title}</span>
                        <span className="tnum shrink-0 text-sm font-bold text-white">{inr(t.memberPriceINR)}</span>
                      </div>
                      <Facts trek={t} />
                      <Seats trek={t} />
                      <span className="text-xs font-extrabold uppercase tracking-[0.06em] text-white/80 group-hover:text-white">See details →</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </Wrap>

      <Sheet open={!!open} onClose={() => setOpen(null)} title={open?.title ?? "Trek"}>
        {open ? (
          <div className="flex flex-col gap-4 pb-2">
            <div className="relative -mx-4 h-44">
              <Photo src={trekPhoto(open.image)} alt="" sizes="600px" />
            </div>
            <ul className="grid grid-cols-2 gap-2 text-[13px]">
              <li className="rounded-lg bg-surface p-3"><CalendarDays className="mb-1 size-4 text-muted" strokeWidth={2} /><span className="text-white">{longDate(open.date)}</span></li>
              <li className="rounded-lg bg-surface p-3"><Clock className="mb-1 size-4 text-muted" strokeWidth={2} /><span className="text-white">{open.durationText}</span></li>
              <li className="rounded-lg bg-surface p-3"><Mountain className="mb-1 size-4 text-muted" strokeWidth={2} /><span className="tnum text-white">{open.distanceKm} km · {groupIndian(open.altitudeM)} m · {open.difficulty}</span></li>
              <li className="rounded-lg bg-surface p-3"><Users className="mb-1 size-4 text-muted" strokeWidth={2} /><span className="text-white">Meet: {open.meetingPoint}</span></li>
            </ul>
            <p className="text-sm leading-relaxed text-muted">{open.summary}</p>
            <div>
              <p className="label">Highlights</p>
              <ul className="mt-2 space-y-1.5">
                {open.highlights.map((h) => (
                  <li key={h} className="flex gap-2 text-sm text-white"><Check className="mt-0.5 size-4 shrink-0 text-green" strokeWidth={2.4} />{h}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="label">Included</p>
              <p className="mt-1.5 text-sm text-muted">{open.includes.join(" · ")}</p>
            </div>
            <Seats trek={open} />
            <div className="sticky bottom-0 -mx-4 flex items-center justify-between gap-3 border-t border-line bg-solid px-4 py-3">
              <div className="tnum">
                <p className="text-lg font-extrabold text-white">{inr(open.memberPriceINR)} <span className="text-xs font-normal text-muted">members</span></p>
                <p className="text-xs text-muted">Guests {inr(open.priceINR)}</p>
              </div>
              <a
                href={wa.trek(open)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => reserve(open)}
                className="press flex h-12 items-center rounded-lg bg-[#ffc857] px-5 text-[13px] font-extrabold uppercase tracking-[0.06em] text-[#1a1400]"
              >
                {open.slotsLeft === 0 ? "Join waitlist" : "Reserve a seat"}
              </a>
            </div>
          </div>
        ) : null}
      </Sheet>
    </section>
  );
}
