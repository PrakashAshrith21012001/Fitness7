"use client";

import { ArrowUpRight, MessageCircle, Navigation, Phone } from "lucide-react";
import { addressLine, brand, contact, hours, telLink, wa } from "@f7/content";
import { useOpenStatus } from "@/lib/useOpenStatus";
import { EnquiryForm } from "@/components/EnquiryForm";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const compact = (t: string | null) => (t ? t.replace(/:00/g, "").replace(/\s*–\s*/g, "–") : null);

/** Where, when, how to reach us — and the call-back form beside it. */
export function VisitUs() {
  const status = useOpenStatus();
  const today = status ? DAYS[status.todayIndex] : null;

  return (
    <section id="visit" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <p className="eyebrow">Visit</p>
        <h2 data-reveal="lines" className="h-section mt-3 max-w-3xl text-fg">
          Walk in. Train. Decide after.
        </h2>

        <div className="mt-12 grid gap-4 lg:grid-cols-[1.1fr_1fr]">
          <div className="rounded-[28px] bg-surface p-6 ring-1 ring-line sm:p-8">
            <div className="flex items-center gap-2 text-sm font-semibold text-fg">
              <span className={`size-2 rounded-full ${status ? (status.open ? "bg-brand" : "bg-[#d39b2a]") : "bg-line"}`} />
              {status?.text ?? "Opening hours below"}
            </div>
            <p className="mt-4 text-2xl font-extrabold tracking-[-0.02em] text-fg">{brand.fullName}</p>
            <a href={contact.mapsUrl} target="_blank" rel="noopener noreferrer" className="group mt-1 inline-flex items-start gap-1 text-base leading-relaxed text-muted hover:text-fg">
              {addressLine}
              <ArrowUpRight className="mt-1 size-4 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={2} />
            </a>

            <div className="mt-6 grid grid-cols-3 gap-2">
              {[
                { href: contact.mapsUrl, label: "Directions", icon: Navigation, ext: true },
                { href: telLink(), label: "Call", icon: Phone, ext: false },
                { href: wa.general(), label: "WhatsApp", icon: MessageCircle, ext: true },
              ].map((b) => (
                <a
                  key={b.label}
                  href={b.href}
                  {...(b.ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="press flex min-h-16 flex-col items-center justify-center gap-1.5 rounded-2xl bg-surface-2 text-sm font-bold text-fg hover:bg-fg hover:text-paper"
                >
                  <b.icon className="size-4" strokeWidth={2} />
                  {b.label}
                </a>
              ))}
            </div>

            <table className="mt-8 w-full text-sm">
              <caption className="eyebrow pb-3 text-left">Opening hours</caption>
              <tbody>
                {hours.map((h) => {
                  const isToday = h.day === today;
                  return (
                    <tr key={h.day} className={`border-t border-line ${isToday ? "text-fg" : "text-muted"}`}>
                      <th scope="row" className={`py-2.5 text-left ${isToday ? "font-bold" : "font-semibold text-fg"}`}>
                        {h.day}
                        {isToday ? <span className="ml-2 hidden rounded-full bg-brand px-2 py-0.5 text-[10px] sm:inline font-bold uppercase tracking-[0.08em] text-fg">Today</span> : null}
                      </th>
                      <td className={`tnum whitespace-nowrap py-2.5 text-right ${isToday ? "font-bold" : ""}`}>{compact(h.morning) ?? "—"}</td>
                      <td className={`tnum whitespace-nowrap py-2.5 pl-4 text-right ${isToday ? "font-bold" : ""}`}>{compact(h.evening) ?? "Closed"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="mt-3 text-sm text-muted">Ladies-only hours: Monday to Saturday, 11 AM – 1 PM.</p>
          </div>

          <div className="rounded-[28px] bg-surface p-6 ring-1 ring-line sm:p-8">
            <p className="text-2xl font-extrabold tracking-[-0.02em] text-fg">Prefer a call?</p>
            <p className="mt-1 text-base text-muted">Leave your number and a coach will ring you back within a day.</p>
            <EnquiryForm />
          </div>
        </div>
      </div>
    </section>
  );
}
