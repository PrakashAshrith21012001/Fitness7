import { ClipboardList, Salad, Scale, TrendingUp, type LucideIcon } from "lucide-react";
import { brand, trainers, transformCopy, wa } from "@f7/content";
import { classPhoto } from "@/lib/photos";
import { Photo, Wrap } from "@/components/app/ui";
import { SectionHeader } from "@/components/site/SectionHeader";

/**
 * Personal training and weight-loss coaching in one place — they were two
 * sections saying the same thing. Coaches on one side, what you get on the
 * other, one way to start (Occam's Razor, Law of Common Region).
 */
const ICONS: LucideIcon[] = [Scale, ClipboardList, Salad, TrendingUp];

export function Coaching() {
  return (
    <section id="coaching" className="pt-16 sm:pt-24">
      <Wrap>
        <SectionHeader
          kicker="Coaching"
          title="A coach who knows your name"
          sub="Personal training and weight-loss coaching, planned around your numbers and your schedule."
        />
        <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
          <ul className="grid gap-3 sm:grid-cols-2">
            {trainers.map((t, i) => (
              <li key={t.id} className="relative h-[340px] overflow-hidden rounded-[14px] bg-surface-2 text-[#fff] sm:h-[400px]">
                <Photo src={i === 0 ? classPhoto("personal") : classPhoto("strength")} alt="" sizes="(min-width: 1024px) 340px, (min-width: 640px) 50vw, 100vw" />
                <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(9,12,28,0) 40%, rgba(9,12,28,0.94) 100%)" }} />
                <div className="absolute inset-x-4 bottom-4">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#ffc857]">
                    {t.role} · <span className="tnum">{t.experienceYears}+</span> yrs
                  </p>
                  <h3 className="mt-1 text-2xl font-extrabold">{t.name}</h3>
                  <p className="mt-1 line-clamp-2 text-[13px] text-[rgba(255,255,255,0.8)]">{t.bio}</p>
                  <p className="mt-2 flex flex-wrap gap-1.5">
                    {t.specialities.map((s) => (
                      <span key={s} className="rounded-full bg-[rgba(255,255,255,0.14)] px-2.5 py-1 text-[11px] font-semibold">{s}</span>
                    ))}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="pane flex flex-col p-5 sm:p-6">
            <p className="label">What you get</p>
            <ul className="mt-4 flex flex-col gap-4">
              {transformCopy.whatYouGet.map((x, i) => {
                const Icon = ICONS[i % ICONS.length];
                return (
                  <li key={x.title} className="flex gap-3.5">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--color-green)_16%,transparent)]">
                      <Icon className="size-[18px] text-green" strokeWidth={1.9} />
                    </span>
                    <span>
                      <span className="block text-[15px] font-semibold text-white">{x.title}</span>
                      <span className="mt-0.5 block text-[13px] leading-relaxed text-muted">{x.sub}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
            <div className="mt-6 flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between lg:flex-col lg:items-stretch">
              <p className="text-sm text-muted">
                Coaching from <span className="tnum text-lg font-extrabold text-white">{transformCopy.priceFrom.split(" ")[0]}</span> / month
              </p>
              <a
                href={wa.personalTraining()}
                target="_blank"
                rel="noopener noreferrer"
                className="press flex h-12 items-center justify-center rounded-lg bg-white px-5 text-[13px] font-extrabold uppercase tracking-[0.06em] text-ink"
              >
                Talk to a {brand.name} coach
              </a>
            </div>
          </div>
        </div>
      </Wrap>
    </section>
  );
}
