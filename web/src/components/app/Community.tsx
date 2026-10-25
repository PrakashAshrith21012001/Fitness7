import { Play, Quote } from "lucide-react";
import { brand, contact, fitEdit, peopleOf, testimonials } from "@f7/content";
import { photo } from "@/lib/photos";
import { Block, Photo, Scrim, SectionHead, Wrap } from "@/components/app/ui";

/**
 * The app's editorial rows: the short-video strip (F7 EDIT), "People of
 * Fitness 7" and Testimonials. Videos and people open the gym's Instagram,
 * where the real clips live.
 */

export function FitEdit() {
  return (
    <Block>
      <Wrap>
        <div className="mb-5 flex flex-col items-center text-center">
          <h2 className="text-3xl font-black tracking-[0.04em] text-white sm:text-4xl">F7 EDIT</h2>
          <p className="mt-1 text-sm text-muted">Everything you need to stay inspired & stay on top of your game</p>
        </div>
        <ul className="snap-row -mx-4 flex gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0">
          {fitEdit.map((v) => (
            <li key={v.id} className="w-[82vw] max-w-[420px] shrink-0 sm:w-auto sm:max-w-none">
              <a href={contact.instagram} target="_blank" rel="noopener noreferrer" className="group relative block aspect-[4/5] overflow-hidden rounded-[14px] bg-surface-2 text-[#fff]">
                <Photo src={photo(v.photo)} alt="" sizes="(min-width: 640px) 33vw, 82vw" className="transition-transform duration-700 group-hover:scale-[1.03]" />
                <Scrim />
                <span className="absolute left-1/2 top-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[rgba(255,255,255,0.22)] backdrop-blur transition-transform group-hover:scale-110">
                  <Play className="ml-0.5 size-6 fill-[#fff]" strokeWidth={0} />
                </span>
                <span className="absolute right-3 top-3 rounded bg-[rgba(9,12,28,0.7)] px-2 py-0.5 text-[11px] font-bold">{v.minutes} min</span>
                <div className="absolute inset-x-4 bottom-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[rgba(255,255,255,0.7)]">
                    {v.author} · {v.role}
                  </p>
                  <p className="mt-1 text-lg font-extrabold leading-snug">{v.title}</p>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </Wrap>
    </Block>
  );
}

export function People() {
  return (
    <Block id="people">
      <Wrap>
        <SectionHead title={`People of ${brand.name}`} href={contact.instagram} hrefLabel="Instagram" />
        <div className="grid gap-3 lg:grid-cols-[1fr_1fr_1.3fr] lg:gap-4">
          {peopleOf.map((p) => (
            <a key={p.id} href={contact.instagram} target="_blank" rel="noopener noreferrer" className="group relative block h-[280px] overflow-hidden rounded-[14px] bg-surface-2 text-[#fff] lg:h-auto lg:min-h-[420px]">
              <Photo src={photo(p.photo)} alt="" sizes="(min-width: 1024px) 380px, 100vw" className="transition-transform duration-700 group-hover:scale-[1.03]" />
              <Scrim />
              <div className="absolute inset-x-4 bottom-4">
                <p className="text-xl font-extrabold">{p.name}</p>
                <p className="mt-0.5 text-[13px] text-[rgba(255,255,255,0.8)]">{p.line}</p>
              </div>
            </a>
          ))}

          <div className="pane p-5 sm:p-6">
            <h3 className="text-center text-xl font-extrabold text-white lg:text-left">Testimonials</h3>
            <ul className="mt-4 flex flex-col gap-5">
              {testimonials.slice(0, 3).map((t) => (
                <li key={t.id} className="border-t border-line pt-4 first:border-0 first:pt-0">
                  <Quote className="size-5 text-pink" strokeWidth={0} fill="currentColor" />
                  <p className="mt-1.5 text-[14px] italic leading-relaxed text-white/85">{t.quote}</p>
                  <p className="mt-2 text-[13px] font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-muted">
                    {t.detail} · {t.since}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Wrap>
    </Block>
  );
}
