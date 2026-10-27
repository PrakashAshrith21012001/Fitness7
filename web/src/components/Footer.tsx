import { Phone, MapPin, MessageCircle } from "lucide-react";
import { InstagramGlyph } from "@/components/ui/InstagramGlyph";
import { brand, contact, navLinks, addressLine, wa, waLink, telLink } from "@f7/content";
import { Logo } from "@/components/Logo";

/** Quiet footer: where we are, how to reach us, the five places on the page. */
export function Footer() {
  const quick = [
    { label: "Book a free session", href: wa.trial(), external: true },
    { label: "Personal training", href: wa.personalTraining(), external: true },
    { label: "Reserve a trek seat", href: "/#treks" },
    { label: "Order from the store", href: waLink(`Hi ${brand.name}! I'd like to order from the store. Item: `), external: true },
  ];
  const social = [
    { href: contact.instagram, label: "Instagram", icon: <InstagramGlyph className="size-4" strokeWidth={1.8} />, ext: true },
    { href: wa.general(), label: "WhatsApp", icon: <MessageCircle className="size-4" strokeWidth={1.8} />, ext: true },
    { href: telLink(), label: "Call", icon: <Phone className="size-4" strokeWidth={1.8} />, ext: false },
    { href: contact.mapsUrl, label: "Directions", icon: <MapPin className="size-4" strokeWidth={1.8} />, ext: true },
  ];
  return (
    <footer className="bg-paper pb-28 sm:pb-10">
      <div className="mx-auto w-full max-w-7xl px-5 pt-16 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Logo className="h-14" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              {brand.tagline}. A unisex strength and conditioning gym in {brand.city}, with a hill trek every month.
            </p>
            <div className="mt-5 flex gap-2">
              {social.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  {...(s.ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  aria-label={s.label}
                  className="grid size-11 place-items-center rounded-full border border-line text-fg transition-colors hover:bg-fg hover:text-paper"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Sections">
            <h2 className="eyebrow">Explore</h2>
            <ul className="mt-4 space-y-2.5">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a href={`/${l.href}`} className="text-[15px] text-fg/80 hover:text-fg">{l.label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Quick links">
            <h2 className="eyebrow">Quick links</h2>
            <ul className="mt-4 space-y-2.5">
              {quick.map((q) => (
                <li key={q.label}>
                  <a href={q.href} {...(q.external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="text-[15px] text-fg/80 hover:text-fg">
                    {q.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="eyebrow">Visit</h2>
            <address className="mt-4 text-[15px] not-italic leading-relaxed text-muted">{addressLine}</address>
            <a href={telLink()} className="tnum mt-3 block text-[15px] text-fg/80 hover:text-fg">{contact.phoneDisplay}</a>
            <a href={`mailto:${contact.email}`} className="mt-1 block text-[15px] text-fg/80 hover:text-fg">{contact.email}</a>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-line pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {brand.fullName}. All rights reserved.</p>
          <p className="flex flex-wrap gap-x-5 gap-y-2">
            <a href="/privacy" className="hover:text-fg">Privacy policy</a>
            <a href="/delete-account" className="hover:text-fg">Delete account</a>
            <span>Dharmapuri, Tamil Nadu</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
