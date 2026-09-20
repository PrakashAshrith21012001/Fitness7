"use client";

import { useCallback, useEffect, useState } from "react";
import { palettes, getPalette, type Palette, type PaletteId } from "@f7/content";

function readCurrent(): PaletteId {
  if (typeof document === "undefined") return "volt";
  return (document.documentElement.getAttribute("data-palette") as PaletteId) ?? "volt";
}

/** The active palette, kept in sync with the data-palette attribute. */
export function usePalette(): [Palette, (id: PaletteId) => void] {
  const [id, setId] = useState<PaletteId>("volt");

  useEffect(() => {
    setId(readCurrent());
    const mo = new MutationObserver(() => setId(readCurrent()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-palette"] });
    return () => mo.disconnect();
  }, []);

  const set = useCallback((next: PaletteId) => {
    if (next === "volt") document.documentElement.removeAttribute("data-palette");
    else document.documentElement.setAttribute("data-palette", next);
    try {
      localStorage.setItem("f7-palette", next);
    } catch {
      /* private mode — fine */
    }
  }, []);

  return [getPalette(id), set];
}

export { palettes };
