import { Reveal, RevealWords } from "./Reveal";
import { cn } from "@/lib/cn";

export function SectionHeading({
  eyebrow,
  title,
  body,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow ? (
        <Reveal>
          <p className="eyebrow mb-4">{eyebrow}</p>
        </Reveal>
      ) : null}
      <h2 className="display text-4xl sm:text-5xl lg:text-6xl">
        <RevealWords text={title} />
      </h2>
      {body ? (
        <Reveal delay={0.12}>
          <p className="mt-6 text-base leading-relaxed text-muted sm:text-lg">
            {body}
          </p>
        </Reveal>
      ) : null}
    </div>
  );
}
