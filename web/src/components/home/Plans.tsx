"use client";

import { useRef } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { brand, memberPlansCopy, waLink } from "@f7/content";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

/**
 * Three plans, cheapest to fullest, the middle one in ink (Von Restorff,
 * Serial Position). Cards tilt in 3D towards the pointer and catch a soft
 * highlight where it is — they feel like objects you can pick up.
 * Personal training and the at-home pass sit underneath as quiet rows.
 */
type Item = (typeof memberPlansCopy.items)[number];
const byId = (id: string) => memberPlansCopy.items.find((p) => p.id === id) as Item;
const MAIN: { item: Item; perks: string[]; popular?: boolean }[] = [
  { item: byId("monthly"), perks: ["Full gym & cardio floor", "Locker & showers", "Free induction session"] },
  { item: byId("quarterly"), perks: ["Everything in PLAY", "All group classes", "Diet guidance from a coach"], popular: true },
  { item: byId("annual"), perks: ["Everything in PRO", "One free trek", "Priority PT booking"] },
];
const EXTRA = [byId("personal-training"), byId("home")];
const price = (p: Item) => p.price.replace("*", "").replace(" / month", "");
const ask = (p: Item) => waLink(`Hi ${brand.name}! I'm interested in ${p.name} (${p.price.replace("*", "")}). Could you tell me the next steps?`);

export function Plans() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !window.matchMedia("(pointer: fine)").matches) return;
      const cards = gsap.utils.toArray<HTMLElement>("[data-tilt]");
      const offs = cards.map((card) => {
        const rx = gsap.quickTo(card, "rotationX", { duration: 0.6, ease: "power3.out" });
        const ry = gsap.quickTo(card, "rotationY", { duration: 0.6, ease: "power3.out" });
        const move = (e: PointerEvent) => {
          const r = card.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          ry(px * 10);
          rx(-py * 10);
          card.style.setProperty("--mx", `${(px + 0.5) * 100}%`);
          card.style.setProperty("--my", `${(py + 0.5) * 100}%`);
        };
        const leave = () => {
          rx(0);
          ry(0);
        };
        card.addEventListener("pointermove", move);
        card.addEventListener("pointerleave", leave);
        return () => {
          card.removeEventListener("pointermove", move);
          card.removeEventListener("pointerleave", leave);
        };
      });
      return () => offs.forEach((off) => off());
    },
    { scope: root },
  );

  return (
    <section ref={root} id="plans" className="bg-deep py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <p className="eyebrow">Membership</p>
          <h2 data-reveal="lines" className="h-section mt-3 text-fg">
            Simple plans. No joining fee.
          </h2>
          <p data-reveal="up" className="mt-4 text-base leading-relaxed text-muted">
            Start with a free session, then pick a plan at the desk or on WhatsApp.
          </p>
        </div>

        <ul data-reveal="stagger" className="mt-12 grid gap-4 md:grid-cols-3 md:items-stretch" style={{ perspective: "1200px" }}>
          {MAIN.map(({ item, perks, popular }) => (
            <li key={item.id} className="h-full">
              <div
                data-tilt
                className={`squircle relative flex h-full flex-col overflow-hidden rounded-[24px] p-6 will-change-transform sm:p-8 ${
                  popular ? "bg-fg text-paper shadow-[0_40px_80px_-40px_rgba(18,19,22,0.7)]" : "bg-surface text-fg ring-1 ring-line"
                }`}
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* pointer highlight */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 [li:hover_&]:opacity-100"
                  style={{ background: `radial-gradient(420px circle at var(--mx,50%) var(--my,50%), ${popular ? "rgba(255,255,255,0.10)" : "rgba(140,186,61,0.14)"}, transparent 60%)` }}
                />
                <div className="relative flex items-center justify-between">
                  <h3 className="text-xl font-extrabold">{item.name}</h3>
                  {popular ? <span className="rounded-full bg-brand px-3 py-1 text-xs font-bold text-fg">Most chosen</span> : null}
                </div>
                <p className={`relative mt-2 min-h-10 text-sm leading-snug ${popular ? "text-paper/70" : "text-muted"}`}>{item.sub}</p>
                <p className="tnum relative mt-8">
                  <span className="cond text-[64px] leading-none">{price(item)}</span>
                  <span className={`ml-1 text-sm ${popular ? "text-paper/70" : "text-muted"}`}>/ month</span>
                </p>
                <ul className="relative mt-6 flex flex-col gap-2.5 text-[15px]">
                  {perks.map((p) => (
                    <li key={p} className="flex gap-2.5">
                      <Check className={`mt-0.5 size-4 shrink-0 ${popular ? "text-brand" : "text-green"}`} strokeWidth={2.6} />
                      {p}
                    </li>
                  ))}
                </ul>
                <div className="relative mt-auto pt-8">
                  <a
                    href={ask(item)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`press flex h-12 items-center justify-center rounded-full text-sm font-bold ${
                      popular ? "bg-paper text-fg hover:opacity-90" : "border-[1.5px] border-fg text-fg hover:bg-fg hover:text-paper"
                    }`}
                  >
                    Choose {item.name.replace("F7 pass ", "")}
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <ul className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 [&>li]:min-w-0">
          {EXTRA.map((p) => (
            <li key={p.id}>
              <a href={ask(p)} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 rounded-[20px] bg-surface p-5 ring-1 ring-line transition-shadow hover:shadow-[0_20px_40px_-28px_rgba(18,19,22,0.4)]">
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-bold text-fg">{p.name}</span>
                  <span className="block truncate text-sm text-muted">{p.sub}</span>
                </span>
                <span className="tnum shrink-0 text-right">
                  <span className="cond block text-3xl leading-none text-fg">{price(p)}</span>
                  <span className="text-xs text-muted">/ month</span>
                </span>
                <ArrowUpRight className="size-5 shrink-0 text-fg transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={2} />
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-muted">Starting prices; confirmed at the desk.</p>
      </div>
    </section>
  );
}
