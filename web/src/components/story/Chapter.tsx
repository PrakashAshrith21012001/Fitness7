"use client";

import type { ReactNode } from "react";
import { Reveal, RevealWords } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";
import type { BandId } from "@f7/content";
import { LoopVideo } from "@/components/ui/LoopVideo";

/**
 * One full-height chapter of the story. The copy sits on the side the
 * dumbbell has left free; the other side is kept open for it.
 */
export function Chapter({
  number,
  band,
  altitude,
  eyebrow,
  title,
  accentWord,
  body,
  points,
  side,
  media,
  children,
}: {
  number: string;
  band: BandId;
  /** Metres, shown beside the chapter number */
  altitude: number;
  eyebrow: string;
  title: string;
  /** A word inside `title` to paint in the accent colour */
  accentWord?: string;
  body: string;
  points: string[];
  side: "left" | "right";
  /** Looping clip shown on the side the copy leaves free */
  media?: { src: string; poster: string };
  children?: ReactNode;
}) {
  const parts = accentWord ? title.split(accentWord) : [title];

  return (
    <section
      data-band-id={band}
      className="relative flex min-h-svh items-end pb-24 pt-[34svh] lg:items-start lg:pb-0 lg:pt-[19svh]"
    >
      {media ? (
        <div
          className={cn(
            "chapter-media pointer-events-none absolute inset-y-0 hidden w-[58%] lg:block",
            side === "right" ? "left-0" : "right-0",
          )}
          aria-hidden="true"
        >
          <LoopVideo
            src={media.src}
            poster={media.poster}
            className="size-full object-cover"
            style={{
              maskImage: "radial-gradient(ellipse 60% 55% at 50% 50%, #000 35%, transparent 75%)",
              WebkitMaskImage: "radial-gradient(ellipse 60% 55% at 50% 50%, #000 35%, transparent 75%)",
            }}
          />
        </div>
      ) : null}

      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div
          className={cn(
            "lg:grid lg:grid-cols-2 lg:gap-16",
            side === "right" && "lg:[&>*]:col-start-2",
          )}
        >
          <div>
            <Reveal>
              <div className="flex items-center gap-4">
                <span className="display text-5xl text-lime sm:text-6xl">{number}</span>
                <span className="h-px w-12 bg-line" />
                <span className="eyebrow">{eyebrow}</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted">
                  {altitude.toLocaleString("en-IN")} m
                </span>
              </div>
            </Reveal>

            <h2 className="display mt-6 max-w-[16ch] text-[clamp(2.4rem,5.6vw,4.6rem)]">
              {parts.length === 2 ? (
                <>
                  <RevealWords text={parts[0].trim()} />{" "}
                  <span className="text-lime">
                    <RevealWords text={accentWord!} delay={0.12} />
                  </span>
                  {parts[1].trim() ? (
                    <>
                      {" "}
                      <RevealWords text={parts[1].trim()} delay={0.2} />
                    </>
                  ) : null}
                </>
              ) : (
                <RevealWords text={title} />
              )}
            </h2>

            <Reveal delay={0.15}>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-white/80 sm:text-lg">
                {body}
              </p>
            </Reveal>

            <Reveal delay={0.25}>
              <ul className="mt-8 grid gap-3 sm:grid-cols-3">
                {points.map((pt, i) => (
                  <li key={pt} className="border-t border-line pt-4">
                    <span className="block text-[10px] font-bold uppercase tracking-[0.22em] text-muted">
                      0{i + 1}
                    </span>
                    <span className="mt-2 block text-sm font-semibold text-white">{pt}</span>
                  </li>
                ))}
              </ul>
            </Reveal>

            {children ? <Reveal delay={0.35}>{children}</Reveal> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
