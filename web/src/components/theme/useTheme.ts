"use client";

import { useCallback, useEffect, useState } from "react";
import type { ThemeId } from "@f7/content";

function read(): ThemeId {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

export function useTheme(): [ThemeId, () => void] {
  const [theme, setTheme] = useState<ThemeId>("dark");

  useEffect(() => {
    setTheme(read());
    const mo = new MutationObserver(() => setTheme(read()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);

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
