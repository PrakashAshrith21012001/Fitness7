"use client";

import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { contact, telLink, wa } from "@f7/content";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { Magnetic } from "@/components/home/Magnetic";

/**
 * The page ends on its best offer (Peak–End Rule). The ink panel grows to
 * full width as it arrives, and the line scales up with it.
 */
export function Closing() {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        "[data-grow]",
        { clipPath: "inset(0% 6% 0% 6% round 36px)" },
        { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "none", scrollTrigger: { trigger: "[data-grow]", start: "top 95%", end: "top 35%", scrub: true } },
      );
      gsap.fromTo("[data-grow-text]", { scale: 0.9, opacity: 0.4 }, { scale: 1, opacity: 1, ease: "none", scrollTrigger: { trigger: "[data-grow]", start: "top 90%", end: "top 40%", scrub: true } });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="pt-10">
      <div data-grow className="bg-fg text-paper">
        <div data-grow-text className="mx-auto flex max-w-7xl flex-col items-start gap-10 px-5 py-24 sm:px-8 sm:py-32 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="h-hero max-w-4xl">
            Your first session is <span className="text-brand">on&nbsp;us.</span>
          </h2>
          <div className="flex w-full flex-col gap-4 sm:w-auto">
            <Magnetic>
              <a href={wa.trial()} target="_blank" rel="noopener noreferrer" className="press inline-flex h-16 w-full items-center justify-center gap-2 rounded-full bg-paper px-8 text-lg font-bold text-fg hover:opacity-90 sm:w-auto">
                Book a free session <ArrowRight className="size-5" strokeWidth={2.4} />
              </a>
            </Magnetic>
            <a href={telLink()} className="tnum text-center text-base text-paper/70 underline-offset-4 hover:text-paper hover:underline lg:text-right">
              or call {contact.phoneDisplay}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
