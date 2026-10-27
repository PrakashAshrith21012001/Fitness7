"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ArrowRight, CalendarDays, Check, Clock, MapPin, Mountain, Users } from "lucide-react";
import { groupIndian, inr, longDate, shortDate, wa, type Trek } from "@f7/content";
import { photo } from "@/lib/photos";
import { BLUR } from "@/lib/blur";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { Sheet } from "@/components/site/Sheet";
import { toast } from "@/components/site/Toaster";

/**
 * Monthly treks. One photograph, slowly parallaxing, carries the next trek.
 * Under it the season is drawn as a ridge line — each upcoming trek a peak
 * whose height is its real altitude — and the line draws itself as you scroll
 * (Law of Continuity). Tap a peak or a row for the full details sheet.
 */

const W = 1200;
const H = 240;

function ridge(treks: Trek[]) {
  const n = treks.length;
  const maxAlt = Math.max(...treks.map((t) => t.altitudeM), 1);
  const xs = treks.map((_, i) => ((i + 0.5) / n) * W);
  const ys = treks.map((t) => H - 30 - (t.altitudeM / maxAlt) * (H - 80));
  let d = `M 0 ${H - 20}`;
  xs.forEach((x, i) => {
    const prevX = i === 0 ? 0 : xs[i - 1];
    const valley = (prevX + x) / 2;
    d += ` C ${valley - 40} ${H - 18}, ${valley + 20} ${H - 26}, ${valley} ${H - 22}`;
    d += ` S ${x - 50} ${ys[i]}, ${x} ${ys[i]}`;
  });
  d += ` S ${W - 60} ${H - 18}, ${W} ${H - 20}`;
  return { d, points: xs.map((x, i) => ({ x, y: ys[i] })) };
}

export function Treks({ treks }: { treks: Trek[] }) {
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<Trek | null>(null);
  const next = treks[0];
  const { d, points } = ridge(treks.length ? treks : []);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo("[data-parallax]", { yPercent: -8 }, { yPercent: 8, ease: "none", scrollTrigger: { trigger: "[data-photo]", start: "top bottom", end: "bottom top", scrub: true } });
      const path = root.current?.querySelector<SVGPathElement>("[data-ridge]");
      if (path) {
        const len = path.getTotalLength();
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(path, { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: "[data-season]", start: "top 85%", end: "bottom 60%", scrub: 1 } });
        gsap.from("[data-peak]", { scale: 0, opacity: 0, transformOrigin: "center", stagger: 0.25, duration: 0.6, ease: "back.out(2)", scrollTrigger: { trigger: "[data-season]", start: "top 70%" } });
      }
    },
    { scope: root, dependencies: [treks.length] },
  );

  if (!next) return null;
  const reserve = (t: Trek) => toast(`Opening WhatsApp · ${t.title}`);

  return (
    <section ref={root} id="treks" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Monthly treks</p>
            <h2 data-reveal="lines" className="h-section mt-3 max-w-3xl text-fg">
              Then we take it to the hills.
            </h2>
          </div>
          <p data-reveal="up" className="max-w-sm text-base leading-relaxed text-muted">
            One guided trek a month. Members get first seats and a lower price; first-timers get a lead who has walked it before.
          </p>
        </div>

        {/* ---------- next trek ---------- */}
        <article data-photo className="relative mt-10 overflow-hidden rounded-[28px] bg-deep">
          <div className="relative h-[520px] sm:h-[600px]">
            <div data-parallax className="absolute -inset-y-[10%] inset-x-0">
              <Image
                src={photo("treks-hero")}
                alt="Fitness 7 members walking a ridge at sunrise"
                fill
                sizes="(min-width: 1280px) 1216px, 100vw"
                placeholder="blur"
                blurDataURL={BLUR[photo("treks-hero")]}
                className="object-cover object-[center_65%]"
              />
            </div>
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[rgba(18,19,22,0.85)] via-[rgba(18,19,22,0.15)] to-transparent" />
          </div>

          <div className="absolute inset-x-4 bottom-4 sm:inset-x-8 sm:bottom-8">
            <div className="flex flex-col gap-6 text-white lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="cond tnum text-[64px] leading-[0.85] text-[#fff] sm:text-[96px]">{shortDate(next.date)}</p>
                <h3 className="mt-2 text-2xl font-extrabold tracking-[-0.02em] text-[#fff] sm:text-4xl">{next.title}</h3>
                <p className="tnum mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[rgba(255,255,255,0.8)]">
                  <span>{next.location}</span>
                  <span>{next.distanceKm} km</span>
                  <span>{groupIndian(next.altitudeM)} m</span>
                  <span>{next.difficulty}</span>
                  <span>{next.slotsLeft} seats left</span>
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <p className="tnum text-[#fff]">
                  <span className="text-3xl font-extrabold">{inr(next.memberPriceINR)}</span>
                  <span className="ml-1.5 text-sm text-[rgba(255,255,255,0.7)]">members · guests {inr(next.priceINR)}</span>
                </p>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setOpen(next)} className="press h-12 rounded-full border border-[rgba(255,255,255,0.5)] px-5 text-sm font-bold text-[#fff] hover:bg-[rgba(255,255,255,0.12)]">
                    Details
                  </button>
                  <a
                    href={wa.trek(next)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => reserve(next)}
                    className="press flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#fff] px-6 text-sm font-bold text-[#121316] sm:flex-none"
                  >
                    Reserve a seat <ArrowRight className="size-4" strokeWidth={2.4} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* ---------- the season, as a ridge ---------- */}
        {treks.length > 1 ? (
          <div data-season className="mt-14">
            <p className="eyebrow">The season</p>
            <div className="relative mt-4 hidden md:block">
              <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full overflow-visible" aria-hidden>
                <path d={`${d} L ${W} ${H} L 0 ${H} Z`} fill="var(--p-surface-2)" opacity="0.7" />
                <path data-ridge d={d} fill="none" stroke="var(--p-fg)" strokeWidth="2.5" strokeLinecap="round" />
                {points.map((p, i) => (
                  <g key={treks[i].id} data-peak>
                    <circle cx={p.x} cy={p.y} r="9" fill={i === 0 ? "var(--p-brand)" : "var(--p-surface)"} stroke="var(--p-fg)" strokeWidth="2.5" />
                  </g>
                ))}
              </svg>
              <ul className="absolute inset-0">
                {points.map((p, i) => {
                  const t = treks[i];
                  return (
                    <li key={t.id} className="absolute -translate-x-1/2" style={{ left: `${(p.x / W) * 100}%`, top: `${(p.y / H) * 100}%` }}>
                      <button type="button" onClick={() => setOpen(t)} className="group -mt-[92px] flex flex-col items-center text-center">
                        <span className="cond tnum text-2xl leading-none text-fg">{shortDate(t.date)}</span>
                        <span className="mt-1 max-w-[180px] text-sm font-bold text-fg underline-offset-4 group-hover:underline">{t.title}</span>
                        <span className="tnum text-xs text-muted">{groupIndian(t.altitudeM)} m · {t.difficulty}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* list (all sizes on phones, a quick index on desktop) */}
            <ul className="mt-6 divide-y divide-line border-y border-line md:mt-10">
              {treks.map((t) => (
                <li key={t.id}>
                  <button type="button" onClick={() => setOpen(t)} className="group flex w-full items-center gap-4 py-4 text-left">
                    <span className="cond tnum w-20 shrink-0 text-2xl leading-none text-fg">{shortDate(t.date)}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-base font-bold text-fg">{t.title}</span>
                      <span className="tnum block text-sm text-muted">
                        {t.location} · {t.difficulty} · {t.slotsLeft} seats left
                      </span>
                    </span>
                    <span className="tnum hidden text-base font-bold text-fg sm:block">{inr(t.memberPriceINR)}</span>
                    <ArrowRight className="size-5 shrink-0 text-fg transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <Sheet open={!!open} onClose={() => setOpen(null)} title={open?.title ?? "Trek"}>
        {open ? (
          <div className="flex flex-col gap-4 pb-2">
            <ul className="grid grid-cols-2 gap-2 text-[13px]">
              <li className="rounded-xl bg-surface-2 p-3"><CalendarDays className="mb-1 size-4 text-muted" strokeWidth={2} /><span className="text-fg">{longDate(open.date)}</span></li>
              <li className="rounded-xl bg-surface-2 p-3"><Clock className="mb-1 size-4 text-muted" strokeWidth={2} /><span className="text-fg">{open.durationText}</span></li>
              <li className="rounded-xl bg-surface-2 p-3"><Mountain className="mb-1 size-4 text-muted" strokeWidth={2} /><span className="tnum text-fg">{open.distanceKm} km · {groupIndian(open.altitudeM)} m · {open.difficulty}</span></li>
              <li className="rounded-xl bg-surface-2 p-3"><MapPin className="mb-1 size-4 text-muted" strokeWidth={2} /><span className="text-fg">{open.location}</span></li>
            </ul>
            <p className="text-sm leading-relaxed text-muted">{open.summary}</p>
            <div>
              <p className="eyebrow">Highlights</p>
              <ul className="mt-2 space-y-1.5">
                {open.highlights.map((h) => (
                  <li key={h} className="flex gap-2 text-sm text-fg"><Check className="mt-0.5 size-4 shrink-0 text-green" strokeWidth={2.4} />{h}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="eyebrow">Included</p>
              <p className="mt-1.5 text-sm text-muted">{open.includes.join(" · ")}</p>
            </div>
            <p className="flex items-center gap-2 text-sm text-muted"><Users className="size-4" strokeWidth={2} /> Meet: {open.meetingPoint}</p>
            <div className="sticky bottom-0 -mx-4 flex items-center justify-between gap-3 border-t border-line bg-solid px-4 py-3">
              <div className="tnum">
                <p className="text-lg font-extrabold text-fg">{inr(open.memberPriceINR)} <span className="text-xs font-normal text-muted">members</span></p>
                <p className="text-xs text-muted">Guests {inr(open.priceINR)} · {open.slotsLeft} seats left</p>
              </div>
              <a href={wa.trek(open)} target="_blank" rel="noopener noreferrer" onClick={() => reserve(open)} className="btn-primary h-12 px-6 text-sm">
                {open.slotsLeft === 0 ? "Join waitlist" : "Reserve a seat"}
              </a>
            </div>
          </div>
        ) : null}
      </Sheet>
    </section>
  );
}
