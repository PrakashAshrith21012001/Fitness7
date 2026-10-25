import { Phone, MapPin, MessageCircle } from "lucide-react";
import { InstagramGlyph } from "@/components/ui/InstagramGlyph";
import { brand, contact, navLinks, addressLine, wa, telLink } from "@f7/content";
import { Logo } from "@/components/Logo";

/** The app's Quick Links block, laid out as the site footer. */
export function Footer() {
  const quick = [
    { label: "Book a free trial", href: wa.trial(), external: true },
    { label: "Personal training", href: wa.personalTraining(), external: true },
    { label: "Reserve a trek slot", href: "/#treks" },
    { label: "Order from the store", href: "/#shop" },
    { label: "Get directions", href: contact.mapsUrl, external: true },
  ];
  return (
    <footer className="mt-16 border-t border-line bg-deep pb-24 sm:pb-0">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Logo className="h-14" />
            <p className="label mt-2">Gym Unisex · {brand.city}</p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              {brand.tagline}. Strength, conditioning and one hill trek a month, on the Nethaji Bypass in Dharmapuri.
            </p>
            <div className="mt-5 flex gap-2.5">
              {[
                { href: contact.instagram, label: "Instagram", icon: <InstagramGlyph className="size-4" strokeWidth={1.8} />, ext: true },
                { href: wa.general(), label: "WhatsApp", icon: <MessageCircle className="size-4" strokeWidth={1.8} />, ext: true },
                { href: telLink(), label: "Call", icon: <Phone className="size-4" strokeWidth={1.8} />, ext: false },
                { href: contact.mapsUrl, label: "Directions", icon: <MapPin className="size-4" strokeWidth={1.8} />, ext: true },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  {...(s.ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  aria-label={s.label}
                  className="grid size-11 place-items-center rounded-full border border-line text-white/80 transition-colors hover:bg-surface hover:text-white"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Sections">
            <h2 className="label">Explore</h2>
            <ul className="mt-4 space-y-2.5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a href={`/${link.href}`} className="text-sm text-white/85 hover:text-white">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Quick links">
            <h2 className="label">Quick links</h2>
            <ul className="mt-4 space-y-2.5">
              {quick.map((q) => (
                <li key={q.label}>
                  <a href={q.href} {...(q.external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="text-sm text-white/85 hover:text-white">
                    {q.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="label">Visit</h2>
            <address className="mt-4 text-sm not-italic leading-relaxed text-muted">{addressLine}</address>
            <a href={telLink()} className="mt-3 block text-sm text-white/85 hover:text-white">
              {contact.phoneDisplay}
            </a>
            <a href={`mailto:${contact.email}`} className="mt-1 block text-sm text-white/85 hover:text-white">
              {contact.email}
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {brand.fullName}. All rights reserved.
          </p>
          <p className="flex flex-wrap gap-x-5 gap-y-2">
            <a href="/privacy" className="hover:text-white">Privacy policy</a>
            <a href="/delete-account" className="hover:text-white">Delete account</a>
            <span>Dharmapuri, Tamil Nadu</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
