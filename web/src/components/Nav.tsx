"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, Phone, X } from "lucide-react";
import { brand, navLinks, telLink, wa } from "@f7/content";
import { cn } from "@/lib/cn";
import { Logo } from "@/components/Logo";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

/**
 * Top bar: logo, five places, call, one primary action. Hides while you read
 * downwards and comes back the moment you scroll up (more page, same reach).
 * A thin progress line along the bottom shows how far down the page you are.
 */
export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const progress = useRef<HTMLSpanElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 16);
      setHidden(y > 480 && y > last + 4);
      if (y < last - 4) setHidden(false);
      last = y;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (progress.current) progress.current.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const el = menu.current;
    if (open && el && !prefersReducedMotion()) {
      gsap.fromTo(el.querySelectorAll("[data-menu-item]"), { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.05, duration: 0.7, ease: "expo.out" });
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[transform,background-color,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          scrolled ? "glass shadow-[0_1px_0_var(--p-line)]" : "bg-transparent",
          hidden && !open ? "-translate-y-full" : "translate-y-0",
        )}
      >
        <nav className="mx-auto flex h-[72px] w-full max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <Link href="/#top" className="flex items-center" aria-label={`${brand.fullName} — home`}>
            <Logo className="h-10 sm:h-11" />
          </Link>

          <ul className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a href={`/${link.href}`} className="rounded-full px-4 py-2 text-[15px] font-semibold text-muted transition-colors hover:bg-surface-2 hover:text-fg">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <a href={telLink()} className="hidden size-11 place-items-center rounded-full border border-line text-fg transition-colors hover:bg-surface-2 sm:grid" aria-label="Call the gym">
              <Phone className="size-4" strokeWidth={2} />
            </a>
            <a href={wa.trial()} target="_blank" rel="noopener noreferrer" className="btn-primary hidden h-11 px-5 text-sm sm:inline-flex">
              Free session
            </a>
            <button type="button" onClick={() => setOpen(true)} className="grid size-11 place-items-center rounded-full border border-line text-fg lg:hidden" aria-label="Open menu" aria-expanded={open}>
              <Menu className="size-5" strokeWidth={2} />
            </button>
          </div>
        </nav>
        <span ref={progress} aria-hidden className="absolute bottom-0 left-0 h-[2px] w-full origin-left scale-x-0 bg-fg" />
      </header>

      {open ? (
        <div ref={menu} className="fixed inset-0 z-[60] flex flex-col bg-paper px-5 pb-safe pt-4 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="flex h-14 items-center justify-between">
            <Logo className="h-10" />
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button type="button" onClick={() => setOpen(false)} className="grid size-11 place-items-center rounded-full border border-line text-fg" aria-label="Close menu">
              <X className="size-5" strokeWidth={2} />
              </button>
            </div>
          </div>
          <ul className="mt-8 flex flex-col">
            {navLinks.map((link, i) => (
              <li key={link.href} className="overflow-hidden border-b border-line">
                <a data-menu-item href={`/${link.href}`} onClick={() => setOpen(false)} className="flex items-baseline justify-between py-4">
                  <span className="text-[34px] font-extrabold tracking-[-0.03em] text-fg">{link.label}</span>
                  <span className="cond tnum text-lg text-muted">0{i + 1}</span>
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-auto flex flex-col gap-3 pb-2">
            <a href={wa.trial()} target="_blank" rel="noopener noreferrer" className="btn-primary h-14 text-base">
              Book a free session
            </a>
            <a href={telLink()} className="btn-secondary h-14 text-base">
              Call the gym
            </a>
          </div>
        </div>
      ) : null}
    </>
  );
}
