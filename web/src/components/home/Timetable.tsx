"use client";

import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import { ChevronDown } from "lucide-react";
import { brand, classes, fmtTime, longDate, slotsFor, waLink } from "@f7/content";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { toast } from "@/components/site/Toaster";

/**
 * This week's timetable. Pick a day, tap a time — WhatsApp opens with the
 * class, date and time written out. Rows slide in when the day changes; past
 * times are struck through; the rest of the week's classes fold away.
 */
const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const addDays = (s: string, n: number) => {
  const d = new Date(s + "T12:00:00");
  d.setDate(d.getDate() + n);
  return iso(d);
};
const noop = () => () => {};
const VISIBLE = 5;
const short = (h: number, m: number) => fmtTime(h, m).replace(":00 ", " ");

export function Timetable() {
  const today = useSyncExternalStore(noop, () => iso(new Date()), () => null);
  const minute = useSyncExternalStore(noop, () => Math.floor(Date.now() / 60_000), () => null);
  const [picked, setPicked] = useState<string | null>(null);
  const [all, setAll] = useState(false);
  const list = useRef<HTMLUListElement>(null);
  const day = picked ?? today;

  const days = useMemo(() => (today ? Array.from({ length: 7 }, (_, i) => addDays(today, i)) : []), [today]);
  const weekday = day ? new Date(day + "T12:00:00").getDay() : 1;
  const running = classes.filter((c) => slotsFor(c.id, weekday).length > 0);
  const off = classes.filter((c) => slotsFor(c.id, weekday).length === 0);
  const shown = all ? running : running.slice(0, VISIBLE);

  const choose = (d: string) => {
    setPicked(d);
    setAll(false);
    if (!prefersReducedMotion())
      requestAnimationFrame(() => {
        if (list.current) gsap.fromTo(list.current.children, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.55, stagger: 0.04, ease: "expo.out" });
      });
  };

  const past = (h: number, m: number) => {
    if (minute === null || day !== today) return false;
    const now = new Date(minute * 60_000);
    return h < now.getHours() || (h === now.getHours() && m <= now.getMinutes());
  };

  const href = (name: string, h: number, m: number) =>
    waLink(`Hi ${brand.name}! I'd like to book ${name} on ${day ? longDate(day) : "the next available day"} at ${fmtTime(h, m)}.\n\nName: \nAre you a member? `);

  return (
    <section id="timetable" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
          <header>
            <p className="eyebrow">Timetable</p>
            <h2 data-reveal="lines" className="h-section mt-3 text-fg">
              Pick a day. Tap a&nbsp;time.
            </h2>
            <p data-reveal="up" className="mt-4 max-w-sm text-base leading-relaxed text-muted">
              Booking opens WhatsApp with everything filled in. No account, no app.
            </p>
          </header>

          <div>
            <div role="tablist" aria-label="Day" className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:px-0">
              {(days.length ? days : Array.from({ length: 7 }, () => "")).map((d, i) => {
                const dt = d ? new Date(d + "T12:00:00") : null;
                const on = !!d && d === day;
                return (
                  <button
                    key={d || i}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    disabled={!d}
                    onClick={() => d && choose(d)}
                    className={`press flex h-[60px] min-w-[58px] shrink-0 flex-col items-center justify-center rounded-2xl px-3 ${
                      on ? "bg-fg text-paper shadow-[0_12px_24px_-12px_rgba(18,19,22,0.5)]" : d ? "border border-line bg-surface text-fg hover:border-fg/40" : "skeleton"
                    }`}
                  >
                    <span className={`text-[11px] font-bold uppercase tracking-[0.1em] ${on ? "text-paper/70" : "text-muted"}`}>{dt ? (i === 0 ? "Today" : WD[dt.getDay()]) : " "}</span>
                    <span className="tnum text-xl font-extrabold leading-tight">{dt ? dt.getDate() : " "}</span>
                  </button>
                );
              })}
            </div>

            <ul ref={list} className="mt-6 divide-y divide-line border-y border-line" aria-live="polite">
              {today
                ? shown.map((c) => (
                    <li key={c.id} className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold text-fg">{c.name}</h3>
                        <p className="tnum mt-0.5 text-sm text-muted">
                          {c.durationMin} min · {c.intensity === "All levels" ? "All levels" : `${c.intensity} intensity`}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 sm:justify-end">
                        {slotsFor(c.id, weekday).map((s) =>
                          past(s.h, s.m) ? (
                            <span key={s.time} title="Already started" className="tnum flex h-11 items-center rounded-full px-3.5 text-sm font-semibold text-muted/70 line-through">
                              {short(s.h, s.m)}
                            </span>
                          ) : (
                            <a
                              key={s.time}
                              href={href(c.name, s.h, s.m)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => toast(`Opening WhatsApp · ${short(s.h, s.m)} ${c.name}`)}
                              aria-label={`Book ${c.name} at ${fmtTime(s.h, s.m)}`}
                              className="press tnum flex h-11 items-center rounded-full border border-line bg-surface px-4 text-sm font-bold text-fg hover:border-fg hover:bg-fg hover:text-paper"
                            >
                              {short(s.h, s.m)}
                            </a>
                          ),
                        )}
                      </div>
                    </li>
                  ))
                : Array.from({ length: VISIBLE }, (_, i) => (
                    <li key={i} className="py-5" aria-hidden>
                      <div className="skeleton h-6 w-48 rounded-md" />
                      <div className="skeleton mt-3 h-11 w-64 rounded-full" />
                    </li>
                  ))}
            </ul>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              {off.length && today ? <p className="text-sm text-muted">Not on this day: {off.map((c) => c.name).join(", ")}</p> : <span />}
              {running.length > VISIBLE ? (
                <button type="button" onClick={() => setAll((v) => !v)} aria-expanded={all} className="btn-ghost press flex h-11 items-center gap-1.5 px-5 text-sm text-fg">
                  {all ? "Show fewer" : `Show all ${running.length}`}
                  <ChevronDown className={`size-4 transition-transform duration-300 ${all ? "rotate-180" : ""}`} strokeWidth={2.2} />
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
