import { ClipboardList, FastForward, ShieldPlus, Timer, type LucideIcon } from "lucide-react";
import { brand, trainers, wa } from "@f7/content";
import { classPhoto } from "@/lib/photos";
import { Block, Photo, Scrim, SectionHead, Wrap } from "@/components/app/ui";

/** Fitness → "Personal Training @ Gym" facts and the "Trainers at Fitness 7" cards. */

const FACTS: [LucideIcon, string, string][] = [
  [Timer, "50 mins", "dedicated sessions"],
  [ClipboardList, "Goal", "based workouts"],
  [FastForward, "Faster", "& better results"],
  [ShieldPlus, "Reduced", "risk of injury"],
];

export function Coaches() {
  return (
    <Block id="coaches">
      <Wrap>
        <SectionHead title="Personal Training @ Gym" center />
        <ul className="grid grid-cols-4 gap-2 sm:mx-auto sm:max-w-3xl">
          {FACTS.map(([Icon, a, b]) => (
            <li key={a} className="flex flex-col items-center gap-1.5 text-center">
              <Icon className="size-6 text-gold" strokeWidth={1.7} />
              <span className="text-xs font-extrabold text-white sm:text-sm">{a}</span>
              <span className="text-[11px] text-muted sm:text-xs">{b}</span>
            </li>
          ))}
        </ul>

        <div className="mt-12">
          <SectionHead
            title={
              <>
                Trainers at <span className="border-b-2 border-white pb-0.5">{brand.name}</span>
              </>
            }
            href={wa.personalTraining()}
            hrefLabel="Talk to a coach"
          />
          <ul className="snap-row -mx-4 flex gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
            {trainers.map((tr, i) => (
              <li key={tr.id} className="relative h-[360px] w-[82vw] max-w-[420px] shrink-0 overflow-hidden rounded-[14px] bg-surface-2 text-[#fff] sm:w-auto sm:max-w-none">
                <Photo src={i === 0 ? classPhoto("personal") : classPhoto("strength")} alt="" sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 82vw" />
                <Scrim />
                <span className="absolute left-3 top-3 rounded bg-[rgba(255,200,87,0.18)] px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#ffc857] backdrop-blur">
                  ★ {tr.role} · {tr.experienceYears}+ yrs
                </span>
                <div className="absolute inset-x-3.5 bottom-4 flex flex-col items-center text-center">
                  <p className="text-[22px] font-black uppercase tracking-[0.1em]">{tr.name}</p>
                  <p className="mt-1 line-clamp-2 text-[13px] text-[rgba(255,255,255,0.8)]">{tr.bio}</p>
                  <p className="mt-1 text-xs text-[rgba(255,255,255,0.65)]">{tr.specialities.join(" • ")}</p>
                  <a
                    href={wa.trial()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3.5 inline-flex h-9 items-center rounded-lg bg-[#fff] px-4 text-xs font-extrabold uppercase tracking-[0.06em] text-pink"
                  >
                    Try for free
                  </a>
                </div>
              </li>
            ))}
            <li className="pane hidden h-[360px] flex-col items-center justify-center gap-3 p-6 text-center lg:flex">
              <p className="text-lg font-extrabold text-white">One coach, one plan, your name on it.</p>
              <p className="text-sm text-muted">Assessment, a written programme and a coach in the room for every session. Diet guidance included.</p>
              <a href={wa.personalTraining()} target="_blank" rel="noopener noreferrer" className="btn-pink mt-2 inline-flex h-11 items-center px-5">
                Talk to a coach
              </a>
            </li>
          </ul>
        </div>
      </Wrap>
    </Block>
  );
}
