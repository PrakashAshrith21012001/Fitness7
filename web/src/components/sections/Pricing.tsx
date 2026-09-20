"use client";

import { Check, ArrowUpRight } from "lucide-react";
import { plans, trialOffer, inr, wa } from "@f7/content";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

export function Pricing() {
  return (
    <Section id="pricing" className="border-y border-line bg-surface/30">
      <SectionHeading
        eyebrow="Membership"
        title="No joining fee. No lock-in you didn't ask for."
        body="One price, everything included — classes, coaching, lockers and showers. The only thing charged separately is personal training."
        align="center"
      />

      <div className="mt-16 grid gap-6 lg:grid-cols-4">
        {plans.map((plan, i) => (
          <Reveal key={plan.id} delay={i * 0.07}>
            <article
              className={cn(
                "relative flex h-full flex-col rounded-3xl border p-8 transition-all duration-500",
                plan.highlight
                  ? "border-beam border-lime/40 bg-green/[0.04] lime-glow"
                  : "border-line bg-ink hover:border-white/20",
              )}
            >
              {plan.badge ? (
                <span
                  className={cn(
                    "absolute -top-3 left-8 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider",
                    plan.highlight ? "btn-green" : "bg-surface-2 text-white/70 border border-line",
                  )}
                >
                  {plan.badge}
                </span>
              ) : null}

              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">
                {plan.name}
              </h3>

              <div className="mt-5 flex items-end gap-2">
                <span className="display text-5xl text-white">{inr(plan.priceINR)}</span>
                {plan.compareAtINR ? (
                  <span className="mb-1.5 text-sm text-muted line-through">
                    {inr(plan.compareAtINR)}
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-xs font-medium text-muted">{plan.period}</p>

              <p className="mt-5 text-sm leading-relaxed text-white/60">{plan.summary}</p>

              <ul className="mt-7 flex flex-1 flex-col gap-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-white/75">
                    <Check
                      className={cn(
                        "mt-0.5 size-4 shrink-0",
                        plan.highlight ? "text-lime" : "text-white/40",
                      )}
                      strokeWidth={2.4}
                    />
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href={wa.plan(plan)}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "group mt-8 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition-all duration-300",
                  plan.highlight
                    ? "btn-green hover:bg-white"
                    : "border border-line text-white hover:border-lime hover:text-lime",
                )}
              >
                Choose {plan.name}
                <ArrowUpRight
                  className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  strokeWidth={2.4}
                />
              </a>
            </article>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.12}>
        <div className="mt-12 flex flex-col items-center gap-5 rounded-3xl border border-line bg-ink px-8 py-10 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h3 className="display text-3xl">{trialOffer.title}</h3>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
              {trialOffer.body}
            </p>
          </div>
          <a
            href={wa.trial()}
            target="_blank"
            rel="noopener noreferrer"
            className="shimmer-btn shrink-0 rounded-full px-8 py-4 font-semibold text-on-accent transition-transform hover:scale-[1.02]"
          >
            {trialOffer.cta}
          </a>
        </div>
      </Reveal>
    </Section>
  );
}
