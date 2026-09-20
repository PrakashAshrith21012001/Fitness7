import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

const steps = [
  {
    when: "Day 1",
    title: "Induction",
    body: "A coach walks you round the floor, the machines and the free weights, then writes you a starting programme. Free, whether you join or not.",
  },
  {
    when: "Week 1",
    title: "Programme",
    body: "Three or four sessions with your name on them. A coach on the floor watches the bar path so the habit forms on good technique.",
  },
  {
    when: "Week 4",
    title: "Review",
    body: "Weight, measurements, the numbers on the bar. The programme changes to match — and the first trek slot opens up.",
  },
];

/** The "infuse → rest → bottle" timeline from the reference, for a first month. */
export function Process() {
  return (
    <Section className="border-y border-line bg-surface/30">
      <SectionHeading eyebrow="How it starts" title="Your first thirty days" />
      <ol className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-line bg-line md:grid-cols-3">
        {steps.map((s, i) => (
          <Reveal key={s.title} delay={i * 0.1} className="flex bg-ink">
            <li className="relative flex-1 p-8">
              <span className="absolute right-8 top-8 display text-6xl text-white/[0.06]">
                0{i + 1}
              </span>
              <span className="eyebrow">{s.when}</span>
              <h3 className="display mt-4 text-4xl">{s.title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-muted">{s.body}</p>
              <span className="mt-8 block h-px w-full bg-line">
                <span
                  className="block h-full bg-green"
                  style={{ width: `${((i + 1) / steps.length) * 100}%` }}
                />
              </span>
            </li>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}
