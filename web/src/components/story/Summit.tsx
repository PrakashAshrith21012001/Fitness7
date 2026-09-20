"use client";

import { useEffect, useState } from "react";
import { ArrowDown, Mountain } from "lucide-react";
import { nextTrek, longDate, daysUntil, inr, bands } from "@f7/content";
import { Reveal, RevealWords } from "@/components/ui/Reveal";

function Countdown({ iso }: { iso: string }) {
  const [days, setDays] = useState<number | null>(null);
  useEffect(() => {
    setDays(daysUntil(iso));
    const id = setInterval(() => setDays(daysUntil(iso)), 60_000);
    return () => clearInterval(id);
  }, [iso]);
  return (
    <span className="display text-[clamp(5rem,17vw,13rem)] leading-none">{days ?? "—"}</span>
  );
}

/**
 * The top of the climb. The canvas is full first-light gold here, which is the
 * only place on the page that happens — so the trek, which is the thing that
 * actually separates this gym from every other one in town, is also the only
 * thing that arrives in full sun.
 */
export function Summit() {
  const trek = nextTrek();
  if (!trek) return null;
  const summit = bands[bands.length - 1];

  return (
    <section
      data-band-id="summit"
      className="relative flex min-h-svh items-end pb-24 pt-[32svh] lg:items-start lg:pb-0 lg:pt-[17svh]"
    >
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <Reveal>
              <div className="flex flex-wrap items-center gap-4">
                <span className="display text-5xl sm:text-6xl">03</span>
                <span className="h-px w-12 bg-line" />
                <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted">
                  One expedition, every month
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted">
                  {summit.altitude.toLocaleString("en-IN")} m
                </span>
              </div>
            </Reveal>

            <h2 className="display mt-6 max-w-[16ch] text-[clamp(2.4rem,5.6vw,4.6rem)]">
              <RevealWords text="You came out" />
              <br />
              <span className="display-outline">
                <RevealWords text="above the cloud." delay={0.15} />
              </span>
            </h2>

            <Reveal delay={0.2}>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-white/80 sm:text-lg">
                Third weekend of every month we take the floor into the hills —
                Yercaud, Kolli, Sitheri, the Nilgiris. Members get first slots
                and a lower rate. First-timers get a lead who has walked it
                before, and nobody is left on the trail.
              </p>
            </Reveal>

            <Reveal delay={0.3}>
              <a
                href="#trek"
                className="group mt-9 inline-flex items-center gap-2 rounded-full bg-ink px-7 py-4 text-sm font-semibold text-white transition-transform duration-300 hover:scale-[1.02]"
              >
                See the calendar
                <ArrowDown
                  className="size-4 transition-transform duration-300 group-hover:translate-y-0.5"
                  strokeWidth={2.4}
                />
              </a>
            </Reveal>
          </div>

          <Reveal delay={0.15}>
            <div className="rounded-3xl border border-ink/15 bg-ink/[0.06] p-7 backdrop-blur sm:p-9">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted">
                Next expedition
              </p>
              <Countdown iso={trek.date} />
              <p className="-mt-2 text-sm font-semibold uppercase tracking-[0.2em] text-muted">
                days out
              </p>
              <div className="mt-6 flex items-start gap-3 border-t border-line pt-6">
                <Mountain className="mt-0.5 size-5 shrink-0" strokeWidth={2} />
                <div>
                  <p className="display text-2xl">{trek.title}</p>
                  <p className="mt-1 text-sm text-muted">
                    {longDate(trek.date)} · {trek.location}
                  </p>
                  <p className="mt-1 text-sm text-muted">
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
