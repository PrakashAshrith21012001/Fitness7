import { reviews } from "@f7/content";

/**
 * Four numbers, counted up as they scroll in. Big condensed numerals, one
 * short line each — enough proof to keep going, nothing to read twice.
 */
const ITEMS = [
  { value: reviews.rating, decimals: 1, suffix: "", label: `Google rating from ${reviews.count} reviews` },
  { value: 1200, decimals: 0, suffix: "+", label: "members trained since we opened" },
  { value: 12, decimals: 0, suffix: "", label: "guided treks every year" },
  { value: 5, decimals: 0, suffix: " AM", label: "doors open, six days a week" },
];

export function Numbers() {
  return (
    <section aria-label="Fitness 7 in numbers" className="border-y border-line bg-surface">
      <ul className="mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-4">
        {ITEMS.map((it, i) => (
          <li key={it.label} className={`px-5 py-10 sm:px-8 sm:py-14 ${i % 2 ? "border-l border-line" : ""} ${i >= 2 ? "border-t border-line lg:border-t-0" : ""} ${i === 2 ? "lg:border-l" : ""}`}>
            <p className="cond tnum text-[56px] leading-none text-fg sm:text-[88px]">
              <span data-count={it.value} data-decimals={it.decimals} data-suffix={it.suffix}>
                {it.value.toFixed(it.decimals)}
                {it.suffix}
              </span>
            </p>
            <p className="mt-3 max-w-[220px] text-sm leading-snug text-muted">{it.label}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
