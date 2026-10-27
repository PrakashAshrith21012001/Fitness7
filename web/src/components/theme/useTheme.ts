"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { ThemeId } from "@f7/content";

/** Current theme from <html data-theme>, live (the 3D scenes re-tint from this too). */
function read(): ThemeId {
  if (typeof document === "undefined") return "light";
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

function subscribe(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => mo.disconnect();
}

export function useTheme(): [ThemeId, () => void] {
  const theme = useSyncExternalStore(subscribe, read, () => "light" as ThemeId);
  const toggle = useCallback(() => {
    const next: ThemeId = read() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("f7-theme", next);
    } catch {
      /* private mode */
    }
  }, []);
  return [theme, toggle];
}
