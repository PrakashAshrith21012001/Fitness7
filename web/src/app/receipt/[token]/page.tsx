import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { addressLine, brand, contact } from "@f7/content";
import { receiptByToken } from "@/server/billing";
import { dayMonthYear, inr, methodLabel, phoneDisplay } from "@/lib/billing";
import { PrintButton } from "./PrintButton";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Payment receipt", robots: { index: false, follow: false } };

/**
 * /receipt/<token> — the receipt a member opens from WhatsApp. The token is a
 * random UUID per payment, so the link is private to whoever was sent it.
 * Prints cleanly on A4 / saves as PDF from the browser.
 */
export default async function ReceiptPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const r = await receiptByToken(token);
  if (!r) notFound();
  const gstin = process.env.GYM_GSTIN?.trim();

  return (
    <main className="min-h-screen bg-paper px-4 py-10 text-fg print:bg-[#ffffff] print:py-0">
      <article className="mx-auto max-w-xl rounded-[24px] border border-line bg-surface p-7 shadow-[0_30px_60px_-40px_rgba(18,19,22,0.35)] sm:p-10 print:border-0 print:shadow-none">
        <header className="flex items-start justify-between gap-6">
          <div>
            <p className="cond text-3xl leading-none">{brand.fullName}</p>
            <p className="mt-2 max-w-xs text-xs leading-relaxed text-muted">{addressLine}</p>
            <p className="text-xs text-muted">{contact.phoneDisplay}{gstin ? ` · GSTIN ${gstin}` : ""}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Receipt</p>
            <p className="mt-1 whitespace-nowrap font-mono text-sm font-bold">{r.receipt_no}</p>
            <p className="text-xs text-muted">{dayMonthYear(r.paid_on)}</p>
          </div>
        </header>

        {r.voided ? <p className="mt-6 rounded-xl border border-red-400/40 px-4 py-2 text-sm font-bold text-red-500">This receipt was cancelled.</p> : null}

        <section className="mt-8 border-t border-line pt-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Received from</p>
          <p className="mt-1 text-lg font-bold">{r.members?.name || "Member"}</p>
          {r.members?.phone ? <p className="text-sm text-muted">{phoneDisplay(r.members.phone)}</p> : null}
        </section>

        <table className="mt-6 w-full text-sm">
          <tbody className="divide-y divide-line">
            <tr>
              <td className="py-3 text-muted">Plan</td>
              <td className="py-3 text-right font-semibold">{r.memberships?.plan_name ?? "Membership"}</td>
            </tr>
            {r.memberships ? (
              <tr>
                <td className="py-3 text-muted">Valid</td>
                <td className="py-3 text-right font-semibold">{dayMonthYear(r.memberships.starts_on)} – {dayMonthYear(r.memberships.ends_on)}</td>
              </tr>
            ) : null}
            <tr>
              <td className="py-3 text-muted">Paid by</td>
              <td className="py-3 text-right font-semibold">{methodLabel(r.method)}{r.reference ? ` · ${r.reference}` : ""}</td>
            </tr>
            <tr>
              <td className="py-4 font-bold">Amount received</td>
              <td className="cond tnum py-4 text-right text-3xl">{inr(r.amount_inr)}</td>
            </tr>
          </tbody>
        </table>

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6 text-xs text-muted">
          <p>Thank you for training with us.{r.recorded_by_name ? ` Received by ${r.recorded_by_name}.` : ""}</p>
          <PrintButton />
        </footer>
      </article>
    </main>
  );
}
