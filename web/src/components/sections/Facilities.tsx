import { facilities } from "@f7/content";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/Icon";

export function Facilities() {
  return (
    <Section>
      <SectionHeading
        eyebrow="The floor"
        title="What you get for the money"
      />
      <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {facilities.map((f, i) => (
          <Reveal key={f.name} delay={(i % 4) * 0.05} className="bg-ink">
            <div className="group h-full p-7 transition-colors duration-300 hover:bg-surface">
              <Icon
                name={f.icon}
                className="size-6 text-lime transition-transform duration-300 group-hover:scale-110"
              />
              <h3 className="mt-5 font-semibold tracking-tight text-white">{f.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.detail}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
