"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const RidgeScene = dynamic(() => import("./RidgeScene"), { ssr: false });

export function Ridge3D({ className = "" }: { className?: string }) {
  const holder = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = holder.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setShow(entry.isIntersecting),
      { rootMargin: "250px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={holder} className={className} aria-hidden="true">
      {show ? <RidgeScene /> : null}
    </div>
  );
}
