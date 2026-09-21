import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Small, boring building blocks for /admin — same tokens as the site, nothing new. */

export function Card({ children, className, title, action }: { children: ReactNode; className?: string; title?: string; action?: ReactNode }) {
  return (
    <section className={cn("rounded-2xl border border-line bg-surface p-5", className)}>
      {title || action ? (
        <div className="mb-3 flex items-center justify-between gap-3">
          {title ? <h2 className="font-display text-lg font-bold">{title}</h2> : <span />}
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="text-muted text-sm">{children}</p>;
}

export function Label({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs tracking-[0.14em] uppercase text-muted">
      {children}
    </label>
  );
}

export const inputCls = "mt-1.5 w-full rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-white outline-none focus:border-green min-h-[44px]";

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

export function Button({ children, variant = "green", className, ...rest }: { children: ReactNode; variant?: "green" | "outline" | "danger" | "ghost"; className?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const base = "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-5 font-bold transition-colors disabled:opacity-50";
  const v = {
    green: "btn-green text-on-accent",
    outline: "border border-line text-white hover:border-lime/50",
    danger: "border border-red-400/40 text-red-400 hover:bg-red-400/10",
    ghost: "text-lime hover:underline",
  }[variant];
  return (
    <button className={cn(base, v, className)} {...rest}>
      {children}
    </button>
  );
}

export function Badge({ children, tone = "muted" }: { children: ReactNode; tone?: "lime" | "amber" | "red" | "muted" }) {
  const t = {
    lime: "text-lime border-lime/30",
    amber: "text-amber-300 border-amber-300/30",
    red: "text-red-400 border-red-400/30",
    muted: "text-muted border-line",
  }[tone];
  return <span className={cn("inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.12em]", t)}>{children}</span>;
}

export function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-xl bg-surface-2 p-4">
      <p className="text-xs uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="font-display text-3xl font-bold mt-1">{value}</p>
      {sub ? <p className="text-xs text-muted mt-0.5">{sub}</p> : null}
    </div>
  );
}

export function Flash({ ok, error }: { ok?: string; error?: string }) {
  if (!ok && !error) return null;
  return (
    <p className={cn("rounded-xl border px-4 py-3 text-sm", error ? "border-red-400/40 text-red-300" : "border-lime/40 text-lime")}>
      {error ?? ok}
    </p>
  );
}
