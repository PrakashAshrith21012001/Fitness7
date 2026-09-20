"use client";

import { useEffect, useState } from "react";

export type SceneColors = { bg: string; fg: string; accent: string; ridgeNear: string; ridgeFar: string };

const fallback: SceneColors = {
  bg: "#111412",
  fg: "#eef2ef",
  accent: "#2ecc71",
  ridgeNear: "#0b0e0c",
  ridgeFar: "#2a302c",
};

/**
 * Reads the live band colours out of CSS, so the 3D and the page can never
 * disagree about what altitude they are at.
 */
export function useSceneColors(): SceneColors {
  const [colors, setColors] = useState<SceneColors>(fallback);

  useEffect(() => {
    const read = () => {
      const cs = getComputedStyle(document.documentElement);
      const v = (n: string, d: string) => cs.getPropertyValue(n).trim() || d;
      setColors({
        bg: v("--p-bg", fallback.bg),
        fg: v("--p-fg", fallback.fg),
        accent: v("--p-accent", fallback.accent),
        ridgeNear: v("--ridge-near", fallback.ridgeNear),
        ridgeFar: v("--ridge-far", fallback.ridgeFar),
      });
    };
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-band", "data-theme"] });
    return () => mo.disconnect();
  }, []);

  return colors;
}
