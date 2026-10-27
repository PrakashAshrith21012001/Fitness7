"use client";

import { MapPin, MessageCircle, Navigation, Phone } from "lucide-react";
import { addressLine, brand, contact, hours, telLink, wa } from "@f7/content";
import { photo } from "@/lib/photos";
import { useOpenStatus } from "@/lib/useOpenStatus";
import { EnquiryForm } from "@/components/EnquiryForm";
import { Photo, Wrap } from "@/components/app/ui";
import { SectionHeader } from "@/components/site/SectionHeader";

/** "5:00 AM – 12:00 PM" → "5 AM–12 PM" so a week of hours fits a phone without wrapping. */
const compact = (t: string | null) => (t ? t.replace(/:00/g, "").replace(/\s*–\s*/g, "–") : null);

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/**
 * Where, when, and how to reach us — all in one card (Common Region), with
 * today's hours highlighted and the live open/closed state, next to the
 * call-back form. Contact info is never more than one tap away.
 */
export function Visit() {
  const status = useOpenStatus();
  const today = status ? DAYS[status.todayIndex] : null;

  return (
    <section id="visit" className="pt-16 sm:pt-24">
      <Wrap>
        <SectionHeader kicker="Visit" title="Walk in. Train. Decide after." sub="No appointment needed for your first session — bring training shoes and a water bottle." />
        <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
          <div className="pane overflow-hidden">
            <a href={contact.mapsUrl} target="_blank" rel="noopener noreferrer" className="relative block h-[200px] sm:h-[260px]" aria-label="Open the gym in Google Maps">
              <Photo src={photo("gym-floor")} alt={`The training floor at ${brand.fullName}`} sizes="(min-width: 1024px) 640px, 100vw" />
              <span className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-md bg-[rgba(9,12,28,0.85)] px-2.5 py-1.5 text-xs font-semibold text-[#fff]">
                <span className={`size-2 rounded-full ${status ? (status.open ? "bg-[#3ddc84]" : "bg-[#ffc857]") : "bg-[rgba(255,255,255,0.4)]"}`} />
                {status?.text ?? "Opening hours below"}
              </span>
            </a>

            <div className="p-4 sm:p-5">
              <h3 className="text-lg font-extrabold text-white">{brand.fullName}</h3>
              <p className="mt-1 flex gap-1.5 text-sm leading-relaxed text-muted">
                <MapPin className="mt-0.5 size-4 shrink-0" strokeWidth={2} /> {addressLine}
              </p>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <a href={contact.mapsUrl} target="_blank" rel="noopener noreferrer" className="press flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg bg-surface text-xs font-bold text-white hover:bg-surface-2">
                  <Navigation className="size-4" strokeWidth={2} /> Directions
                </a>
                <a href={telLink()} className="press flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg bg-surface text-xs font-bold text-white hover:bg-surface-2">
                  <Phone className="size-4" strokeWidth={2} /> Call
                </a>
                <a href={wa.general()} target="_blank" rel="noopener noreferrer" className="press flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg bg-surface text-xs font-bold text-white hover:bg-surface-2">
                  <MessageCircle className="size-4" strokeWidth={2} /> WhatsApp
                </a>
              </div>

              <table className="mt-5 w-full text-[13px]">
                <caption className="label pb-2 text-left">Opening hours</caption>
                <tbody>
                  {hours.map((h) => {
                    const isToday = h.day === today;
                    return (
                      <tr key={h.day} className={`border-t border-line ${isToday ? "font-bold text-white" : "text-muted"}`}>
                        <th scope="row" className="py-2 text-left font-semibold text-white">
                          {h.day}
                          {isToday ? <span className="ml-1.5 rounded bg-surface-2 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.06em]">Today</span> : null}
                        </th>
                        <td className="tnum whitespace-nowrap py-2 text-right">{compact(h.morning) ?? "—"}</td>
                        <td className="tnum whitespace-nowrap py-2 pl-3 text-right">{compact(h.evening) ?? "Closed"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p className="mt-2 text-xs text-muted">Ladies-only hours: Monday to Saturday, 11 AM – 1 PM.</p>
            </div>
          </div>

          <div className="pane self-start p-5 sm:p-6 lg:sticky lg:top-24">
            <h3 className="text-xl font-extrabold text-white">Prefer a call?</h3>
            <p className="mt-1 text-sm text-muted">Leave your number and a coach will ring you back within a day.</p>
            <EnquiryForm />
          </div>
        </div>
      </Wrap>
    </section>
  );
}
