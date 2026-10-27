import { ArrowRight } from "lucide-react";
import { contact, telLink, wa } from "@f7/content";
import { photo } from "@/lib/photos";
import { Photo, Wrap } from "@/components/app/ui";

/**
 * The last thing on the page is the best thing on offer (Peak–End Rule):
 * a free session, one button, and the phone number for people who'd rather call.
 */
export function FinalCta() {
  return (
    <section className="pt-16 sm:pt-24">
      <Wrap>
        <div data-tone="dark" className="squircle relative overflow-hidden rounded-[22px] text-white">
          <Photo src={photo("hero-pt")} alt="" sizes="(min-width: 1280px) 1216px, 100vw" className="object-[center_35%]" />
          <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(9,12,28,0.95) 0%, rgba(9,12,28,0.8) 50%, rgba(9,12,28,0.35) 100%)" }} />
          <div className="relative max-w-xl px-6 py-14 sm:px-10 sm:py-20">
            <h2 className="text-3xl font-extrabold leading-tight tracking-[-0.02em] sm:text-5xl">Your first session is on us.</h2>
            <p className="mt-3 text-base text-[rgba(255,255,255,0.8)]">Train a full session with a coach on the floor. No card, no sign-up — decide after.</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a href={wa.trial()} target="_blank" rel="noopener noreferrer" className="btn-pink press flex h-12 items-center justify-center gap-2 px-6">
                Book your free session <ArrowRight className="size-4" strokeWidth={2.4} />
              </a>
              <a href={telLink()} className="tnum flex h-12 items-center justify-center px-2 text-sm font-semibold text-[rgba(255,255,255,0.85)] underline-offset-4 hover:underline">
                or call {contact.phoneDisplay}
              </a>
            </div>
          </div>
        </div>
      </Wrap>
    </section>
  );
}
