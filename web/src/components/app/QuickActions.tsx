import { CalendarDays, Dumbbell, MapPin, Mountain, Sparkles, Ticket, TrendingDown, Utensils, type LucideIcon } from "lucide-react";
import { stats, wa } from "@f7/content";
import { Wrap } from "@/components/app/ui";

/**
 * The app's quick-action grid (round icon, two short lines) — four across on
 * a phone, eight on desktop — then the numbers strip as app panes.
 */
type Tile = { icon: LucideIcon; label: [string, string]; href: string; tint: string; external?: boolean };

const tiles: Tile[] = [
  { icon: CalendarDays, label: ["book a", "class"], href: "#classes", tint: "var(--color-white)" },
  { icon: Ticket, label: ["free", "trial"], href: wa.trial(), tint: "var(--color-pink)", external: true },
  { icon: Mountain, label: ["monthly", "treks"], href: "#treks", tint: "var(--color-gold)" },
  { icon: Utensils, label: ["calorie", "tracker"], href: "#eat-well", tint: "var(--color-green)" },
  { icon: Dumbbell, label: ["personal", "training"], href: "#coaches", tint: "var(--color-blue)" },
  { icon: Sparkles, label: ["ladies-only", "hours"], href: "#classes", tint: "var(--color-pink)" },
  { icon: TrendingDown, label: ["weight", "loss"], href: "#transform", tint: "var(--color-green)" },
  { icon: MapPin, label: ["visit the", "gym"], href: "#visit", tint: "var(--color-gold)" },
];

export function QuickActions() {
  return (
    <Wrap className="pt-6 lg:pt-2">
      <nav aria-label="Quick actions">
        <ul className="grid grid-cols-4 gap-y-5 lg:grid-cols-8">
          {tiles.map((t) => (
            <li key={t.label.join(" ")}>
              <a
                href={t.href}
                {...(t.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="group flex flex-col items-center gap-2 rounded-xl py-1 text-center"
              >
                <span className="grid size-12 place-items-center rounded-full transition-colors group-hover:bg-surface-2">
                  <t.icon className="size-[26px]" style={{ color: t.tint }} strokeWidth={1.6} />
                </span>
                <span className="text-[11px] font-medium leading-[14px] text-muted group-hover:text-white sm:text-xs">
                  {t.label[0]}
                  <br />
                  {t.label[1]}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <ul className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <li key={s.label} className="pane px-4 py-4">
            <p className="text-2xl font-extrabold tracking-[-0.02em] text-white sm:text-3xl">{s.value}</p>
            <p className="mt-1 text-xs leading-snug text-muted sm:text-[13px]">{s.label}</p>
          </li>
        ))}
      </ul>
    </Wrap>
  );
}
