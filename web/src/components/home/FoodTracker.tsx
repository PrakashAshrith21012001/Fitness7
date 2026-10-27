"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Camera, Lightbulb, Loader2, MessageSquareText, PieChart, Plus, Scale, Search, X } from "lucide-react";
import { waLink } from "@f7/content";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { Magnetic } from "@/components/home/Magnetic";

/**
 * The calorie tracker that comes with membership, shown by letting visitors
 * use it: the search box hits the same food engine the app uses
 * (/api/food/search), and anything they add fills today's ring and macro
 * bars. Nothing is stored — it's a taste of the app, not an account.
 */
type Hit = { id: string; name: string; serving: string; kcal: number; protein: number; carbs: number; fat: number; veg: boolean; brand?: string };
type Logged = Hit & { key: number };

const BUDGET = 1500;
const EXAMPLES = ["2 idli", "chicken biryani", "kothu parotta", "paneer butter masala", "filter coffee", "3 chapati"];
const cache = new Map<string, Hit[]>();

const FEATURES = [
  { icon: Search, title: "Indian food, properly", body: "Tiffin, meals, street food, sweets and the chains in town — with real portions like 1 katori or 2 idli." },
  { icon: MessageSquareText, title: "Type it like you'd say it", body: "“2 idli, sambar and a filter coffee” becomes three logged items." },
  { icon: Camera, title: "Snap your plate", body: "Take a photo and the app reads what's on it. You confirm, it logs." },
  { icon: PieChart, title: "Five meals, one budget", body: "Breakfast to dinner with your own calorie and protein targets." },
  { icon: Lightbulb, title: "Insights & 29 recipes", body: "Where the calories came from, healthier swaps and simple recipes." },
  { icon: Scale, title: "Weight, sleep, water, steps", body: "One home screen, with weekly trends your coach can see." },
];

export function FoodTracker({ foodCount }: { foodCount: number }) {
  const [q, setQ] = useState("");
  const [found, setFound] = useState<{ term: string; hits: Hit[]; hint: string | null }>({ term: "", hits: [], hint: null });
  const term = q.trim().toLowerCase();
  const fresh = found.term === term;
  const hits = term ? (fresh ? found.hits : cache.get(term) ?? found.hits) : [];
  const hint = term && fresh ? found.hint : null;
  const loading = !!term && !fresh && !cache.has(term);
  const [log, setLog] = useState<Logged[]>([]);
  const keyRef = useRef(0);
  const shown = useRef<HTMLSpanElement>(null);
  const tweened = useRef({ v: 0 });

  const total = log.reduce((a, f) => ({ kcal: a.kcal + f.kcal, protein: a.protein + f.protein, carbs: a.carbs + f.carbs, fat: a.fat + f.fat }), { kcal: 0, protein: 0, carbs: 0, fat: 0 });
  const rounded = Math.floor(foodCount / 100) * 100;

  // search as you type (debounced, cached, cancellable)
  useEffect(() => {
    if (!term || cache.has(term)) return;
    const ctrl = new AbortController();
    const id = setTimeout(async () => {
      try {
        const res = await fetch(`/api/food/search?q=${encodeURIComponent(term)}`, { signal: ctrl.signal });
        const data = (await res.json()) as { hits: Hit[]; didYouMean?: string };
        cache.set(term, data.hits);
        setFound({ term, hits: data.hits, hint: data.hits.length ? null : data.didYouMean ?? null });
      } catch {
        /* aborted or offline — keep the last results */
      }
    }, 160);
    return () => {
      clearTimeout(id);
      ctrl.abort();
    };
  }, [term]);

  // the big number counts to the new total
  useEffect(() => {
    const el = shown.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.textContent = total.kcal.toLocaleString("en-IN");
      return;
    }
    const tw = gsap.to(tweened.current, {
      v: total.kcal,
      duration: 0.8,
      ease: "power3.out",
      onUpdate: () => {
        el.textContent = Math.round(tweened.current.v).toLocaleString("en-IN");
      },
    });
    return () => void tw.kill();
  }, [total.kcal]);

  const add = (h: Hit) => {
    setLog((l) => [{ ...h, key: ++keyRef.current }, ...l].slice(0, 6));
  };
  const remove = (key: number) => setLog((l) => l.filter((f) => f.key !== key));

  const R = 54;
  const C = 2 * Math.PI * R;
  const frac = Math.min(1, total.kcal / BUDGET);
  const over = total.kcal > BUDGET;
  const macroTarget = { protein: 75, carbs: 190, fat: 50 };

  return (
    <section id="tracker" className="relative overflow-hidden py-20 sm:py-28">
      <div aria-hidden className="grid-paper pointer-events-none absolute inset-0 [mask-image:radial-gradient(60%_60%_at_75%_50%,#000_10%,transparent_70%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-x-16 lg:gap-y-10">
        <div className="lg:col-start-1 lg:row-start-1 lg:self-end">
          <p className="eyebrow">Free with membership · Fitness 7 app</p>
          <h2 data-reveal="lines" className="h-section mt-3 text-fg">
            Training is half of it. Know what&apos;s on your&nbsp;plate.
          </h2>
          <p data-reveal="up" className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-[17px]">
            Every member gets our calorie tracker — <b className="tnum text-fg">{rounded.toLocaleString("en-IN")}+</b> foods, built around how we actually eat here, so logging a meal takes seconds instead of guesswork.
          </p>
        </div>

        {/* live demo */}
        <div data-reveal="up" className="pane relative overflow-hidden p-5 sm:p-7 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted">Try it · today</p>
            {log.length ? (
              <button type="button" onClick={() => setLog([])} className="press text-xs font-semibold text-muted underline-offset-4 hover:text-fg hover:underline">
                Clear
              </button>
            ) : null}
          </div>

          <div className="mt-4 flex items-center gap-5 sm:gap-7">
            <div className="relative size-[132px] shrink-0 sm:size-[148px]">
              <svg viewBox="0 0 128 128" className="size-full -rotate-90">
                <circle cx="64" cy="64" r={R} fill="none" strokeWidth="11" style={{ stroke: "var(--p-line)" }} />
                <circle
                  cx="64"
                  cy="64"
                  r={R}
                  fill="none"
                  strokeWidth="11"
                  strokeLinecap="round"
                  strokeDasharray={C}
                  strokeDashoffset={C * (1 - frac)}
                  style={{ stroke: over ? "#e2452b" : "var(--p-brand)", transition: "stroke-dashoffset 0.8s cubic-bezier(.2,.8,.2,1), stroke 0.3s" }}
                />
              </svg>
              <div className="absolute inset-0 grid place-items-center text-center">
                <span>
                  <span ref={shown} className="cond tnum block text-[38px] leading-none text-fg">0</span>
                  <span className="tnum mt-1 block text-[11px] font-semibold text-muted">of {BUDGET.toLocaleString("en-IN")} kcal</span>
                </span>
              </div>
            </div>

            <dl className="min-w-0 flex-1 space-y-3">
              {(
                [
                  ["Protein", total.protein, macroTarget.protein, "#4b7c15"],
                  ["Carbs", total.carbs, macroTarget.carbs, "#d39b2a"],
                  ["Fats", total.fat, macroTarget.fat, "#e2452b"],
                ] as const
              ).map(([label, v, target, color]) => (
                <div key={label}>
                  <div className="flex items-baseline justify-between text-xs">
                    <dt className="font-semibold text-fg">{label}</dt>
                    <dd className="tnum text-muted">
                      <b className="text-fg">{Math.round(v)}</b> / {target} g
                    </dd>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-2">
                    <div className="h-full rounded-full transition-[width] duration-700 ease-out" style={{ width: `${Math.min(100, (v / target) * 100)}%`, background: color }} />
                  </div>
                </div>
              ))}
            </dl>
          </div>

          {/* search */}
          <label className="relative mt-6 block">
            <span className="sr-only">Search a food</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-muted" strokeWidth={2} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search a food — try “2 idli”"
              inputMode="search"
              autoComplete="off"
              className="h-13 w-full rounded-2xl border border-line bg-surface pl-11 pr-11 text-[15px] text-fg outline-none transition-shadow placeholder:text-muted focus:border-fg/40 focus:shadow-[0_0_0_4px_rgba(140,186,61,0.25)]"
              style={{ height: 52 }}
            />
            {loading ? <Loader2 className="absolute right-4 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted" /> : q ? (
              <button type="button" aria-label="Clear search" onClick={() => setQ("")} className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-fg">
                <X className="size-4" />
              </button>
            ) : null}
          </label>

          {!q ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {EXAMPLES.map((e) => (
                <button key={e} type="button" onClick={() => setQ(e)} className="press rounded-full bg-surface-2 px-3 py-1.5 text-xs font-semibold text-fg ring-1 ring-line transition-colors hover:bg-fg hover:text-paper">
                  {e}
                </button>
              ))}
            </div>
          ) : null}

          <ul className="mt-3 min-h-[60px] divide-y divide-line" aria-live="polite">
            {hits.map((h) => (
              <li key={h.id} className="flex items-center gap-3 py-2.5">
                <span aria-label={h.veg ? "Vegetarian" : "Non-vegetarian"} className={`grid size-4 shrink-0 place-items-center rounded-[4px] border-[1.5px] ${h.veg ? "border-[#2f9e44]" : "border-[#c2410c]"}`}>
                  <span className={`size-1.5 rounded-full ${h.veg ? "bg-[#2f9e44]" : "bg-[#c2410c]"}`} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-semibold text-fg">{h.name}</span>
                  <span className="tnum block truncate text-xs text-muted">
                    {h.serving}
                    {h.brand ? ` · ${h.brand}` : ""} · P {h.protein} · C {h.carbs} · F {h.fat}
                  </span>
                </span>
                <span className="cond tnum text-xl text-fg">{h.kcal}</span>
                <button type="button" aria-label={`Add ${h.name}`} onClick={() => add(h)} className="press grid size-10 shrink-0 place-items-center rounded-full bg-fg text-paper transition-transform hover:scale-105">
                  <Plus className="size-4" strokeWidth={2.6} />
                </button>
              </li>
            ))}
            {q && !loading && !hits.length ? (
              <li className="py-3 text-sm text-muted">{hint ? <>Did you mean <button type="button" className="font-semibold text-fg underline" onClick={() => setQ(hint)}>{hint}</button>?</> : "No match yet — in the app you can just describe it."}</li>
            ) : null}
          </ul>

          {log.length ? (
            <div className="mt-4 rounded-2xl bg-surface-2 p-3">
              <p className="px-1 text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Logged</p>
              <ul className="mt-1.5">
                {log.map((f) => (
                  <li key={f.key} className="flex animate-[fade_.35s_ease] items-center gap-2 px-1 py-1.5 text-sm">
                    <span className="min-w-0 flex-1 truncate text-fg">{f.name} <span className="text-muted">· {f.serving}</span></span>
                    <span className="tnum font-semibold text-fg">{f.kcal}</span>
                    <button type="button" aria-label={`Remove ${f.name}`} onClick={() => remove(f.key)} className="grid size-7 place-items-center rounded-full text-muted hover:bg-surface hover:text-fg">
                      <X className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <p className="mt-4 text-[11px] leading-relaxed text-muted">Values per serving from IFCT and recipe estimates. Nothing you try here is saved.</p>
        </div>
        <div className="lg:col-start-1 lg:row-start-2 lg:self-start">
          <ul data-reveal="stagger" className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-3.5">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-surface-2 ring-1 ring-line">
                  <Icon className="size-[18px] text-fg" strokeWidth={1.9} />
                </span>
                <span>
                  <span className="block text-[15px] font-bold text-fg">{title}</span>
                  <span className="mt-0.5 block text-sm leading-relaxed text-muted">{body}</span>
                </span>
              </li>
            ))}
          </ul>

          <div data-reveal="up" className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Magnetic>
              <a
                href={waLink("Hi Fitness 7! I'd like to join and use the calorie tracker in your app. What are the plans?")}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary h-14 w-full px-7 text-base sm:w-auto"
              >
                Join & get the app <ArrowRight className="size-4" strokeWidth={2.4} />
              </a>
            </Magnetic>
            <span className="text-sm text-muted">Included with every plan · no extra charge</span>
          </div>
        </div>

      </div>
    </section>
  );
}
