"use client";

import { useState } from "react";
import { Plus, Star } from "lucide-react";
import { contact, faqs, reviews, testimonials } from "@f7/content";

/** What members say — words only, big and readable. */
export function Voices() {
  const [lead, ...rest] = testimonials;
  return (
    <section id="reviews" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Members</p>
            <h2 data-reveal="lines" className="h-section mt-3 max-w-2xl text-fg">
              Ask the people who stayed.
            </h2>
          </div>
          <a href={contact.mapsUrl} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 rounded-full bg-surface py-2 pl-2 pr-5 ring-1 ring-line transition-shadow hover:shadow-[0_16px_30px_-20px_rgba(18,19,22,0.4)]">
            <span className="cond tnum grid size-12 place-items-center rounded-full bg-fg text-xl text-paper">{reviews.rating.toFixed(1)}</span>
            <span>
              <span className="flex" aria-hidden>
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className="size-4 fill-[#e3a92b] text-[#e3a92b]" strokeWidth={0} />
                ))}
              </span>
              <span className="tnum text-sm text-muted">{reviews.count} reviews on Google</span>
            </span>
          </a>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          {lead ? (
            <figure data-reveal="up" className="flex flex-col justify-between rounded-[28px] bg-fg p-8 text-paper sm:p-10">
              <blockquote className="text-[26px] font-semibold leading-[1.3] tracking-[-0.01em] sm:text-[34px]">“{lead.quote}”</blockquote>
              <figcaption className="mt-10 flex items-center justify-between gap-4 text-sm">
                <span>
                  <span className="block font-bold">{lead.name}</span>
                  <span className="text-paper/60">{lead.detail}</span>
                </span>
                <span className="text-paper/60">{lead.since}</span>
              </figcaption>
            </figure>
          ) : null}
          <ul data-reveal="stagger" className="grid gap-4">
            {rest.map((t) => (
              <li key={t.id} className="rounded-[24px] bg-surface p-6 ring-1 ring-line">
                <blockquote className="text-[17px] leading-relaxed text-fg">“{t.quote}”</blockquote>
                <p className="mt-4 text-sm">
                  <span className="font-bold text-fg">{t.name}</span> <span className="text-muted">· {t.detail}</span>
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/** Questions — one open at a time, height eases open (CSS grid rows), fully keyboard-operable. */
export function Questions() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
        <div>
          <p className="eyebrow">Questions</p>
          <h2 data-reveal="lines" className="h-section mt-3 text-fg">
            Before you come in.
          </h2>
        </div>
        <ul className="border-t border-fg">
          {faqs.map((f, i) => {
            const on = open === i;
            return (
              <li key={f.q} data-open={on} className="border-b border-line">
                <button
                  type="button"
                  onClick={() => setOpen(on ? null : i)}
                  aria-expanded={on}
                  aria-controls={`faq-${i}`}
                  className="flex w-full items-center gap-4 py-5 text-left"
                >
                  <span className="flex-1 text-lg font-bold text-fg">{f.q}</span>
                  <span className={`grid size-9 shrink-0 place-items-center rounded-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${on ? "rotate-45 bg-fg text-paper" : "bg-surface-2 text-fg"}`}>
                    <Plus className="size-4" strokeWidth={2.4} />
                  </span>
                </button>
                <div id={`faq-${i}`} className="acc-body" role="region" aria-hidden={!on}>
                  <div>
                    <p className="max-w-2xl pb-6 pr-12 text-base leading-relaxed text-muted">{f.a}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
