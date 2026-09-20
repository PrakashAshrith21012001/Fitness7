"use client";

import { useEffect, useState } from "react";
import { ArrowDown, Mountain } from "lucide-react";
import { nextTrek, longDate, daysUntil, inr } from "@f7/content";
import { Reveal, RevealWords } from "@/components/ui/Reveal";

function Countdown({ iso }: { iso: string }) {
  const [days, setDays] = useState<number | null>(null);
  useEffect(() => {
    setDays(daysUntil(iso));
    const id = setInterval(() => setDays(daysUntil(iso)), 60_000);
    return () => clearInterval(id);
  }, [iso]);
  return (
    <span className="display text-[clamp(5rem,18vw,14rem)] leading-none">
      {days ?? "—"}
    </span>
  );
}

/** The accent-canvas chapter: the whole screen turns the brand colour. */
export function TrekChapter() {
  const trek = nextTrek();
  if (!trek) return null;

  return (
    <section
      data-chapter-phase="accent"
      className="relative flex min-h-svh items-end pb-24 pt-[34svh] lg:items-center lg:py-0"
    >
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <Reveal>
              <div className="flex items-center gap-4">
                <span className="display text-5xl sm:text-6xl">03</span>
                <span className="h-px w-12 bg-line" />
                <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/70">
                  One expedition, every month
                </span>
              </div>
            </Reveal>

            <h2 className="display mt-6 text-[clamp(2.8rem,8vw,6.5rem)]">
              <RevealWords text="The training has" />
              <br />
              <span className="display-outline">
                <RevealWords text="somewhere to go." delay={0.15} />
              </span>
            </h2>

            <Reveal delay={0.2}>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-white/75 sm:text-lg">
                Third weekend of the month we take the floor into the hills.
                Members get first slots and a lower rate; first-timers get a
                lead who has walked it before.
              </p>
            </Reveal>

            <Reveal delay={0.3}>
              <a
                href="#trek"
                className="group mt-9 inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-semibold text-ink transition-transform duration-300 hover:scale-[1.02]"
              >
                See the calendar
                <ArrowDown className="size-4 transition-transform duration-300 group-hover:translate-y-0.5" strokeWidth={2.4} />
              </a>
            </Reveal>
          </div>

          <Reveal delay={0.15}>
            <div className="rounded-3xl border border-line bg-surface/40 p-7 backdrop-blur sm:p-9">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/70">
                Next expedition
              </p>
              <Countdown iso={trek.date} />
              <p className="-mt-2 text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
                days out
              </p>
              <div className="mt-6 flex items-start gap-3 border-t border-line pt-6">
                <Mountain className="mt-0.5 size-5 shrink-0" strokeWidth={2} />
                <div>
                  <p className="display text-2xl">{trek.title}</p>
                  <p className="mt-1 text-sm text-white/75">
                    {longDate(trek.date)} · {trek.location}
                  </p>
                  <p className="mt-1 text-sm text-white/75">
                    {inr(trek.memberPriceINR)} members · {trek.slotsLeft} slots left
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
