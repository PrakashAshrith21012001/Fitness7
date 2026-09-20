import { cn } from "@/lib/cn";

export function Section({
  id,
  children,
  className,
  containerClassName,
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
}) {
  return (
    <section
      id={id}
      className={cn("relative scroll-mt-24 py-24 sm:py-32 lg:py-40", className)}
    >
      <div className={cn("mx-auto w-full max-w-7xl px-5 sm:px-8", containerClassName)}>
        {children}
      </div>
    </section>
  );
}
