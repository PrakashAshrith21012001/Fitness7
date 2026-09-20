const words = [
  "Strength",
  "Conditioning",
  "Functional",
  "Yoga",
  "Boxing",
  "Trekking",
  "Ladies only",
  "Personal training",
];

export function Marquee() {
  const strip = [...words, ...words];
  return (
    <div className="relative overflow-hidden border-y border-line bg-surface/40 py-6">
      <div className="flex w-max animate-[marquee_40s_linear_infinite] items-center gap-10 whitespace-nowrap">
        {strip.map((word, i) => (
          <span key={`${word}-${i}`} className="flex items-center gap-10">
            <span className="display text-3xl text-white/25 sm:text-4xl">{word}</span>
            <span className="size-1.5 rounded-full bg-green" />
          </span>
        ))}
      </div>
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-ink to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-ink to-transparent" />
    </div>
  );
}
