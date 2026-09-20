"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, Phone } from "lucide-react";
import { brand, navLinks, wa, telLink } from "@f7/content";
import { cn } from "@/lib/cn";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

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
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          scrolled ? "glass border-b border-line py-2.5" : "py-5",
        )}
      >
        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 sm:px-8">
          <a href="#top" className="flex items-center" aria-label={brand.fullName}>
            <Logo
              className={cn(
                "transition-[height] duration-500",
                scrolled ? "h-9 sm:h-10" : "h-11 sm:h-14",
              )}
            />
          </a>

          <ul className="hidden items-center gap-9 lg:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="relative text-sm font-medium text-white/70 transition-colors hover:text-white after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-green after:transition-all after:duration-300 hover:after:w-full"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <ThemeToggle className="hidden sm:grid" />
            <a
              href={telLink()}
              className="hidden size-11 place-items-center rounded-full border border-line text-white/70 transition-colors hover:border-lime hover:text-lime sm:grid"
              aria-label="Call the gym"
            >
              <Phone className="size-4" strokeWidth={1.8} />
            </a>
            <a
              href={wa.trial()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-green hidden px-5 py-2.5 text-sm sm:inline-flex"
            >
              Free trial
            </a>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="grid size-11 place-items-center rounded-full border border-line text-white lg:hidden"
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
            className="fixed inset-0 z-[60] bg-ink lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex h-full flex-col px-5 py-5 sm:px-8">
              <div className="flex items-center justify-between">
                <Logo className="h-9" />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="grid size-11 place-items-center rounded-full border border-line text-white"
                  aria-label="Close menu"
                >
                  <X className="size-5" strokeWidth={1.8} />
                </button>
              </div>

              <ul className="mt-16 flex flex-col gap-2">
                {navLinks.map((link, i) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.06 * i + 0.1, duration: 0.4 }}
                  >
                    <a
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="display block py-3 text-5xl text-white transition-colors hover:text-lime"
                    >
                      {link.label}
                    </a>
                  </motion.li>
                ))}
              </ul>

              <div className="mt-auto flex flex-col gap-3">
                <div className="flex justify-end"><ThemeToggle /></div>
                <a
                  href={wa.trial()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-green px-6 py-4 text-center"
                >
                  Book a free trial
                </a>
                <a
                  href={telLink()}
                  className="rounded-full border border-line px-6 py-4 text-center font-semibold text-white"
                >
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
