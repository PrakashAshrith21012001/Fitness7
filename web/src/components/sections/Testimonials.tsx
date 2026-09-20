import { Star } from "lucide-react";
import { testimonials, reviews } from "@f7/content";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

export function Testimonials() {
  return (
    <Section>
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeading eyebrow="Members" title="People who stayed" />
        <Reveal delay={0.1}>
          <div className="flex items-center gap-5 rounded-3xl border border-line bg-surface/50 px-7 py-5">
            <span className="display text-6xl text-lime">{reviews.rating.toFixed(1)}</span>
            <span>
              <span className="flex gap-0.5" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className="size-3.5 fill-lime text-lime" strokeWidth={0} />
                ))}
              </span>
              <span className="mt-1 block text-sm font-semibold text-white">
                {reviews.count} {reviews.source} reviews
              </span>
              <span className="block text-xs text-muted">Every one of them five stars</span>
            </span>
          </div>
        </Reveal>
      </div>

      <div className="mt-16 grid gap-6 sm:grid-cols-2">
        {testimonials.map((t, i) => (
          <Reveal key={t.id} delay={(i % 2) * 0.08}>
            <figure className="flex h-full flex-col rounded-3xl border border-line bg-surface/50 p-8 transition-colors duration-500 hover:border-lime/30">
              <div className="flex gap-0.5" aria-label="Five out of five">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className="size-3.5 fill-lime text-lime" strokeWidth={0} />
                ))}
              </div>
              <blockquote className="mt-5 flex-1 text-lg leading-relaxed text-white/85">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-7 border-t border-line pt-5">
                <p className="font-semibold tracking-tight text-white">{t.name}</p>
                <p className="mt-0.5 text-xs text-lime">{t.detail}</p>
                <p className="mt-0.5 text-[11px] text-muted">{t.since}</p>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
