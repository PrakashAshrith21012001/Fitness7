"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, Phone, Star } from "lucide-react";
import { brand, navLinks, reviews, wa, telLink } from "@f7/content";
import { cn } from "@/lib/cn";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

/**
 * The app's top bar, widened for the web: logo left, the tab names in the
 * middle (the app's bottom tabs, as anchors), call + TRY FOR FREE right.
 * Transparent over the hero photo, solid navy once you scroll.
 */
export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          scrolled ? "glass border-b border-line py-2" : "bg-gradient-to-b from-[rgba(9,12,28,0.7)] to-transparent py-3 sm:py-4",
        )}
      >
        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/#top" className="flex items-center" aria-label={`${brand.fullName} — home`}>
            <Logo tone={scrolled ? "auto" : "dark"} className={cn("transition-[height] duration-300", scrolled ? "h-9" : "h-10 sm:h-12")} />
          </Link>

          <ul className="hidden items-center gap-7 lg:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={`/${link.href}`}
                  className={cn(
                    "text-[13px] font-bold uppercase tracking-[0.08em] transition-colors",
                    scrolled ? "text-muted hover:text-white" : "text-[rgba(255,255,255,0.85)] hover:text-[#fff]",
                  )}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle className={cn("hidden sm:grid", !scrolled && "!border-[rgba(255,255,255,0.25)] !text-[#fff]")} />
            <a
              href={telLink()}
              className={cn("hidden size-11 place-items-center rounded-full border transition-colors sm:grid", scrolled ? "border-line text-white/80 hover:text-white" : "border-[rgba(255,255,255,0.25)] text-[#fff]")}
              aria-label="Call the gym"
            >
              <Phone className="size-4" strokeWidth={1.8} />
            </a>
            <a href={wa.trial()} target="_blank" rel="noopener noreferrer" className="btn-pink hidden h-11 items-center px-5 sm:inline-flex">
              Try for free
            </a>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className={cn("grid size-11 place-items-center rounded-full border lg:hidden", scrolled ? "border-line text-white" : "border-[rgba(255,255,255,0.25)] text-[#fff]")}
              aria-label="Open menu"
            >
              <Menu className="size-5" strokeWidth={1.8} />
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-[60] bg-deep lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex h-full flex-col px-4 py-3 sm:px-6">
              <div className="flex items-center justify-between">
                <Logo className="h-10" />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="grid size-11 place-items-center rounded-full border border-line text-white"
                  aria-label="Close menu"
                >
                  <X className="size-5" strokeWidth={1.8} />
                </button>
              </div>

              <ul className="mt-10 flex flex-col">
                {navLinks.map((link, i) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 * i + 0.05, duration: 0.3 }}
                    className="border-b border-line"
                  >
                    <a href={`/${link.href}`} onClick={() => setOpen(false)} className="block py-4 text-2xl font-extrabold text-white">
                      {link.label}
                    </a>
                  </motion.li>
                ))}
              </ul>

              <p className="mt-6 flex items-center gap-2 text-sm text-muted">
                <Star className="size-4 fill-gold text-gold" strokeWidth={0} />
                <span className="font-bold text-white">{reviews.rating.toFixed(1)}</span> on Google · {reviews.count} reviews
              </p>

              <div className="mt-auto flex flex-col gap-3 pb-4">
                <div className="flex justify-end"><ThemeToggle /></div>
                <a href={wa.trial()} target="_blank" rel="noopener noreferrer" className="btn-pink flex h-12 items-center justify-center">
                  Try for free
                </a>
                <a href={telLink()} className="flex h-12 items-center justify-center rounded-lg bg-surface-2 text-[13px] font-extrabold uppercase tracking-[0.06em] text-white">
                  Call the gym
                </a>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
