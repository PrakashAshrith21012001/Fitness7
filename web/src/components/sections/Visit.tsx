import { MapPin, Phone, Mail, ArrowUpRight } from "lucide-react";
import { InstagramGlyph } from "@/components/ui/InstagramGlyph";
import { contact, hours, addressLine, wa, telLink } from "@f7/content";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { EnquiryForm } from "@/components/EnquiryForm";

export function Visit() {
  return (
    <Section id="contact">
      <div className="grid gap-14 lg:grid-cols-2">
        <div>
          <SectionHeading
            eyebrow="Come see the place"
            title="Walk in. Train a session. Decide after."
            body="We are on the main road in Dharmapuri, open early and late six days a week. No appointment needed for a first session — just turn up in training shoes."
          />

          <Reveal delay={0.12}>
            <div className="mt-10 space-y-5">
              <a
                href={contact.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-4 rounded-2xl border border-line bg-surface/50 p-5 transition-colors hover:border-lime/40"
              >
                <MapPin className="mt-0.5 size-5 shrink-0 text-lime" strokeWidth={1.8} />
                <span className="flex-1">
                  <span className="block text-sm font-semibold text-white">Find us</span>
                  <span className="mt-1 block text-sm leading-relaxed text-muted">
                    {addressLine}
                  </span>
                </span>
                <ArrowUpRight className="size-4 shrink-0 text-white/30 transition-all group-hover:text-lime" strokeWidth={2} />
              </a>

              <div className="grid gap-5 sm:grid-cols-2">
                <a
                  href={telLink()}
                  className="group flex items-center gap-4 rounded-2xl border border-line bg-surface/50 p-5 transition-colors hover:border-lime/40"
                >
                  <Phone className="size-5 shrink-0 text-lime" strokeWidth={1.8} />
                  <span>
                    <span className="block text-sm font-semibold text-white">Call</span>
                    <span className="mt-0.5 block text-sm text-muted">{contact.phoneDisplay}</span>
                  </span>
                </a>
                <a
                  href={`mailto:${contact.email}`}
                  className="group flex items-center gap-4 rounded-2xl border border-line bg-surface/50 p-5 transition-colors hover:border-lime/40"
                >
                  <Mail className="size-5 shrink-0 text-lime" strokeWidth={1.8} />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-white">Email</span>
                    <span className="mt-0.5 block truncate text-sm text-muted">
                      {contact.email}
                    </span>
                  </span>
                </a>
              </div>

              <a
                href={contact.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 rounded-2xl border border-line bg-surface/50 p-5 transition-colors hover:border-lime/40"
              >
                <InstagramGlyph className="size-5 shrink-0 text-lime" strokeWidth={1.8} />
                <span className="flex-1">
                  <span className="block text-sm font-semibold text-white">Instagram</span>
                  <span className="mt-0.5 block text-sm text-muted">@f7gym_dpi</span>
                </span>
                <ArrowUpRight className="size-4 shrink-0 text-white/30 transition-all group-hover:text-lime" strokeWidth={2} />
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="mt-10 overflow-hidden rounded-2xl border border-line">
              <table className="w-full text-sm">
                <caption className="border-b border-line bg-surface px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                  Opening hours
                </caption>
                <tbody className="divide-y divide-line">
                  {hours.map((h) => (
                    <tr key={h.day} className="bg-ink">
                      <th scope="row" className="px-5 py-3 text-left font-medium text-white/80">
                        {h.day}
                      </th>
                      <td className="px-5 py-3 text-right text-muted">
                        {h.morning ?? "—"}
                      </td>
                      <td className="px-5 py-3 text-right text-muted">
                        {h.evening ?? "Closed"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <div className="sticky top-28 rounded-3xl border border-line bg-surface/60 p-8 backdrop-blur">
            <h3 className="display text-3xl">Send us a message</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Leave your number and we will call you back. Prefer it instant?{" "}
              <a
                href={wa.general()}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-lime underline-offset-4 hover:underline"
              >
                Message us on WhatsApp
              </a>
              .
            </p>
            <EnquiryForm />
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
