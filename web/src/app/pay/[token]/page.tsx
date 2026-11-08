import type { Metadata } from "next";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { addressLine, brand, contact } from "@f7/content";
import { gymUpi, payPageData, readPayToken } from "@/server/billing";
import { istToday } from "@/server/admin-data";
import { dayMonth, dayMonthYear, endFor, inr, paidText, planById, planMonths, renewalStart, upiUri, waUrl } from "@/lib/billing";
import { CopyUpi } from "./CopyUpi";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Renew your membership", robots: { index: false, follow: false } };

const first = (name: string) => (name || "").trim().split(/\s+/)[0] || "there";

/**
 * /pay/<token> — the renewal link inside a WhatsApp reminder.
 *
 * Shows the member's plan, the next period and the price, with a button that
 * opens their UPI app (GPay / PhonePe / Paytm) with everything filled in, and
 * a QR for paying from another phone. Money goes straight to the gym's UPI ID
 * — no gateway, no fee. After paying they tap "I've paid" and the desk
 * records it; the receipt follows on WhatsApp.
 *
 * The link is tied to the end date it was sent for, so once the member has
 * renewed it just says "you're all set".
 */
export default async function PayPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const t = readPayToken(token);
  if (!t) notFound();
  const m = await payPageData(t.memberId);
  if (!m) notFound();

  const today = istToday();
  const vpa = gymUpi();
  const renewed = !!m.renews_on && m.renews_on > t.endsOn;
  const plan = planById(m.plan_id ?? "");
  const planName = plan?.name ?? m.plan_name ?? "Membership";
  const amount = plan?.priceINR ?? 0;
  const start = renewalStart(m.renews_on, today);
  const end = endFor(start, planMonths(m.plan_id ?? ""));
  const uri = vpa ? upiUri({ vpa, payee: brand.fullName, amount, note: `F7 ${planName} ${first(m.name)}` }) : null;
  const qr = uri ? await QRCode.toString(uri, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: "#121316", light: "#ffffff" } }) : null;
  const told = waUrl(contact.phone, paidText({ name: m.name, phone: m.phone, plan: planName, amount }));

  return (
    <main className="min-h-screen bg-paper px-4 py-10 text-fg">
      <article className="mx-auto max-w-md rounded-[24px] border border-line bg-surface p-6 shadow-[0_30px_60px_-40px_rgba(18,19,22,0.35)] sm:p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">{brand.fullName}</p>

        {renewed ? (
          <>
            <h1 className="cond mt-2 text-4xl leading-none">You&apos;re all set, {first(m.name)} ✅</h1>
            <p className="mt-3 text-sm text-muted">Your {m.plan_name ? `${m.plan_name} pass` : "membership"} is already renewed — valid till {dayMonthYear(m.renews_on!)}. See you on the floor!</p>
          </>
        ) : (
          <>
            <h1 className="cond mt-2 text-4xl leading-none">Renew, {first(m.name)}</h1>
            <p className="mt-2 text-sm text-muted">
              {m.renews_on ? (m.renews_on >= today ? `Your pass is valid till ${dayMonth(m.renews_on)}.` : `Your pass ended on ${dayMonth(m.renews_on)}.`) : null}
            </p>

            <div className="mt-6 rounded-2xl border border-line p-4">
              <div className="flex items-baseline justify-between gap-4">
                <span className="font-semibold">{planName}</span>
                <span className="cond tnum text-3xl">{amount ? inr(amount) : "—"}</span>
              </div>
              <p className="mt-1 text-sm text-muted">
                {dayMonthYear(start)} – {dayMonthYear(end)}
              </p>
            </div>

            {uri ? (
              <>
                <a href={uri} className="btn-green mt-6 flex w-full min-h-[52px] items-center justify-center rounded-full px-6 text-base font-bold text-on-accent">
                  Pay {amount ? inr(amount) : ""} with a UPI app
                </a>
                <p className="mt-2 text-center text-xs text-muted">Opens GPay, PhonePe, Paytm or your bank app with the amount filled in.</p>

                <div className="mt-6 grid gap-4 sm:grid-cols-[150px_1fr] sm:items-center">
                  <div className="mx-auto w-[150px] rounded-xl bg-[#ffffff] p-2" aria-label="UPI QR code" role="img" dangerouslySetInnerHTML={{ __html: qr! }} />
                  <div className="text-sm text-muted">
                    <p>Paying from another phone? Scan this QR, or pay to:</p>
                    <div className="mt-2">
                      <CopyUpi vpa={vpa!} />
                    </div>
                  </div>
                </div>

                <div className="mt-7 border-t border-line pt-5">
                  <p className="text-sm font-semibold">Paid? Tell us and we&apos;ll send your receipt.</p>
                  <a href={told} className="mt-3 flex min-h-[48px] w-full items-center justify-center rounded-full border border-line px-5 text-center text-sm font-bold">
                    I&apos;ve paid — tell the gym on WhatsApp
                  </a>
                </div>
              </>
            ) : (
              <p className="mt-6 rounded-2xl border border-line p-4 text-sm">Pay at the front desk — cash, card or UPI. Call {contact.phoneDisplay} if you have questions.</p>
            )}
          </>
        )}

        <p className="mt-8 text-xs leading-relaxed text-muted">{addressLine} · {contact.phoneDisplay}</p>
      </article>
    </main>
  );
}
