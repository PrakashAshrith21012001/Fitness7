import { Star } from "lucide-react";
import { contact, faqs, peopleOf, reviews, testimonials } from "@f7/content";
import { photo } from "@/lib/photos";
import { Photo, Wrap } from "@/components/app/ui";
import { SectionHeader } from "@/components/site/SectionHeader";

/** Social proof right before the questions and the visit card — trust, then the ask. */
export function Reviews() {
  return (
    <section id="reviews" className="pt-16 sm:pt-24">
      <Wrap>
        <SectionHeader
          kicker="Members"
          title="What people say after a few months"
          action={
            <a href={contact.mapsUrl} target="_blank" rel="noopener noreferrer" className="press flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-2.5 hover:bg-surface-2">
              <span className="tnum text-3xl font-extrabold text-white">{reviews.rating.toFixed(1)}</span>
              <span>
                <span className="flex" aria-hidden>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className="size-3.5 fill-[#ffc857] text-[#ffc857]" strokeWidth={0} />
                  ))}
                </span>
                <span className="tnum block text-xs text-muted">{reviews.count} Google reviews</span>
              </span>
            </a>
          }
        />
        <div className="grid gap-3 lg:grid-cols-[1fr_1fr_1.4fr]">
          {peopleOf.map((p) => (
            <figure key={p.id} className="relative h-[260px] overflow-hidden rounded-[14px] bg-surface-2 text-[#fff] lg:h-auto lg:min-h-[380px]">
              <Photo src={photo(p.photo)} alt="" sizes="(min-width: 1024px) 360px, 100vw" />
              <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(9,12,28,0) 45%, rgba(9,12,28,0.92) 100%)" }} />
              <figcaption className="absolute inset-x-4 bottom-4">
                <p className="text-lg font-extrabold">{p.name}</p>
                <p className="text-[13px] text-[rgba(255,255,255,0.8)]">{p.line}</p>
              </figcaption>
            </figure>
          ))}
          <ul className="flex flex-col gap-3">
            {testimonials.slice(0, 3).map((t) => (
              <li key={t.id} className="pane p-4">
                <blockquote className="text-[14px] leading-relaxed text-white/90">“{t.quote}”</blockquote>
                <p className="mt-2 text-[13px] font-semibold text-white">
                  {t.name} <span className="font-normal text-muted">· {t.detail}</span>
                </p>
              </li>
            ))}
          </ul>
        </div>
      </Wrap>
    </section>
  );
}

/** Questions as native disclosure widgets: keyboard, screen readers and find-in-page all just work. */
export function Faq() {
  return (
    <section id="faq" className="pt-16 sm:pt-24">
      <Wrap className="max-w-3xl">
        <SectionHeader kicker="Questions" title="Before you come in" />
        <div className="pane divide-y divide-line overflow-hidden">
          {faqs.map((f) => (
            <details key={f.q} className="group">
              <summary className="flex min-h-14 list-none items-center gap-3 px-4 py-3 text-[15px] font-semibold text-white hover:bg-surface sm:px-5 [&::-webkit-details-marker]:hidden">
                <span className="flex-1">{f.q}</span>
                <span aria-hidden className="grid size-7 place-items-center rounded-full bg-surface-2 text-lg leading-none text-white transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="px-4 pb-4 text-sm leading-relaxed text-muted sm:px-5">{f.a}</p>
            </details>
          ))}
        </div>
      </Wrap>
    </section>
  );
}
