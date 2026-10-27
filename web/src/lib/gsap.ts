"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

/**
 * One place that registers GSAP's plugins (all free since GSAP 3.13).
 * Import gsap / ScrollTrigger from here so registration always happens first.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, useGSAP);
  gsap.defaults({ ease: "expo.out", duration: 1 });
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Scroll to an element or y position — smoothly through ScrollSmoother when it's running. */
export function scrollToTarget(target: string | number) {
  const smoother = ScrollSmoother.get();
  if (smoother) smoother.scrollTo(target, true, typeof target === "string" ? "top 80px" : undefined);
  else if (typeof target === "number") window.scrollTo({ top: target, behavior: "smooth" });
  else document.querySelector(target)?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
}

export { gsap, ScrollTrigger, ScrollSmoother, SplitText, useGSAP };
