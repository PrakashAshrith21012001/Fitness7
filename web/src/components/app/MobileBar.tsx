"use client";

import { useEffect, useState } from "react";
import { Phone } from "lucide-react";
import { telLink, wa } from "@f7/content";

/**
 * Phones only: once the hero is behind you, the two things people come for
 * stay under the thumb — call, or book the free session (Fitts's Law).
 */
export function MobileBar() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.7);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div
      className={`glass pb-safe fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-line px-4 pt-3 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] sm:hidden ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
      aria-hidden={!show}
    >
      <a href={telLink()} tabIndex={show ? 0 : -1} aria-label="Call the gym" className="btn-secondary h-12 w-14 shrink-0 px-0">
        <Phone className="size-5" strokeWidth={2} />
      </a>
      <a href={wa.trial()} target="_blank" rel="noopener noreferrer" tabIndex={show ? 0 : -1} className="btn-primary h-12 flex-1 text-[15px]">
        Book a free session
      </a>
    </div>
  );
}
