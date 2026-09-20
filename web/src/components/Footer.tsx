import { Phone, MapPin } from "lucide-react";
import { InstagramGlyph } from "@/components/ui/InstagramGlyph";
import { brand, contact, navLinks, addressLine, wa } from "@f7/content";
import { Logo } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface/40">
      <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo className="h-16" />
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.22em] text-muted">
              Gym Unisex · {brand.city}
            </p>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted">
              {brand.tagline} Strength, conditioning and one hill trek a month,
              on the main road in Dharmapuri.
            </p>
            <div className="mt-7 flex gap-3">
              <a
                href={contact.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="grid size-11 place-items-center rounded-full border border-line text-white/70 transition-colors hover:border-lime hover:text-lime"
              >
                <InstagramGlyph className="size-4" strokeWidth={1.8} />
              </a>
              <a
                href={`tel:${contact.phone}`}
                aria-label="Call"
                className="grid size-11 place-items-center rounded-full border border-line text-white/70 transition-colors hover:border-lime hover:text-lime"
              >
                <Phone className="size-4" strokeWidth={1.8} />
              </a>
              <a
                href={contact.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Directions"
                className="grid size-11 place-items-center rounded-full border border-line text-white/70 transition-colors hover:border-lime hover:text-lime"
              >
                <MapPin className="size-4" strokeWidth={1.8} />
              </a>
            </div>
          </div>

          <nav aria-label="Footer">
            <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-white/50">
              Explore
            </h2>
            <ul className="mt-5 space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-muted transition-colors hover:text-lime"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-white/50">
              Visit
            </h2>
            <address className="mt-5 not-italic text-sm leading-relaxed text-muted">
              {addressLine}
            </address>
            <a
              href={`tel:${contact.phone}`}
              className="mt-4 block text-sm text-muted transition-colors hover:text-lime"
            >
              {contact.phone}
            </a>
            <a
              href={`mailto:${contact.email}`}
              className="mt-1 block text-sm text-muted transition-colors hover:text-lime"
            >
              {contact.email}
            </a>
            <a
              href={wa.general()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex rounded-full bg-green px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-white"
            >
              WhatsApp us
            </a>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-line pt-7 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {brand.fullName}. All rights reserved.
          </p>
          <p>Dharmapuri, Tamil Nadu</p>
        </div>
      </div>
    </footer>
  );
}
