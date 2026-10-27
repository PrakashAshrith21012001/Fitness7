"use client";

import { useRef } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { trainers, transformCopy, wa } from "@f7/content";
import { classPhoto } from "@/lib/photos";
import { BLUR } from "@/lib/blur";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

/**
 * Coaching: one photograph that opens up as it scrolls in (clip-path wipe),
 * the coaches as a short roster, and what personal training actually gives
 * you — four lines, one price, one button.
 */
export function Coaching() {
  const root = useRef<HTMLElement>(null);
  const src = classPhoto("personal");

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        "[data-wipe]",
        { clipPath: "inset(18% 12% 18% 12% round 28px)" },
        { clipPath: "inset(0% 0% 0% 0% round 28px)", ease: "none", scrollTrigger: { trigger: "[data-wipe]", start: "top 90%", end: "top 30%", scrub: true } },
      );
      gsap.fromTo("[data-wipe-img]", { scale: 1.25 }, { scale: 1, ease: "none", scrollTrigger: { trigger: "[data-wipe]", start: "top 90%", end: "bottom 20%", scrub: true } });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="coaching" className="py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:items-center lg:gap-20">
        <div data-wipe className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-deep">
          <div data-wipe-img className="absolute inset-0">
            <Image src={src} alt="A Fitness 7 coach guiding a member through a lunge" fill sizes="(min-width: 1024px) 600px, 100vw" placeholder="blur" blurDataURL={BLUR[src]} className="object-cover" />
          </div>
        </div>

        <div>
          <p className="eyebrow">Coaching</p>
          <h2 data-reveal="lines" className="h-section mt-3 text-fg">
            A coach who knows your name.
          </h2>
          <p data-reveal="up" className="mt-5 max-w-md text-base leading-relaxed text-muted">
            Personal training and weight-loss coaching, planned around your numbers, your slot and your goal — and reviewed every week.
          </p>

          <ul data-reveal="stagger" className="mt-8 grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {transformCopy.whatYouGet.map((x, i) => (
              <li key={x.title} className="border-t border-fg pt-4">
                <span className="cond tnum text-sm text-muted">0{i + 1}</span>
                <p className="mt-1 text-base font-bold text-fg">{x.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{x.sub}</p>
              </li>
            ))}
          </ul>

          <div className="mt-10 rounded-[20px] bg-surface p-5 ring-1 ring-line sm:p-6">
            <p className="eyebrow">Your coaches</p>
            <ul className="mt-3 divide-y divide-line">
              {trainers.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-4 py-3">
                  <span>
                    <span className="block text-lg font-extrabold text-fg">{t.name}</span>
                    <span className="block text-sm text-muted">{t.specialities.join(" · ")}</span>
                  </span>
                  <span className="tnum shrink-0 text-right text-sm text-muted">
                    {t.role}
                    <span className="block font-semibold text-fg">{t.experienceYears}+ yrs</span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted">
                Coaching from <span className="tnum text-xl font-extrabold text-fg">{transformCopy.priceFrom.split(" ")[0]}</span> / month
              </p>
              <a href={wa.personalTraining()} target="_blank" rel="noopener noreferrer" className="btn-primary h-12 px-6 text-sm">
                Talk to a coach <ArrowRight className="size-4" strokeWidth={2.4} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
