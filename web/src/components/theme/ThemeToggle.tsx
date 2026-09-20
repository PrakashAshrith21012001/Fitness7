"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "./useTheme";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, toggle] = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={!isDark}
      className={`grid size-11 place-items-center rounded-full border border-line text-white/70 transition-colors hover:border-lime hover:text-lime ${className}`}
    >
      {isDark ? <Sun className="size-4" strokeWidth={1.8} /> : <Moon className="size-4" strokeWidth={1.8} />}
    </button>
  );
}
