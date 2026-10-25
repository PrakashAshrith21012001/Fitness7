import { Clock, MapPin, MessageCircle, Phone } from "lucide-react";
import { InstagramGlyph } from "@/components/ui/InstagramGlyph";
import { brand, contact, hours, addressLine, wa, telLink } from "@f7/content";
import { photo } from "@/lib/photos";
import { EnquiryForm } from "@/components/EnquiryForm";
import { Block, Photo, SectionHead, Wrap } from "@/components/app/ui";

/**
 * "Centers near You" as a visit page: the app's centre card (photo, tag,
 * name, distance line, CHECK IN footer) with the hours under it, and the
 * call-back form beside it.
 */
export function VisitUs() {
  return (
    <Block id="visit" className="pb-4">
      <Wrap>
        <SectionHead
          title={
            <>
              Centers near <span className="border-b-2 border-white pb-0.5">You</span>
            </>
          }
          sub="Walk in for a full session with a coach. No appointment, no card — decide after."
        />
        <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr]">
          <div className="flex flex-col gap-4">
            <div className="pane overflow-hidden">
              <a href={contact.mapsUrl} target="_blank" rel="noopener noreferrer" className="relative block h-[220px] sm:h-[280px]" aria-label="Open in Google Maps">
                <Photo src={photo("gym-floor")} alt={`The floor at ${brand.fullName}`} sizes="(min-width: 1024px) 640px, 100vw" />
                <span className="absolute left-2.5 top-2.5 flex items-center gap-1.5 rounded bg-[rgba(9,12,28,0.85)] px-2 py-1 text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#fff]">
                  <span className="size-1.5 rounded-full bg-[#3ddc84]" /> Pro gym · A/C · Unisex
                </span>
              </a>
              <div className="p-3.5 sm:p-4">
                <p className="text-[15px] font-semibold text-white">{brand.name} TS Square</p>
                <p className="mt-1 flex items-start gap-1 text-[13px] text-muted">
                  <MapPin className="mt-0.5 size-3 shrink-0 text-green" strokeWidth={2} />
                  {addressLine}
                </p>
              </div>
              <div className="grid grid-cols-3 border-t border-line bg-surface text-xs font-extrabold tracking-[0.08em] text-white">
                <a href={contact.mapsUrl} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center justify-center gap-1.5 border-r border-line hover:bg-surface-2">
                  <MapPin className="size-3.5" strokeWidth={2} /> DIRECTIONS
                </a>
                <a href={telLink()} className="flex min-h-11 items-center justify-center gap-1.5 border-r border-line hover:bg-surface-2">
                  <Phone className="size-3.5" strokeWidth={2} /> CALL
                </a>
                <a href={wa.general()} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center justify-center gap-1.5 hover:bg-surface-2">
                  <MessageCircle className="size-3.5" strokeWidth={2} /> WHATSAPP
                </a>
              </div>
            </div>

            <div className="pane p-4">
              <p className="label flex items-center gap-1.5">
                <Clock className="size-3.5" strokeWidth={2} /> Opening hours
              </p>
              <table className="mt-2 w-full text-[13px]">
                <tbody>
                  {hours.map((h) => (
                    <tr key={h.day} className="border-t border-line first:border-0">
                      <th scope="row" className="py-2 text-left font-semibold text-white">{h.day}</th>
                      <td className="py-2 text-right text-muted">{h.morning ?? "—"}</td>
                      <td className="py-2 pl-3 text-right text-muted">{h.evening ?? "Closed"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-2 text-xs text-muted">Ladies-only hours: Mon – Sat, 11:00 AM – 1:00 PM.</p>
            </div>

            <a href={contact.instagram} target="_blank" rel="noopener noreferrer" className="pane flex items-center gap-3.5 p-3.5 hover:bg-surface-2">
              <span className="grid size-11 place-items-center rounded-full bg-surface-2">
                <InstagramGlyph className="size-5 text-pink" strokeWidth={1.8} />
              </span>
              <span className="flex-1">
                <span className="block text-[13px] text-muted">Follow the floor</span>
                <span className="block text-sm font-semibold text-white">@{brand.instagram}</span>
              </span>
            </a>
          </div>

          <div className="pane self-start p-5 sm:p-6 lg:sticky lg:top-24">
            <h3 className="text-2xl font-extrabold text-white">Request a callback</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">
              Leave your number and a coach will call you back. Prefer it instant?{" "}
              <a href={wa.general()} target="_blank" rel="noopener noreferrer" className="font-semibold text-white underline underline-offset-4">
                Message us on WhatsApp
              </a>
              .
            </p>
            <EnquiryForm />
          </div>
        </div>
      </Wrap>
    </Block>
  );
}
