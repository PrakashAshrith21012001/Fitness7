"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight, Star, Snowflake, MapPin } from "lucide-react";
import { brand, contact, reviews, wa, bands } from "@f7/content";
import { HeroMedia } from "./HeroMedia";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Splits a line into words, each in its own mask, for the rise-in reveal. */
function MaskedWords({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className}>
      {text.split(" ").map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="inline-block overflow-hidden align-bottom"
          style={{ paddingBottom: "0.08em" }}
        >
          <span className="hero-word inline-block will-change-transform">{word}</span>
          {i < text.split(" ").length - 1 ? <span>&nbsp;</span> : null}
        </span>
      ))}
    </span>
  );
}

export function Hero() {
  const section = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          still: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { motion } = ctx.conditions as { motion: boolean };

          if (!motion) {
            // Final state, immediately. No entrance, no parallax.
            gsap.set(".hero-word", { yPercent: 0 });
            gsap.set(".hero-rise", { y: 0, opacity: 1 });
            return;
          }

          // Entrance
          const intro = gsap.timeline({ defaults: { ease: "expo.out" } });
          intro
            .fromTo(
              ".hero-word",
              { yPercent: 115 },
              { yPercent: 0, duration: 1.1, stagger: 0.07 },
            )
            .fromTo(
              ".hero-rise",
              { y: 26, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.8, stagger: 0.09 },
              "-=0.7",
            );

          // Scroll: copy lifts and fades as the floor keeps moving behind it,
          // which is what sells the depth between the two planes.
          gsap.to(".hero-layer", {
            yPercent: -14,
            opacity: 0,
            ease: "none",
            scrollTrigger: {
              trigger: section.current,
              start: "top top",
              end: "bottom top",
              scrub: 1,
            },
          });
        },
      );

      return () => mm.revert();
    },
    { scope: section },
  );

  return (
    <section
      id="top"
      ref={section}
      data-band-id="valley"
      className="relative flex min-h-svh flex-col justify-end overflow-hidden pb-14 pt-28 lg:justify-center lg:pb-0"
    >
      <HeroMedia sectionRef={section} />

      {/* Grade. This is what buys the contrast budget for everything above it. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--p-bg) 80%, transparent) 0%, color-mix(in srgb, var(--p-bg) 32%, transparent) 44%, color-mix(in srgb, var(--p-bg) 74%, transparent) 78%, var(--p-bg) 100%)",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 hidden lg:block"
        style={{
          background:
            "linear-gradient(90deg, color-mix(in srgb, var(--p-bg) 90%, transparent) 0%, color-mix(in srgb, var(--p-bg) 62%, transparent) 42%, transparent 80%)",
        }}
        aria-hidden="true"
      />

      <div className="hero-layer relative mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="lg:max-w-3xl">
          <h1 className="display text-[clamp(3.2rem,10.5vw,9rem)]">
            <span className="block">
              <MaskedWords text="The floor is" />
            </span>
            <span className="block text-lime">
              <MaskedWords text="just base camp." />
            </span>
          </h1>

          <p className="hero-rise mt-7 max-w-xl text-lg leading-relaxed text-white/85">
            Dharmapuri&apos;s strength and conditioning floor — and one hill trek
            every single month. You train down here so you can stand up there.
          </p>

          {/* The one glass element on the page. More than one and it reads cheap. */}
          <div className="hero-rise glass-panel mt-9 inline-flex flex-col gap-5 rounded-3xl p-5 sm:flex-row sm:items-center sm:gap-7 sm:p-6">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <span className="flex items-center gap-1.5">
                <Star className="size-4 fill-lime text-lime" strokeWidth={0} />
                <span className="text-sm font-bold text-white">{reviews.rating.toFixed(1)}</span>
                <span className="text-xs text-white/65">
                  · {reviews.count} {reviews.source} reviews
                </span>
              </span>
              <span className="hidden h-8 w-px bg-white/15 sm:block" />
              <span className="flex items-center gap-1.5 text-xs font-medium text-white/75">
                <MapPin className="size-3.5 text-lime" strokeWidth={2} />
                {contact.address.city}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-medium text-white/75">
                <Snowflake className="size-3.5 text-lime" strokeWidth={2} />
                Fully A/C
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href={wa.trial()}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex min-h-11 items-center gap-2 rounded-full bg-green px-6 py-3 text-sm font-bold text-on-accent transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]"
              >
                Free trial session
                <ArrowRight
                  className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                  strokeWidth={2.6}
                />
              </a>
              <a
                href="#pricing"
                className="inline-flex min-h-11 items-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-lime hover:text-lime"
              >
                Membership
              </a>
            </div>
          </div>

          <p className="hero-rise mt-6 text-[10px] font-bold uppercase tracking-[0.34em] text-white/70">
            {brand.tagline}
          </p>
        </div>
      </div>

      <span className="sr-only">
        {brand.fullName}, {contact.address.city} — {bands[0].altitude} m
      </span>
    </section>
  );
}
