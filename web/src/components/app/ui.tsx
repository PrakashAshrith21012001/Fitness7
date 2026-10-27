import Image from "next/image";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { BLUR } from "@/lib/blur";

/**
 * Web versions of the app's primitives (mobile/src/components/cult.tsx), so
 * every section is built from the same pieces the app screens are:
 *
 *   Wrap         centred page column (full-bleed on phones, 1280 max)
 *   Block        a section with the app's vertical rhythm and an anchor id
 *   SectionHead  bold title + optional arrow link on the right
 *   Photo        a cover photo (next/image for our own, <img> for uploads)
 *   Scrim        the bottom fade every photo card uses
 */

export function Wrap({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}>{children}</div>;
}

export function Block({ id, children, className }: { id?: string; children: ReactNode; className?: string }) {
  return (
    <section id={id} className={cn("scroll-mt-20 pt-14 sm:pt-20", className)}>
      {children}
    </section>
  );
}

export function SectionHead({
  title,
  sub,
  href,
  hrefLabel,
  center,
  className,
  children,
}: {
  title: ReactNode;
  sub?: ReactNode;
  href?: string;
  hrefLabel?: string;
  center?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={cn("mb-4 flex gap-4 sm:mb-6", center ? "flex-col items-center text-center" : "items-end justify-between", className)}>
      <div className={cn("min-w-0", center && "flex flex-col items-center")}>
        <h2 className="text-[22px] font-extrabold leading-tight tracking-[-0.01em] text-white sm:text-3xl">{title}</h2>
        {sub ? <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">{sub}</p> : null}
        {children}
      </div>
      {href && !center ? (
        <a
          href={href}
          className="group flex shrink-0 items-center gap-2 text-xs font-extrabold uppercase tracking-[0.08em] text-white/80 hover:text-white"
          aria-label={hrefLabel ?? (typeof title === "string" ? `More: ${title}` : "More")}
        >
          <span className="hidden sm:inline">{hrefLabel ?? "See all"}</span>
          <ArrowRight className="size-5 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
        </a>
      ) : null}
    </div>
  );
}

export function Photo({
  src,
  alt,
  sizes,
  priority,
  className,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  if (/^https?:/.test(src)) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} loading={priority ? "eager" : "lazy"} decoding="async" className={cn("absolute inset-0 size-full object-cover", className)} />;
  }
  const blur = BLUR[src];
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      placeholder={blur ? "blur" : "empty"}
      blurDataURL={blur}
      className={cn("object-cover", className)}
    />
  );
}

export function Scrim({ className }: { className?: string }) {
  return <div aria-hidden className={cn("scrim pointer-events-none absolute inset-0", className)} />;
}

/** "Starting at ₹580 / month" — the price line the app puts under plans. */
export function Price({ value, note }: { value: string; note?: string }) {
  return (
    <span className="text-[13px] font-extrabold text-white">
      {value} {note ? <span className="text-[10px] font-normal text-muted">{note}</span> : null}
    </span>
  );
}
