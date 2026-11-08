import Link from "next/link";
import type { Metadata } from "next";
import { can, currentStaff } from "@/server/admin-auth";
import { atRisk, duesBoard, gymUpi, renewalStats } from "@/server/billing";
import { AT_RISK_DAYS, dayMonth, inr, normalizePhone, phoneDisplay, STAGES, STEP_LABEL, type ReminderStep } from "@/lib/billing";
import { Badge, Card, Empty, Flash, Stat } from "@/components/admin/ui";
import { MigrationNotice } from "@/components/admin/MigrationNotice";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Dues" };

const ago = (iso: string) => {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `${Math.max(1, mins)} min ago`;
  if (mins < 60 * 24) return `${Math.round(mins / 60)} h ago`;
  return `${Math.round(mins / 1440)} d ago`;
};

/**
 * /admin/dues — who to chase today. Members move through the columns on their
 * own as their end date approaches and passes; a payment sends them back to
 * Active (off this board). Each card: one-tap WhatsApp reminder (logged),
 * call, record payment.
 */
export default async function DuesPage({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const { ok, error } = await searchParams;
  const { staff } = await currentStaff();
  const money = can(staff, "admin");
  const [{ ready, members }, s, risk] = await Promise.all([duesBoard(), renewalStats(), atRisk()]);
  const toSend = members.filter((m) => m.remindable).length;
  const upi = gymUpi();
  const toNudge = risk.filter((r) => !r.nudgedAt && r.phone && !members.some((m) => m.id === r.id)).length;
  const queued = toSend + toNudge;
  const rate = s.due ? Math.round((s.renewed / s.due) * 100) : null;

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.18em] uppercase text-lime font-bold">Renewals</p>
          <h1 className="font-display text-3xl font-bold mt-1">Dues</h1>
          <p className="text-muted text-sm mt-1">{toSend ? `${toSend} reminder${toSend === 1 ? "" : "s"} to send today.` : "Everyone due has been reminded today."}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {queued ? (
            <Link href="/admin/dues/today" className="btn-green inline-flex min-h-[44px] items-center rounded-full px-5 font-bold text-on-accent">
              Send today&apos;s {queued} →
            </Link>
          ) : null}
          {money ? (
            <Link href="/admin/members/new" className={cn("inline-flex min-h-[44px] items-center rounded-full px-5 font-bold", queued ? "border border-line" : "btn-green text-on-accent")}>
              + Add member
            </Link>
          ) : null}
        </div>
      </header>
      <div className="mt-4">
        <Flash ok={ok} error={error} />
      </div>
      {!ready ? <MigrationNotice /> : null}

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Due this week" value={s.dueWeek} sub={s.dueWeekInr ? `≈ ${inr(s.dueWeekInr)} to collect` : "nothing pending"} />
        <Stat label="Collected today" value={inr(s.collectedToday)} />
        <Stat label="This month" value={inr(s.collectedMonth)} sub="all methods" />
        <Stat label="Renewal rate" value={rate === null ? "—" : `${rate}%`} sub={s.due ? `${s.renewed} of ${s.due} renewed · 30 days` : "shows once plans run out"} />
      </div>

      <div className="mt-6 space-y-6">
        {STAGES.map((col) => {
          const list = members.filter((m) => m.stage === col.id);
          return (
            <section key={col.id} aria-labelledby={`col-${col.id}`}>
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <h2 id={`col-${col.id}`} className="font-display text-lg font-bold">
                  {col.label} <span className="text-muted font-normal">· {list.length}</span>
                </h2>
                <p className="text-xs text-muted">{col.hint}</p>
              </div>
              {list.length ? (
                <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {list.map((m) => {
                    const sent = m.remindedForStep;
                    const when = m.days > 0 ? `ends ${dayMonth(m.renews_on)} · in ${m.days} day${m.days === 1 ? "" : "s"}` : m.days === 0 ? "ends today" : `ended ${dayMonth(m.renews_on)} · ${-m.days} day${m.days === -1 ? "" : "s"} ago`;
                    return (
                      <li key={m.id} className="rounded-2xl border border-line bg-surface p-4">
                        <div className="flex items-start justify-between gap-3">
                          <Link href={`/admin/members/${m.id}`} className="min-w-0">
                            <p className="font-semibold truncate">{m.name || "—"}</p>
                            <p className="text-muted text-xs truncate">{phoneDisplay(m.phone)}{m.plan_name ? ` · ${m.plan_name}` : ""}</p>
                          </Link>
                          {m.expected ? <span className="shrink-0 text-sm font-bold tabular-nums">{inr(m.expected)}</span> : null}
                        </div>
                        <p className="mt-2 text-sm">{when}</p>
                        <p className="text-xs text-muted">{m.last_checkin ? `last visit ${dayMonth(m.last_checkin)}` : "no app check-ins"}</p>
                        <div className="mt-2">
                          {m.paidTill ? (
                            <Link href={`/admin/members/${m.id}`} className="block">
                              <Badge tone="amber">Paid till {dayMonth(m.paidTill)} — fix end date</Badge>
                            </Link>
                          ) : sent ? (
                            <Badge tone="lime">{STEP_LABEL[m.step as ReminderStep]} sent · {ago(m.lastReminder!.sent_at)}</Badge>
                          ) : m.step ? (
                            <Badge tone="amber">{STEP_LABEL[m.step]} not sent</Badge>
                          ) : null}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {m.phone && m.step && !m.paidTill ? (
                            <a
                              href={`/admin/remind?m=${m.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className={cn("inline-flex min-h-[40px] items-center rounded-full px-4 text-sm font-bold", sent ? "border border-line" : "btn-green text-on-accent")}
                            >
                              {sent ? "WhatsApp again" : "Send WhatsApp"}
                            </a>
                          ) : null}
                          {m.phone ? (
                            <a href={`tel:+${normalizePhone(m.phone) ?? m.phone.replace(/\D/g, "")}`} className="inline-flex min-h-[40px] items-center rounded-full border border-line px-4 text-sm font-bold">
                              Call
                            </a>
                          ) : null}
                          {money ? (
                            <Link href={`/admin/members/${m.id}#pay`} className="inline-flex min-h-[40px] items-center rounded-full border border-line px-4 text-sm font-bold">
                              Record payment
                            </Link>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <Card>
                  <Empty>Nobody here.</Empty>
                </Card>
              )}
            </section>
          );
        })}
      </div>
      <section aria-labelledby="col-risk" className="mt-8">
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <h2 id="col-risk" className="font-display text-lg font-bold">
            At risk <span className="text-muted font-normal">· {risk.length}</span>
          </h2>
          <p className="text-xs text-muted">Plan still running, no visit for {AT_RISK_DAYS}+ days</p>
        </div>
        {risk.length ? (
          <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {risk.map((r) => (
              <li key={r.id} className="rounded-2xl border border-line bg-surface p-4">
                <Link href={`/admin/members/${r.id}`} className="block min-w-0">
                  <p className="font-semibold truncate">{r.name || "—"}</p>
                  <p className="text-muted text-xs truncate">{phoneDisplay(r.phone)}{r.plan_name ? ` · ${r.plan_name}` : ""}</p>
                </Link>
                <p className="mt-2 text-sm">last visit {dayMonth(r.last_checkin)} · {r.away} days ago</p>
                <p className="text-xs text-muted">plan runs till {dayMonth(r.renews_on)}</p>
                <div className="mt-2">{r.nudgedAt ? <Badge tone="lime">Note sent · {ago(r.nudgedAt)}</Badge> : <Badge tone="amber">Not contacted</Badge>}</div>
                {r.phone ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a href={`/admin/remind?m=${r.id}&step=nudge`} target="_blank" rel="noreferrer" className={cn("inline-flex min-h-[40px] items-center rounded-full px-4 text-sm font-bold", r.nudgedAt ? "border border-line" : "btn-green text-on-accent")}>
                      {r.nudgedAt ? "WhatsApp again" : "Send “we miss you”"}
                    </a>
                    <a href={`tel:+${normalizePhone(r.phone) ?? r.phone.replace(/\D/g, "")}`} className="inline-flex min-h-[40px] items-center rounded-full border border-line px-4 text-sm font-bold">
                      Call
                    </a>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <Card>
            <Empty>Nobody — every regular has been in within {AT_RISK_DAYS} days.</Empty>
          </Card>
        )}
      </section>

      <p className="mt-6 text-xs text-muted">
        {upi ? (
          <>UPI pay links are on — reminders carry a link, and the money goes to <b className="font-mono">{upi}</b>. Change it with GYM_UPI_ID in Render.</>
        ) : (
          <>UPI pay links are off — set GYM_UPI_ID in Render to add a pay link to every reminder.</>
        )}
      </p>
      <p className="mt-2 text-xs text-muted">
        &ldquo;Send WhatsApp&rdquo; opens WhatsApp with the message ready — press send there. It&apos;s logged here so nobody messages the same person twice.
      </p>
    </>
  );
}
