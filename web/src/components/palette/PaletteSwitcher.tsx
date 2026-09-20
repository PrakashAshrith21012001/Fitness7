"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Palette as PaletteIcon, X, Check } from "lucide-react";
import { palettes } from "@f7/content";
import { usePalette } from "./usePalette";
import { cn } from "@/lib/cn";

/**
 * Floating palette picker for the prototype review. Remove this component
 * from page.tsx once the owner has chosen — nothing else depends on it.
 */
export function PaletteSwitcher() {
  const [open, setOpen] = useState(false);
  const [active, setPalette] = usePalette();

  return (
    <div className="fixed bottom-6 left-5 z-40 sm:bottom-8 sm:left-8">
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="glass mb-3 w-72 rounded-3xl border border-line p-3 shadow-2xl"
            role="dialog"
            aria-label="Choose a colour palette"
          >
            <div className="flex items-center justify-between px-2 pb-2 pt-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted">
                Palette · prototype only
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="rounded-full p-1 text-muted hover:text-white"
              >
                <X className="size-4" strokeWidth={2} />
              </button>
            </div>
            <ul className="space-y-1">
              {palettes.map((p) => {
                const isActive = p.id === active.id;
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => setPalette(p.id)}
                      aria-pressed={isActive}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors",
                        isActive ? "bg-white/[0.06]" : "hover:bg-white/[0.04]",
                      )}
                    >
                      <span
                        className="flex size-9 shrink-0 items-center justify-center rounded-full border"
                        style={{ background: p.bg, borderColor: p.line }}
                      >
                        <span className="size-4 rounded-full" style={{ background: p.accent }} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-white">{p.name}</span>
                        <span className="block truncate text-[11px] text-muted">{p.tagline}</span>
                      </span>
                      {isActive ? <Check className="size-4 text-lime" strokeWidth={2.4} /> : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Change colour palette"
        className="glass flex items-center gap-2 rounded-full border border-line py-3 pl-4 pr-5 text-sm font-semibold text-white transition-colors hover:border-lime"
      >
        <span className="relative flex size-5 items-center justify-center">
          <span className="size-3.5 rounded-full bg-lime" />
        </span>
        <PaletteIcon className="size-4" strokeWidth={1.8} />
        <span className="hidden sm:inline">{active.name}</span>
      </button>
    </div>
  );
}
