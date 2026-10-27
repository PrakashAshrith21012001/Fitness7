import { Check, Dumbbell, Home } from "lucide-react";
import { brand, memberPlansCopy, waLink } from "@f7/content";
import { Wrap } from "@/components/app/ui";
import { SectionHeader } from "@/components/site/SectionHeader";

/**
 * Three membership cards, cheapest to fullest, the middle one marked
 * (Hick's Law: three real choices; Von Restorff + Serial Position: the
 * recommended plan stands out in the middle). Personal training and the
 * at-home pass sit underneath as smaller rows — available, not competing.
 */

type Item = (typeof memberPlansCopy.items)[number];
const byId = (id: string) => memberPlansCopy.items.find((p) => p.id === id) as Item;

const MAIN: { item: Item; perks: string[]; popular?: boolean }[] = [
  { item: byId("monthly"), perks: ["Full gym & cardio floor", "Locker & showers", "Free induction session"] },
  { item: byId("quarterly"), perks: ["Everything in PLAY", "All group classes", "Diet guidance from a coach"], popular: true },
  { item: byId("annual"), perks: ["Everything in PRO", "One free trek", "Priority PT booking"] },
];
const EXTRA = [byId("personal-training"), byId("home")];

const price = (p: Item) => p.price.replace("*", "").replace(" / month", "");
const ask = (p: Item) => waLink(`Hi ${brand.name}! I'm interested in ${p.name} (${p.price.replace("*", "")}). Could you tell me the next steps?`);

export function Plans() {
  return (
    <section id="plans" className="pt-16 sm:pt-24">
      <Wrap>
        <SectionHeader kicker="Membership" title="Simple plans. No joining fee." sub="Start with a free session, then pick a plan at the desk or on WhatsApp." />

        <ul className="grid gap-3 md:grid-cols-3 md:items-stretch">
          {MAIN.map(({ item, perks, popular }) => (
            <li
              key={item.id}
              className={`squircle relative flex flex-col rounded-[18px] border p-5 sm:p-6 ${
                popular ? "border-white bg-surface-2 md:-my-2 md:py-8" : "border-line bg-surface"
              }`}
            >
              {popular ? (
                <span className="absolute -top-3 left-5 rounded-full bg-white px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.08em] text-ink">Most chosen</span>
              ) : null}
              <h3 className="text-lg font-extrabold text-white">{item.name}</h3>
              <p className="mt-1 min-h-10 text-[13px] leading-snug text-muted">{item.sub}</p>
              <p className="tnum mt-4 text-white">
                <span className="text-3xl font-extrabold tracking-[-0.02em]">{price(item)}</span>
                <span className="text-sm text-muted"> / month</span>
              </p>
              <ul className="mt-4 flex flex-col gap-2 text-sm">
                {perks.map((p) => (
                  <li key={p} className="flex gap-2 text-white/90">
                    <Check className="mt-0.5 size-4 shrink-0 text-green" strokeWidth={2.4} />
                    {p}
                  </li>
                ))}
              </ul>
              <a
                href={ask(item)}
                target="_blank"
                rel="noopener noreferrer"
                className={`press mt-6 flex h-12 items-center justify-center rounded-lg text-[13px] font-extrabold uppercase tracking-[0.06em] ${
                  popular ? "bg-white text-ink" : "border border-line text-white hover:bg-surface-2"
                }`}
              >
                Choose {item.name.replace("F7 pass ", "")}
              </a>
            </li>
          ))}
        </ul>

        <ul className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 [&>li]:min-w-0">
          {EXTRA.map((p, i) => {
            const Icon = i === 0 ? Dumbbell : Home;
            return (
              <li key={p.id}>
                <a href={ask(p)} target="_blank" rel="noopener noreferrer" className="pane press flex items-center gap-3.5 p-4 hover:bg-surface-2">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-surface-2">
                    <Icon className="size-5 text-white" strokeWidth={1.8} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold text-white">{p.name}</span>
                    <span className="block truncate text-[13px] text-muted">{p.sub}</span>
                  </span>
                  <span className="tnum shrink-0 text-right text-sm font-extrabold text-white">
                    {price(p)}
                    <span className="block text-[11px] font-normal text-muted">/ month</span>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-xs text-muted">Starting prices; confirmed at the desk.</p>
      </Wrap>
    </section>
  );
}
