import { brand } from "@f7/content";

/**
 * The gym's own mark, cut from their creative. Two files: white lettering for
 * dark, ink lettering for light. The green is the logo's own (#8cba3d) and is
 * left untouched — a logo is not re-coloured to match a UI accent.
 */
export function Logo({ className = "h-9" }: { className?: string }) {
  return (
    <span className="inline-flex items-center" aria-label={brand.fullName}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/logo-dark.png"
        srcSet="/brand/logo-dark.png 1x, /brand/logo-dark@2x.png 2x"
        alt=""
        width={408}
        height={194}
        className={`${className} w-auto [html[data-theme=light]_&]:hidden`}
        decoding="async"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/logo-light.png"
        srcSet="/brand/logo-light.png 1x, /brand/logo-light@2x.png 2x"
        alt=""
        width={408}
        height={194}
        className={`${className} hidden w-auto [html[data-theme=light]_&]:inline-block`}
        decoding="async"
      />
    </span>
  );
}
