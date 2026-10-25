import { ChevronRight, Gift } from "lucide-react";
import { brand, memberPlansCopy, trialOffer, wa, waLink } from "@f7/content";
import { photo } from "@/lib/photos";
import { Block, Photo, Price, SectionHead, Wrap } from "@/components/app/ui";

/**
 * "Explore F7 pass" — the app's plan rows (round photo, name, one line,
 * price) — next to the free-trial card, then the store strip. Every row
 * opens WhatsApp with that plan named; the Store launches as order on
 * WhatsApp, pay at the desk.
 */
export function Plans() {
  return (
    <Block id="plans">
      <Wrap>
        <SectionHead title="Explore F7 pass" sub="No joining fee. Your first session is free." />
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <ul className="flex flex-col gap-2.5">
            {memberPlansCopy.items.map((p) => (
              <li key={p.id}>
                <a
                  href={waLink(`Hi ${brand.name}! I'm interested in ${p.name} (${p.price.replace("*", "")}). Could you tell me the next steps?`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pane flex items-center gap-3.5 p-3.5 transition-colors hover:bg-surface-2"
                >
                  <span className="relative size-[62px] shrink-0 overflow-hidden rounded-full bg-surface-2">
                    <Photo src={photo(p.photo)} alt="" sizes="62px" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold text-white">{p.name}</span>
                    <span className="mt-0.5 line-clamp-2 block text-[13px] text-muted">{p.sub}</span>
                    <span className="mt-1.5 block">
                      <Price value={p.price} note={p.note} />
                    </span>
                  </span>
                  <ChevronRight className="size-5 shrink-0 text-muted" strokeWidth={2} />
                </a>
              </li>
            ))}
            <li className="px-1 text-[11px] text-muted">*Starting prices — confirm at the desk.</li>
          </ul>

          <div className="flex flex-col gap-4">
            <div data-tone="dark" className="relative min-h-[300px] flex-1 overflow-hidden rounded-[14px] text-white">
              <Photo src={photo("discover-pt")} alt="" sizes="(min-width: 1024px) 480px, 100vw" />
              <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(9,12,28,0.1) 20%, rgba(9,12,28,0.92) 100%)" }} />
              <div className="absolute inset-x-5 bottom-5">
                <span className="inline-flex items-center gap-1.5 rounded bg-[rgba(61,220,132,0.18)] px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#3ddc84]">
                  <Gift className="size-3" strokeWidth={2.4} /> Free
                </span>
                <p className="mt-2 text-2xl font-extrabold leading-tight">{trialOffer.title}</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-[rgba(255,255,255,0.8)]">{trialOffer.body}</p>
                <a href={wa.trial()} target="_blank" rel="noopener noreferrer" className="btn-pink mt-4 inline-flex h-11 items-center px-5">
                  {trialOffer.cta}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- store strip ---------- */}
        <a
          id="shop"
          href={waLink(`Hi ${brand.name}! I'd like to order from the store. Item: `)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 flex scroll-mt-24 items-center gap-3.5"
          aria-label="Order from the Fitness 7 store on WhatsApp"
        >
          <span className="relative size-16 shrink-0 overflow-hidden rounded-[14px] bg-surface-2 sm:h-16 sm:w-40">
            <Photo src={photo("store-strip")} alt="" sizes="160px" />
          </span>
          <span
            className="flex h-11 flex-1 items-center justify-between rounded-full px-4 text-[13px] font-bold text-[#fff] sm:h-14 sm:px-6 sm:text-base"
            style={{ background: "linear-gradient(90deg, #5b1d8f, #c11e5e)" }}
          >
            <span>
              Your one-stop fitness store nearby<span className="hidden sm:inline"> — order on WhatsApp, pay at the desk</span>
            </span>
            <ChevronRight className="size-4 shrink-0" strokeWidth={2.4} />
          </span>
        </a>
      </Wrap>
    </Block>
  );
}
