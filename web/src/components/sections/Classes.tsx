"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUpRight, Clock } from "lucide-react";
import { classes, wa } from "@f7/content";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

const intensityStyles: Record<string, string> = {
  Low: "text-muted border-line bg-white/[0.03]",
  Moderate: "text-amber-300 border-amber-300/25 bg-amber-300/5",
  High: "text-red-400 border-red-400/25 bg-red-400/5",
  "All levels": "text-lime border-lime/25 bg-green/5",
};

export function Classes() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <Section id="classes">
      <SectionHeading
        eyebrow="What we run"
        title="Eight ways to get strong"
        body="Every class is coached — not a room with music and a timer. Pick one, or move between them as your programme changes."
      />

      <div className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {classes.map((cls, i) => {
          const isOpen = active === cls.id;
          return (
            <Reveal key={cls.id} delay={(i % 4) * 0.06} className="flex bg-ink">
              <button
                type="button"
                onClick={() => setActive(isOpen ? null : cls.id)}
                aria-expanded={isOpen}
                className="group relative flex h-full w-full flex-col p-7 text-left transition-colors duration-300 hover:bg-surface"
              >
                <span className="pointer-events-none absolute inset-x-0 top-0 h-px scale-x-0 bg-green transition-transform duration-500 group-hover:scale-x-100" />

                <span className="mb-6 inline-flex size-12 items-center justify-center rounded-2xl border border-line bg-surface text-lime transition-all duration-300 group-hover:border-lime/40 group-hover:bg-green/10">
                  <Icon name={cls.icon} className="size-5" />
                </span>

                <h3 className="text-lg font-semibold tracking-tight text-white">
                  {cls.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {cls.tagline}
                </p>

                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pt-4 text-sm leading-relaxed text-white/70">
                        {cls.description}
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                <div className="mt-6 flex flex-wrap items-center gap-2 pt-4">
                  <span
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider",
                      intensityStyles[cls.intensity],
                    )}
                  >
                    {cls.intensity}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted">
                    <Clock className="size-3" strokeWidth={2} />
                    {cls.durationMin} min
                  </span>
                </div>

                <p className="mt-3 text-[11px] font-medium leading-relaxed text-white/45">
                  {cls.schedule}
                </p>

                <span className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-lime opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {isOpen ? "Show less" : "Read more"}
                </span>
              </button>
            </Reveal>
          );
        })}
      </div>

      <Reveal delay={0.1}>
        <div className="mt-10 flex justify-center">
          <a
            href={wa.general()}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-white transition-colors hover:text-lime"
          >
            Not sure which one suits you? Ask a coach on WhatsApp
            <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2.2} />
          </a>
        </div>
      </Reveal>
    </Section>
  );
}
