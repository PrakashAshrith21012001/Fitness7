"use client";

import { trainers, wa } from "@f7/content";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowUpRight } from "lucide-react";

function initials(name: string) {
  return name
    .replace(/^Coach\s+/i, "")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Trainers() {
  return (
    <Section id="trainers" className="border-y border-line bg-surface/30">
      <SectionHeading
        eyebrow="Who's on the floor"
        title="Coaches, not supervisors"
        body="Somebody is always watching your bar path. Karthick and Durai run every session on the floor — strength, conditioning, functional work and mobility."
      />

      <div className="mt-16 grid gap-6 md:grid-cols-2">
        {trainers.map((trainer, i) => (
          <Reveal key={trainer.id} delay={i * 0.08}>
            <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-ink transition-all duration-500 hover:border-lime/40 sm:flex-row">
              {/* Portrait placeholder — drop real photos into /public/trainers */}
              <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-br from-surface-2 via-surface to-ink sm:aspect-auto sm:w-2/5">
                <span className="display text-7xl text-white/[0.07] transition-transform duration-700 group-hover:scale-110">
                  {initials(trainer.name)}
                </span>
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink to-transparent" />
                <span className="absolute left-5 top-5 rounded-full border border-lime/30 bg-green/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-lime">
                  {trainer.experienceYears} yrs
                </span>
              </div>

              <div className="flex-1 p-6 sm:p-8">
                <h3 className="text-lg font-semibold tracking-tight text-white">
                  {trainer.name}
                </h3>
                <p className="mt-1 text-xs font-medium uppercase tracking-wider text-lime">
                  {trainer.role}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-muted">{trainer.bio}</p>

                <ul className="mt-5 flex flex-wrap gap-1.5">
                  {trainer.specialities.map((s) => (
                    <li
                      key={s}
                      className="rounded-full border border-line px-2.5 py-1 text-[10px] font-medium text-white/60"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.1}>
        <div className="mt-10 flex justify-center">
          <a
            href={wa.personalTraining()}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-white transition-colors hover:text-lime"
          >
            Work with one of them one-to-one
            <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2.2} />
          </a>
        </div>
      </Reveal>
    </Section>
  );
}
