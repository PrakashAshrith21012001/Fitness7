"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { ChevronDown } from "lucide-react";
import { brand, classes, fmtTime, longDate, slotsFor, waLink } from "@f7/content";
import { classPhoto } from "@/lib/photos";
import { Photo, Wrap } from "@/components/app/ui";
import { SectionHeader } from "@/components/site/SectionHeader";
import { toast } from "@/components/site/Toaster";

/**
 * This week's timetable. A day strip (Jakob's Law — every booking app has
 * one), then one compact row per class running that day with its times as
 * chips. Tapping a time opens WhatsApp with the class, date and time already
 * written, so nothing has to be remembered or typed (Recognition over Recall,
 * Tesler's Law). Classes not on that day fold away under one line
 * (Progressive Disclosure); past slots are visibly unavailable (Error
 * Prevention).
 */

const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const addDays = (s: string, n: number) => {
  const d = new Date(s + "T12:00:00");
  d.setDate(d.getDate() + n);
  return iso(d);
};
const noop = () => () => {};
const VISIBLE = 4;
/** "6:00 AM" → "6 AM" — shorter chips, more of them per line on a phone. */
const short = (h: number, m: number) => fmtTime(h, m).replace(":00 ", " ");

export function Timetable() {
  // Known only in the browser (the server page is cached) — skeleton until then.
  const today = useSyncExternalStore(noop, () => iso(new Date()), () => null);
  const minute = useSyncExternalStore(noop, () => Math.floor(Date.now() / 60_000), () => null);
  const [picked, setPicked] = useState<string | null>(null);
  const [all, setAll] = useState(false);
  const day = picked ?? today;

  const days = useMemo(() => (today ? Array.from({ length: 7 }, (_, i) => addDays(today, i)) : []), [today]);
  const weekday = day ? new Date(day + "T12:00:00").getDay() : 1;
  const running = classes.filter((c) => slotsFor(c.id, weekday).length > 0);
  const off = classes.filter((c) => slotsFor(c.id, weekday).length === 0);
  const shown = all ? running : running.slice(0, VISIBLE);

  const choose = (d: string) => {
    const go = () => {
      setPicked(d);
      setAll(false);
    };
    // Cross-fade between days where the browser supports View Transitions.
    const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
    if (doc.startViewTransition && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) doc.startViewTransition(go);
    else go();
  };

  const bookHref = (name: string, h: number, m: number) =>
    waLink(`Hi ${brand.name}! I'd like to book ${name} on ${day ? longDate(day) : "the next available day"} at ${fmtTime(h, m)}.\n\nName: \nAre you a member? `);

  const past = (h: number, m: number) => {
    if (minute === null || day !== today) return false;
    const now = new Date(minute * 60_000);
    return h < now.getHours() || (h === now.getHours() && m <= now.getMinutes());
  };

  return (
    <section id="timetable" className="pt-16 sm:pt-24">
      <Wrap>
        <SectionHeader
          kicker="Timetable"
          title="Pick a day, tap a time"
          sub="Booking opens WhatsApp with everything filled in. No account, no app needed."
        />

        {/* day strip */}
        <div className="snap-row -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0" role="tablist" aria-label="Day">
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
                className={`press flex h-14 min-w-[56px] shrink-0 flex-col items-center justify-center rounded-xl border px-3 ${
                  on ? "border-white bg-white text-ink" : d ? "border-line bg-surface text-white hover:bg-surface-2" : "skeleton border-transparent"
                }`}
              >
                <span className={`text-[10px] font-bold uppercase tracking-[0.08em] ${on ? "text-ink" : "text-muted"}`}>{dt ? (i === 0 ? "Today" : WD[dt.getDay()]) : " "}</span>
                <span className="tnum text-lg font-extrabold leading-tight">{dt ? dt.getDate() : " "}</span>
              </button>
            );
          })}
        </div>

        {/* class rows */}
        <ul className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-2 [&>li]:min-w-0" aria-live="polite">
          {shown.map((c) => {
            const slots = slotsFor(c.id, weekday);
            return (
              <li key={c.id} className="pane flex gap-3 p-3 sm:gap-3.5 sm:p-3.5">
                <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-surface-2 sm:size-[88px]">
                  <Photo src={classPhoto(c.id)} alt="" sizes="88px" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="truncate text-[15px] font-bold text-white sm:text-base">{c.name}</h3>
                    <span className="tnum shrink-0 text-xs text-muted">{c.durationMin} min</span>
                  </div>
                  <p className="truncate text-[13px] text-muted">
                    {c.intensity === "All levels" ? "All levels" : `${c.intensity} intensity`} · {c.tagline}
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {slots.map((s) =>
                      past(s.h, s.m) ? (
                        <span
                          key={s.time}
                          className="tnum flex h-11 items-center rounded-lg border border-dashed border-line px-2.5 text-[13px] font-semibold text-muted line-through"
                          title="Already started"
                        >
                          {short(s.h, s.m)}
                        </span>
                      ) : (
                        <a
                          key={s.time}
                          href={bookHref(c.name, s.h, s.m)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => toast(`Opening WhatsApp · ${short(s.h, s.m)} ${c.name}`)}
                          aria-label={`Book ${c.name} at ${fmtTime(s.h, s.m)}`}
                          className="press tnum flex h-11 items-center rounded-lg border border-line bg-surface px-2.5 sm:px-3 text-[13px] font-bold text-white hover:border-white hover:bg-surface-2"
                        >
                          {short(s.h, s.m)}
                        </a>
                      ),
                    )}
                  </div>
                </div>
              </li>
            );
          })}
          {!today
            ? Array.from({ length: VISIBLE }, (_, i) => <li key={`s${i}`} aria-hidden className="skeleton h-[120px] rounded-[14px]" />)
            : null}
        </ul>

        <div className="mt-4 flex flex-col items-center gap-2 text-center">
          {running.length > VISIBLE ? (
            <button
              type="button"
              onClick={() => setAll((v) => !v)}
              aria-expanded={all}
              className="press flex h-11 items-center gap-1.5 rounded-lg px-4 text-[13px] font-extrabold uppercase tracking-[0.06em] text-white hover:bg-surface"
            >
              {all ? "Show fewer" : `Show all ${running.length} classes`}
              <ChevronDown className={`size-4 transition-transform ${all ? "rotate-180" : ""}`} strokeWidth={2.2} />
            </button>
          ) : null}
          {off.length && today ? (
            <p className="text-xs text-muted">
              Not on this day: {off.map((c) => c.name).join(", ")}
            </p>
          ) : null}
        </div>
      </Wrap>
    </section>
  );
}
