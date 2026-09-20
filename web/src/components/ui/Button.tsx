import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "lime" | "outline" | "ghost";

const base =
  "group inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold tracking-tight transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime disabled:opacity-50";

const sizes = {
  md: "px-6 py-3",
  lg: "px-8 py-4 text-base",
} as const;

const variants: Record<Variant, string> = {
  lime:
    "btn-green hover:bg-white hover:shadow-[0_16px_50px_-14px_rgba(200,255,30,0.75)] active:scale-[0.98]",
  outline:
    "border border-line bg-white/[0.02] text-white hover:border-lime hover:text-lime active:scale-[0.98]",
  ghost: "text-white/70 hover:text-lime",
};

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  size?: keyof typeof sizes;
  external?: boolean;
  className?: string;
};

export function Button({
  href,
  children,
  variant = "lime",
  size = "md",
  external,
  className,
}: Props) {
  const classes = cn(base, sizes[size], variants[variant], className);
  const isExternal = external ?? /^(https?:|tel:|mailto:)/.test(href);

  if (isExternal) {
    return (
      <a
        href={href}
        className={classes}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
