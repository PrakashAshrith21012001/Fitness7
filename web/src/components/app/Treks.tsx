"use client";

import { useMemo, useState } from "react";
import { Check, Footprints, MapPin, Moon, Phone, Search, Sun, X, type LucideIcon } from "lucide-react";
import { groupIndian, inr, longDate, telLink, trekIntro, wa, type Trek, type TrekDifficulty } from "@f7/content";
import { photo, trekPhoto } from "@/lib/photos";
import { Block, Photo, SectionHead, Wrap } from "@/components/app/ui";

/**
 * The app's Treks tab: offer hero, Try-for-Free kinds, Need help? callback,
 * difficulty chips + search, one tall card per trek with the gold OPENS ON
 * tag and the TRY FOR FREE | MORE DETAILS footer, then "Slightly far from
 * your place". Treks come from /admin (Supabase) with shared/gym.ts as the
 * fallback, exactly like the app.
 */

const MON = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const opensOn = (d: string) => {
  const [, m, day] = d.split("-").map(Number);
  return `${day} ${MON[m - 1]}`;
};
/** Rough road distance from Dharmapuri — the same split the app uses. */
const farKm = (t: Trek) => {
  const l = t.location.toLowerCase();
  if (l.includes("dharmapuri")) return 25;
  if (l.includes("salem") || l.includes("yercaud")) return 70;
  if (l.includes("namakkal") || l.includes("kolli")) return 115;
  if (l.includes("nilgiri") || l.includes("kotagiri")) return 260;
  return 80;
};
type Kind = "day" | "night" | "ridge";
const kindOf = (t: Trek): Kind => (/night/i.test(t.title + t.durationText) ? "night" : /ridge|2 days/i.test(t.title + t.durationText) ? "ridge" : "day");

const KINDS: { id: Kind; icon: LucideIcon; label: string; tint: string }[] = [
  { id: "day", icon: Sun, label: "day trek", tint: "var(--color-gold)" },
  { id: "night", icon: Moon, label: "night trek", tint: "var(--color-blue)" },
  { id: "ridge", icon: Footprints, label: "ridge walk", tint: "var(--color-green)" },
];

export function Treks({ treks }: { treks: Trek[] }) {
  const [diff, setDiff] = useState<TrekDifficulty | null>(null);
  const [kind, setKind] = useState<Kind | null>(null);
  const [q, setQ] = useState("");

  const list = useMemo(
    () =>
      treks.filter(
        (t) =>
          (!diff || t.difficulty === diff) &&
          (!kind || kindOf(t) === kind) &&
          (!q.trim() || `${t.title} ${t.location}`.toLowerCase().includes(q.trim().toLowerCase())),
      ),
    [treks, diff, kind, q],
  );
  const near = list.filter((t) => farKm(t) <= 100);
  const far = list.filter((t) => farKm(t) > 100);
  const guestFrom = treks.length ? Math.min(...treks.map((t) => t.priceINR)) : 1400;

  return (
    <Block id="treks">
      {/* ---------- hero ---------- */}
      <Wrap className="px-0 sm:px-6 lg:px-8">
        <div data-tone="dark" className="relative h-[420px] overflow-hidden text-white sm:h-[460px] sm:rounded-[14px]">
          <Photo src={photo("treks-hero")} alt="Fitness 7 members walking a ridge at sunrise" sizes="(min-width: 1280px) 1216px, 100vw" className="object-[center_60%]" />
          <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(9,12,28,0.15) 0%, rgba(9,12,28,0.55) 60%, #0f1428 100%)" }} />
          <div className="absolute inset-x-4 bottom-6 flex flex-col items-center text-center">
            <p className="label !text-[rgba(255,255,255,0.75)]">{trekIntro.eyebrow}</p>
            <p className="mt-2 text-2xl font-extrabold leading-tight sm:text-4xl">{trekIntro.title}</p>
            <p className="mt-3 max-w-xl text-[15px] font-semibold leading-snug">
              Members save up to ₹1,000 per trek
              <br />+ one free trek on F7 pass ELITE
            </p>
            <a href="#plans" className="btn-glass mt-4 inline-flex h-9 items-center px-4">
              See plans
            </a>
          </div>
        </div>
      </Wrap>

      <Wrap>
        <p className="mx-auto mt-6 max-w-3xl text-center text-sm leading-relaxed text-muted sm:text-base">{trekIntro.body}</p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          {/* ---------- Try for Free ---------- */}
          <div>
            <h3 className="text-xl font-extrabold text-white">Try for Free</h3>
            <div className="mt-3 flex justify-around lg:justify-start lg:gap-8">
              {KINDS.map((k) => {
                const on = kind === k.id;
                return (
                  <button
                    key={k.id}
                    type="button"
                    onClick={() => setKind((v) => (v === k.id ? null : k.id))}
                    aria-pressed={on}
                    className="flex w-[90px] flex-col items-center gap-2"
                  >
                    <span className={`grid size-14 place-items-center rounded-[14px] border transition-colors ${on ? "border-white bg-surface-2" : "border-line bg-surface hover:bg-surface-2"}`}>
                      <k.icon className="size-[26px]" style={{ color: k.tint }} strokeWidth={1.6} />
                    </span>
                    <span className={`text-[11px] leading-[14px] ${on ? "text-white" : "text-muted"}`}>{k.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ---------- Need help? ---------- */}
          <a href={telLink()} className="pane flex items-center gap-3.5 p-3.5 transition-colors hover:bg-surface-2">
            <span className="grid size-[46px] place-items-center rounded-full bg-surface-2">
              <Phone className="size-5 text-gold" strokeWidth={1.8} />
            </span>
            <span className="flex-1">
              <span className="block text-[13px] text-muted">Need help?</span>
              <span className="mt-0.5 block text-xs font-extrabold tracking-[0.08em] text-white">REQUEST A CALLBACK ›</span>
            </span>
          </a>
        </div>

        {/* ---------- Treks near You ---------- */}
        <div className="mt-12">
          <SectionHead
            title={
              <>
                Treks near <span className="border-b-2 border-white pb-0.5">You</span>
              </>
            }
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="snap-row -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
              {(["Easy", "Moderate", "Challenging"] as TrekDifficulty[]).map((d) => {
                const on = diff === d;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDiff((v) => (v === d ? null : d))}
                    aria-pressed={on}
                    className={`min-h-[34px] shrink-0 rounded-full border px-3.5 text-[13px] font-semibold text-white transition-colors ${on ? "border-white bg-surface-2" : "border-line bg-surface hover:bg-surface-2"}`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
            <label className="flex h-[46px] w-full items-center gap-2.5 rounded-[10px] border border-line bg-surface px-3 sm:max-w-sm sm:flex-1">
              <Search className="size-[18px] text-muted" strokeWidth={1.8} />
              <span className="sr-only">Search treks</span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search for a trek near you"
                className="h-full flex-1 bg-transparent text-sm text-white placeholder:text-muted focus:outline-none"
              />
              {q ? (
                <button type="button" onClick={() => setQ("")} aria-label="Clear search" className="text-muted hover:text-white">
                  <X className="size-4" strokeWidth={2} />
                </button>
              ) : null}
            </label>
          </div>

          {list.length === 0 ? (
            <div className="pane mt-4 p-4">
              <p className="font-semibold text-white">No treks match</p>
              <p className="mt-0.5 text-[13px] text-muted">Clear the filters or ask us on WhatsApp for the next date.</p>
              <a href={wa.general()} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex h-9 items-center rounded-lg border border-line px-3.5 text-xs font-extrabold uppercase tracking-[0.06em] text-white">
                Ask on WhatsApp
              </a>
            </div>
          ) : null}

          {near.length ? (
            <ul className="mt-4 grid gap-3.5 md:grid-cols-2 lg:grid-cols-3">
              {near.map((t) => <TrekCard key={t.id} trek={t} />)}
            </ul>
          ) : null}
          {far.length ? (
            <>
              <h3 className="mt-10 text-center text-xl font-extrabold text-white">Slightly far from your place</h3>
              <ul className="mt-4 grid gap-3.5 md:grid-cols-2 lg:grid-cols-3">
                {far.map((t) => <TrekCard key={t.id} trek={t} />)}
              </ul>
            </>
          ) : null}
          <p className="mt-4 text-center text-xs text-muted">Not a member yet? Guests join any trek from {inr(guestFrom)}.</p>
        </div>
      </Wrap>
    </Block>
  );
}

function TrekCard({ trek }: { trek: Trek }) {
  const [open, setOpen] = useState(false);
  const soldOut = trek.slotsLeft === 0;
  return (
    <li className="pane flex flex-col overflow-hidden">
      <div className="relative h-[210px] text-[#fff]">
        <Photo src={trekPhoto(trek.image)} alt={trek.title} sizes="(min-width: 1024px) 400px, (min-width: 768px) 50vw, 100vw" />
        <span className="absolute left-2.5 top-2.5 rounded bg-[rgba(9,12,28,0.85)] px-2 py-1 text-[9px] font-extrabold uppercase tracking-[0.08em]">{trek.difficulty}</span>
        <span className="absolute right-[18px] top-0 flex flex-col items-center" aria-label={`Opens on ${opensOn(trek.date)}`}>
          <span className="h-4 w-0.5 bg-[rgba(255,255,255,0.7)]" />
          <span className="flex rotate-[8deg] flex-col items-center rounded bg-[#ffc857] px-2.5 py-1.5 text-[#1a1400]">
            <span className="text-[7px] font-extrabold tracking-[0.08em]">OPENS ON</span>
            <span className="text-[13px] font-black leading-tight">{opensOn(trek.date)}</span>
          </span>
        </span>
        <p className="absolute inset-x-0 bottom-0 truncate bg-[rgba(9,12,28,0.85)] px-3 py-1.5 text-[11px] font-bold text-[#ffc857]">
          Members {inr(trek.memberPriceINR)} · Guests {inr(trek.priceINR)} · {soldOut ? "Waitlist only" : `${trek.slotsLeft} slots left`}
        </p>
      </div>
      <div className="p-3.5">
        <p className="truncate text-[15px] font-semibold text-white">{trek.title}</p>
        <p className="mt-1 flex items-center gap-1 text-[13px] text-muted">
          <MapPin className="size-3" strokeWidth={2} /> {trek.distanceKm} KM • {trek.location} • {groupIndian(trek.altitudeM)} m
        </p>
        {open ? (
          <div className="mt-3 border-t border-line pt-3 text-[13px] leading-relaxed">
            <p className="font-semibold text-white">{longDate(trek.date)}</p>
            <p className="text-muted">{trek.durationText}</p>
            <p className="mt-2 text-muted">{trek.summary}</p>
            <ul className="mt-3 space-y-1.5">
              {trek.highlights.map((h) => (
                <li key={h} className="flex gap-2 text-white">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-green" strokeWidth={2.6} /> {h}
                </li>
              ))}
            </ul>
            <p className="label mt-3">Included</p>
            <p className="mt-1 text-muted">{trek.includes.join(" · ")}</p>
            <p className="label mt-3">Meeting point</p>
            <p className="mt-1 text-muted">{trek.meetingPoint}</p>
          </div>
        ) : null}
      </div>
      <div className="mt-auto flex border-t border-line bg-surface">
        <a
          href={wa.trek(trek)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-11 flex-1 items-center justify-center border-r border-line text-xs font-extrabold tracking-[0.08em] text-white hover:bg-surface-2"
        >
          {soldOut ? "JOIN WAITLIST" : "RESERVE A SLOT"}
        </a>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex min-h-11 flex-1 items-center justify-center text-xs font-extrabold tracking-[0.08em] text-white hover:bg-surface-2"
        >
          {open ? "LESS DETAILS" : "MORE DETAILS"}
        </button>
      </div>
    </li>
  );
}
