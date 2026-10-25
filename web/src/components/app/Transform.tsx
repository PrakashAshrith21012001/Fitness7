"use client";

import { useState } from "react";
import { ChevronDown, ClipboardList, Salad, Scale, Sparkles, TrendingUp, type LucideIcon } from "lucide-react";
import { brand, faqs, transformCopy, wa } from "@f7/content";
import { classPhoto, photo } from "@/lib/photos";
import { Block, Photo, Wrap } from "@/components/app/ui";

/**
 * The app's Transform tab: "Weight Loss · TALK TO US", the AT-HOME /
 * AT-CENTRE / ONLINE PT tabs, the PRICE DROP hero, WHAT YOU GET, the price
 * row and the TALK TO US | EXPLORE PLANS pair.
 */
type Tab = (typeof transformCopy.tabs)[number]["id"];
const ICONS: LucideIcon[] = [Scale, ClipboardList, Salad, TrendingUp];

export function Transform() {
  const [tab, setTab] = useState<Tab>("centre");
  const heroPhoto = tab === "centre" ? photo("transform-centre") : tab === "online" ? classPhoto("yoga") : classPhoto("hiit");
  const heroSub = tab === "centre" ? "Coach-led sessions on the floor" : tab === "online" ? "1:1 video sessions, your schedule" : "Follow-along workouts, coach on WhatsApp";

  return (
    <Block id="transform">
      <Wrap>
        <div className="flex items-center justify-between">
          <h2 className="text-[22px] font-extrabold text-white sm:text-3xl">
            {brand.name} Transform <span className="text-muted">· Weight Loss</span>
          </h2>
          <a href={wa.personalTraining()} target="_blank" rel="noopener noreferrer" className="shrink-0 text-xs font-extrabold tracking-[0.08em] text-white hover:text-pink">
            TALK TO US
          </a>
        </div>
        <div role="tablist" aria-label="Where you train" className="mt-2 flex border-b border-line">
          {transformCopy.tabs.map((t) => {
            const on = t.id === tab;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setTab(t.id)}
                className={`mr-6 border-b-2 py-3 text-xs font-extrabold uppercase tracking-[0.08em] transition-colors ${on ? "border-white text-white" : "border-transparent text-muted hover:text-white"}`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="mt-5 grid gap-6 lg:grid-cols-2">
          {/* ---------- hero ---------- */}
          <div data-tone="dark" className="relative h-[440px] overflow-hidden rounded-[14px] text-white lg:h-auto lg:min-h-[520px]">
            <Photo key={heroPhoto} src={heroPhoto} alt="" sizes="(min-width: 1024px) 600px, 100vw" />
            <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(9,12,28,0.1) 0%, rgba(9,12,28,0.35) 55%, #0f1428 100%)" }} />
            <div className="absolute right-4 top-8 flex flex-col items-end italic">
              <span className="text-[44px] font-black leading-[44px] tracking-[-0.02em] text-[#ffc857]">PRICE</span>
              <span className="text-[44px] font-black leading-[44px] tracking-[-0.02em]">DROP</span>
              <span className="mt-0.5 flex items-center gap-1.5 not-italic">
                <span className="h-px w-5 bg-[#fff]" />
                <span className="text-xs font-extrabold tracking-[0.25em]">SALE</span>
                <span className="h-px w-5 bg-[#fff]" />
              </span>
            </div>
            <div className="absolute inset-x-4 bottom-5 flex flex-col items-center text-center">
              <p className="text-[13px] text-[rgba(255,255,255,0.8)]">{heroSub}</p>
              <p className="mt-2 text-lg font-bold leading-snug">
                ₹800 <span className="font-black">gift card</span>
                <br />+ FREE 1-Month Extension
              </p>
              <a href="#plans" className="btn-ghost mt-4 inline-flex h-9 items-center gap-2 px-4">
                <Sparkles className="size-3.5" strokeWidth={2} /> Explore {brand.name} Transform
              </a>
            </div>
          </div>

          {/* ---------- what you get + price ---------- */}
          <div className="flex flex-col">
            <p className="label text-center !text-[13px] !text-white lg:text-left">What you get</p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {transformCopy.whatYouGet.map((x, i) => {
                const Icon = ICONS[i % ICONS.length];
                return (
                  <li key={x.title} className="pane flex items-center gap-3.5 p-3.5">
                    <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--color-green)_16%,transparent)]">
                      <Icon className="size-5 text-green" strokeWidth={1.8} />
                    </span>
                    <span>
                      <span className="block text-[15px] font-semibold text-white">{x.title}</span>
                      <span className="mt-0.5 block text-[13px] text-muted">{x.sub}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
            <a href="#plans" className="pane mt-2.5 flex items-center justify-between p-3.5 hover:bg-surface-2">
              <span>
                <span className="block text-[13px] text-muted">Starting at</span>
                <span className="text-2xl font-black text-white">
                  {transformCopy.priceFrom.split(" ")[0]}
                  <span className="text-[13px] font-semibold"> / month</span>
                </span>
              </span>
              <span className="text-xs font-extrabold tracking-[0.08em] text-white">›</span>
            </a>
            <div className="mt-4 grid grid-cols-2 gap-3 lg:mt-auto lg:pt-4">
              <a href={wa.personalTraining()} target="_blank" rel="noopener noreferrer" className="flex h-12 items-center justify-center rounded-lg bg-surface-2 text-[13px] font-extrabold uppercase tracking-[0.06em] text-white">
                Talk to us
              </a>
              <a href="#plans" className="btn-pink flex h-12 items-center justify-center">
                Explore plans
              </a>
            </div>
          </div>
        </div>
      </Wrap>
    </Block>
  );
}

/** The FAQ list, opened one at a time — the app's "Questions" block. */
export function Questions() {
  const [open, setOpen] = useState<string | null>(faqs[0]?.q ?? null);
  return (
    <Block id="faq">
      <Wrap className="max-w-3xl">
        <h2 className="mb-2 text-[22px] font-extrabold text-white sm:text-3xl">Questions</h2>
        <ul>
          {faqs.map((f, i) => {
            const on = open === f.q;
            return (
              <li key={f.q} className={i ? "border-t border-line" : ""}>
                <button type="button" onClick={() => setOpen(on ? null : f.q)} aria-expanded={on} className="flex w-full items-center gap-3 py-4 text-left">
                  <span className="flex-1 text-[15px] font-semibold text-white sm:text-base">{f.q}</span>
                  <ChevronDown className={`size-[18px] shrink-0 text-muted transition-transform ${on ? "rotate-180" : ""}`} strokeWidth={2} />
                </button>
                {on ? <p className="-mt-1 pb-4 text-[13px] leading-relaxed text-muted sm:text-sm">{f.a}</p> : null}
              </li>
            );
          })}
        </ul>
      </Wrap>
    </Block>
  );
}
