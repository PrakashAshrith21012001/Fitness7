import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { can, currentStaff } from "@/server/admin-auth";
import { istToday } from "@/server/admin-data";
import { collections } from "@/server/billing";
import { voidPaymentAction } from "@/app/admin/billing-actions";
import { dayMonth, inr, methodLabel, PAY_METHODS } from "@/lib/billing";
import { Badge, Card, Empty, Flash, Stat } from "@/components/admin/ui";
import { MigrationNotice } from "@/components/admin/MigrationNotice";

export const metadata: Metadata = { title: "Collections" };

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const shift = (month: string, n: number) => {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + n, 1));
  return d.toISOString().slice(0, 7);
};

/** /admin/collections — every payment in a month, totals by method, receipts, CSV for the accountant. */
export default async function CollectionsPage({ searchParams }: { searchParams: Promise<{ month?: string; ok?: string; error?: string }> }) {
  const sp = await searchParams;
  const { staff } = await currentStaff();
  if (!can(staff, "admin")) redirect("/admin");
  const owner = can(staff, "owner");
  const today = istToday();
  const month = /^\d{4}-\d{2}$/.test(sp.month ?? "") ? sp.month! : today.slice(0, 7);
  const { ready, payments } = await collections(month);
  const live = payments.filter((p) => !p.voided);
  const total = live.reduce((s, p) => s + p.amount_inr, 0);
  const byMethod = PAY_METHODS.map((m) => ({ ...m, sum: live.filter((p) => p.method === m.id).reduce((s, p) => s + p.amount_inr, 0) })).filter((m) => m.sum > 0);
  const todaySum = live.filter((p) => p.paid_on === today).reduce((s, p) => s + p.amount_inr, 0);
  const label = `${MONTHS[Number(month.slice(5)) - 1]} ${month.slice(0, 4)}`;

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.18em] uppercase text-lime font-bold">Money in</p>
          <h1 className="font-display text-3xl font-bold mt-1">Collections</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/admin/collections?month=${shift(month, -1)}`} className="inline-flex min-h-[44px] items-center rounded-full border border-line px-4 text-sm font-bold" aria-label="Previous month">←</Link>
          <span className="min-w-36 text-center font-semibold">{label}</span>
          <Link href={`/admin/collections?month=${shift(month, 1)}`} className="inline-flex min-h-[44px] items-center rounded-full border border-line px-4 text-sm font-bold" aria-label="Next month">→</Link>
          <a href={`/admin/collections/export?month=${month}`} className="inline-flex min-h-[44px] items-center rounded-full border border-line px-4 text-sm font-bold">Download CSV</a>
        </div>
      </header>
      <div className="mt-4"><Flash ok={sp.ok} error={sp.error} /></div>
      {!ready ? <MigrationNotice /> : null}

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label={label} value={inr(total)} sub={`${live.length} payment${live.length === 1 ? "" : "s"}`} />
        {month === today.slice(0, 7) ? <Stat label="Today" value={inr(todaySum)} /> : null}
        {byMethod.slice(0, month === today.slice(0, 7) ? 2 : 3).map((m) => (
          <Stat key={m.id} label={m.label} value={inr(m.sum)} sub={total ? `${Math.round((m.sum / total) * 100)}% of the month` : undefined} />
        ))}
      </div>

      <Card className="mt-6" title="Payments">
        {payments.length ? (
          <div className="-mx-2 overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.1em] text-muted">
                  <th className="px-2 py-2 font-semibold">Date</th>
                  <th className="px-2 py-2 font-semibold">Member</th>
                  <th className="px-2 py-2 font-semibold">Plan · valid</th>
                  <th className="px-2 py-2 font-semibold">Method</th>
                  <th className="px-2 py-2 font-semibold text-right">Amount</th>
                  <th className="px-2 py-2 font-semibold">Receipt</th>
                  {owner ? <th className="px-2 py-2" /> : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {payments.map((p) => (
                  <tr key={p.id} className={p.voided ? "opacity-50" : undefined}>
                    <td className="px-2 py-2.5 tabular-nums whitespace-nowrap">{dayMonth(p.paid_on)}</td>
                    <td className="px-2 py-2.5">
                      <Link href={`/admin/members/${p.member_id}`} className="font-semibold hover:underline">{p.members?.name || "—"}</Link>
                    </td>
                    <td className="px-2 py-2.5 text-muted whitespace-nowrap">
                      {p.memberships ? `${p.memberships.plan_name} · ${dayMonth(p.memberships.starts_on)}–${dayMonth(p.memberships.ends_on)}` : "—"}
                    </td>
                    <td className="px-2 py-2.5 whitespace-nowrap">{methodLabel(p.method)}{p.reference ? <span className="text-muted"> · {p.reference}</span> : null}</td>
                    <td className="px-2 py-2.5 text-right font-bold tabular-nums">{p.voided ? <s>{inr(p.amount_inr)}</s> : inr(p.amount_inr)}</td>
                    <td className="px-2 py-2.5 whitespace-nowrap">
                      <a href={`/receipt/${p.public_token}`} target="_blank" rel="noreferrer" className="text-lime underline">{p.receipt_no}</a>
                      {p.voided ? <span className="ml-2"><Badge tone="red">void</Badge></span> : null}
                    </td>
                    {owner ? (
                      <td className="px-2 py-2.5 text-right">
                        {!p.voided ? (
                          <details className="inline-block text-left">
                            <summary className="cursor-pointer text-xs text-muted underline">Void</summary>
                            <form action={voidPaymentAction} className="mt-2">
                              <input type="hidden" name="payment_id" value={p.id} />
                              <input type="hidden" name="return" value={`/admin/collections?month=${month}`} />
                              <button type="submit" className="rounded-full border border-red-400/40 px-3 py-1.5 text-xs font-bold tone-red">Yes, void it</button>
                            </form>
                          </details>
                        ) : null}
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty>No payments recorded in {label}.</Empty>
        )}
      </Card>
      <p className="mt-3 text-xs text-muted">Voiding a payment (owner only) cancels the plan period it paid for; the receipt number stays used so the sequence has no gaps.</p>
    </>
  );
}
