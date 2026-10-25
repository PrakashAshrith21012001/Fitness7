"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { ChevronRight, Clock } from "lucide-react";
import { brand, classes, fmtTime, longDate, slotsFor, waLink, workoutFor } from "@f7/content";
import { classPhoto } from "@/lib/photos";
import { Block, Photo, Scrim, SectionHead, Wrap } from "@/components/app/ui";

/**
 * Fitness → AT CENTER, "Classes at Fitness 7": a seven-day date strip and one
 * photo card per class with that day's slot chips. On the site a slot opens
 * WhatsApp with the class, date and time already written — the same booking
 * the app makes, landing in the gym's inbox.
 */

const WD = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const noop = () => () => {};
const addDays = (s: string, n: number) => {
  const d = new Date(s + "T12:00:00");
  d.setDate(d.getDate() + n);
  return iso(d);
};

export function ClassesBooking() {
  // "Today" is the visitor's today — known only in the browser, so the strip
  // fills in after hydration (the server page is cached and may be a day old).
  const today = useSyncExternalStore(noop, () => iso(new Date()), () => null);
  const minute = useSyncExternalStore(noop, () => Math.floor(Date.now() / 60_000), () => null);
  const now = minute === null ? null : new Date(minute * 60_000);
  const [picked, setDay] = useState<string | null>(null);
  const day = picked ?? today;

  const days = useMemo(() => (today ? Array.from({ length: 7 }, (_, i) => addDays(today, i)) : []), [today]);
  const weekday = day ? new Date(day + "T12:00:00").getDay() : 1;

  const book = (className: string, h: number, m: number) => {
    const when = day ? `${longDate(day)} at ${fmtTime(h, m)}` : fmtTime(h, m);
    return waLink(`Hi ${brand.name}! I'd like to book ${className} on ${when}.\n\nName: \nAre you a member? `);
  };

  return (
    <Block id="classes">
      <Wrap>
        <SectionHead
          title={
            <>
              Classes at <span className="border-b-2 border-white pb-0.5">{brand.name}</span>
            </>
          }
          sub="Pick a day, tap a time — it opens WhatsApp with your booking written out."
        />

        {/* date strip */}
        <div className="snap-row -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="tablist" aria-label="Choose a day">
          {(days.length ? days : Array.from({ length: 7 }, () => "")).map((d, i) => {
            const dt = d ? new Date(d + "T12:00:00") : null;
            const on = d !== "" && d === day;
            return (
              <button
                key={d || i}
                type="button"
                role="tab"
                aria-selected={on}
                disabled={!d}
                onClick={() => d && setDay(d)}
                className={`flex h-[52px] w-12 shrink-0 flex-col items-center justify-center rounded-lg transition-colors sm:w-14 ${
                  on ? "bg-white text-ink" : "text-white hover:bg-surface"
                }`}
              >
                <span className="text-base font-extrabold leading-none">{dt ? dt.getDate() : "·"}</span>
                <span className={`mt-1 text-[9px] font-bold tracking-[0.05em] ${on ? "text-ink" : "text-muted"}`}>{dt ? (i === 0 ? "TODAY" : WD[dt.getDay()]) : ""}</span>
              </button>
            );
          })}
        </div>

        <ul className="mt-4 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((c) => {
            const slots = slotsFor(c.id, weekday);
            const w = workoutFor(c.id, weekday);
            return (
              <li key={c.id} className="relative h-[320px] overflow-hidden rounded-[14px] bg-surface-2 text-[#fff]">
                <Photo src={classPhoto(c.id)} alt={c.name} sizes="(min-width: 1024px) 410px, (min-width: 640px) 50vw, 100vw" />
                <Scrim />
                <div className="absolute inset-x-3.5 bottom-3.5">
                  <p className="truncate text-lg font-black uppercase tracking-[0.11em]">{c.name}</p>
                  <p className="truncate text-[34px] font-black uppercase leading-[38px] tracking-[0.06em]">{slots.length ? w.focus : "Rest day"}</p>
                  <p className="mt-0.5 text-[13px] text-[rgba(255,255,255,0.8)]">
                    {c.intensity === "High" ? "High Intensity" : `${c.intensity} Intensity`} • {c.durationMin} min{slots.length ? ` • ${w.kcal} kcal` : ""}
                  </p>
                  <div className="snap-row mt-3 flex gap-2 overflow-x-auto">
                    {slots.length === 0 ? (
                      <span className="flex min-h-10 items-center rounded-md bg-[rgba(255,255,255,0.12)] px-3 text-xs font-bold text-[rgba(255,255,255,0.75)]">
                        No {c.name.toLowerCase()} on this day
                      </span>
                    ) : (
                      slots.map((s) => {
                        const past = !!now && day === today && (s.h < now.getHours() || (s.h === now.getHours() && s.m <= now.getMinutes()));
                        return past ? (
                          <span
                            key={s.time}
                            className="flex min-h-10 shrink-0 items-center gap-1.5 rounded-md bg-[rgba(255,255,255,0.12)] px-3 text-[13px] font-extrabold text-[rgba(255,255,255,0.45)]"
                            aria-label={`${fmtTime(s.h, s.m)}, already started`}
                          >
                            <Clock className="size-3.5" strokeWidth={2} />
                            {fmtTime(s.h, s.m).replace(" ", "")}
                          </span>
                        ) : (
                          <a
                            key={s.time}
                            href={book(c.name, s.h, s.m)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex min-h-10 shrink-0 items-center rounded-md border border-[rgba(255,255,255,0.7)] px-3 text-[13px] font-extrabold transition-colors hover:bg-[#fff] hover:text-[#0f1428]"
                            aria-label={`Book ${c.name} at ${fmtTime(s.h, s.m)}`}
                          >
                            {fmtTime(s.h, s.m).replace(" ", "")}
                          </a>
                        );
                      })
                    )}
                    <span className="grid min-h-10 w-10 shrink-0 place-items-center rounded-md bg-[rgba(255,255,255,0.12)]" aria-hidden>
                      <ChevronRight className="size-4" strokeWidth={2} />
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </Wrap>
    </Block>
  );
}
