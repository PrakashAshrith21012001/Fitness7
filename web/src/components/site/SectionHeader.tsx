import type { ReactNode } from "react";

/**
 * Every section opens the same way — small kicker, one headline, one line of
 * help — left-aligned on a shared edge (Law of Similarity, Continuity,
 * Visual Hierarchy). Nothing else competes with the headline.
 */
export function SectionHeader({ kicker, title, sub, action }: { kicker: string; title: ReactNode; sub?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <p className="label">{kicker}</p>
        <h2 className="mt-1.5 text-[26px] font-extrabold leading-[1.12] tracking-[-0.02em] text-white sm:text-4xl">{title}</h2>
        {sub ? <p className="mt-2 text-[15px] leading-relaxed text-muted sm:text-base">{sub}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
