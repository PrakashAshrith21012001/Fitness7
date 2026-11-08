"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

export type QueueItem = { id: string; name: string; phone: string; label: string; detail: string; amount: string | null; href: string; nudge: boolean };

/**
 * Today's WhatsApp list, one tap per person. Tapping "Send" opens WhatsApp
 * with the message ready (and logs it on the server); the row ticks off and
 * the next one lights up, so the desk can clear the list in a couple of
 * minutes without hunting through the board.
 */
export function SendQueue({ items }: { items: QueueItem[] }) {
  const [done, setDone] = useState<Set<string>>(new Set());
  const next = items.find((i) => !done.has(i.id + i.label));
  const count = items.filter((i) => done.has(i.id + i.label)).length;

  return (
    <>
      <div className="sticky top-0 z-10 -mx-5 mb-4 bg-paper/95 px-5 py-3 backdrop-blur md:-mx-10 md:px-10">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="font-semibold">{count === items.length ? "All sent for today 🎉" : `${count} of ${items.length} sent`}</span>
          <Link href="/admin/dues" className="text-muted underline">Back to Dues</Link>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line" aria-hidden>
          <div className="h-full rounded-full bg-[var(--p-accent)] transition-[width] duration-300" style={{ width: `${items.length ? (count / items.length) * 100 : 100}%` }} />
        </div>
      </div>

      <ol className="space-y-3">
        {items.map((i, n) => {
          const key = i.id + i.label;
          const sent = done.has(key);
          const isNext = next && key === next.id + next.label;
          return (
            <li
              key={key}
              className={cn(
                "flex items-center gap-4 rounded-2xl border bg-surface p-4 transition",
                sent ? "border-line opacity-55" : isNext ? "border-[var(--p-accent)] shadow-[0_0_0_3px_color-mix(in_srgb,var(--p-accent)_25%,transparent)]" : "border-line",
              )}
            >
              <span className="w-6 shrink-0 text-center text-sm font-bold tabular-nums text-muted">{sent ? "✓" : n + 1}</span>
              <div className="min-w-0 flex-1">
                <Link href={`/admin/members/${i.id}`} className="block truncate font-semibold hover:underline">{i.name}</Link>
                <p className={cn("text-xs font-semibold", i.nudge ? "tone-amber" : "text-fg")}>{i.label}</p>
                <p className="text-xs text-muted">
                  {i.detail}
                  {i.amount ? ` · ${i.amount}` : ""}
                </p>
              </div>
              <a
                href={i.href}
                target="_blank"
                rel="noreferrer"
                onClick={() => setDone((d) => new Set(d).add(key))}
                className={cn("inline-flex min-h-[44px] shrink-0 items-center rounded-full px-4 text-sm font-bold", sent ? "border border-line" : "btn-green text-on-accent")}
              >
                {sent ? "Again" : "Send"}
              </a>
            </li>
          );
        })}
      </ol>
    </>
  );
}
