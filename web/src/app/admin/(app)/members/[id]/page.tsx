import Link from "next/link";
import { notFound } from "next/navigation";
import { longDate, shortDate, plans, treks as staticTreks, fmtKcal } from "@f7/content";
import { can, currentStaff } from "@/server/admin-auth";
import { getMemberProfile, istToday, plusDays } from "@/server/admin-data";
import { admin } from "@/server/supabase";
import { addNoteAction, deleteNoteAction, setMemberPlanAction } from "@/app/admin/actions";
import { Badge, Button, Card, Empty, Field, Flash, Stat, inputCls } from "@/components/admin/ui";
import { memberBilling, paymentById } from "@/server/billing";
import { recordPaymentAction, voidPaymentAction } from "@/app/admin/billing-actions";
import { PaymentFields, PaymentSubmit } from "@/components/admin/PaymentForm";
import { MigrationNotice } from "@/components/admin/MigrationNotice";
import { dayMonth, dayMonthYear, inr, methodLabel, normalizePhone, phoneDisplay, renewalStart, stageOf, STEP_LABEL } from "@/lib/billing";

const GOALS: Record<string, string> = { strength: "Get stronger", "fat-loss": "Lose fat", trek: "Train for treks", general: "Stay fit" };
const SLOTS: Record<string, string> = { early: "5–8 AM", morning: "8–12", ladies: "Ladies' hour", evening: "4–10 PM" };

export default async function MemberProfile({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; error?: string; paid?: string }> }) {
  const { id } = await params;
  const { ok, error, paid } = await searchParams;
  const { staff } = await currentStaff();
  const editor = can(staff, "admin");
  const p = await getMemberProfile(id);
  if (!p) notFound();
  const [bill, justPaid] = await Promise.all([memberBilling(id), paid ? paymentById(paid) : Promise.resolve(null)]);
  const owner = can(staff, "owner");
  const m = p.member;
  const today = istToday();

  // 12-week check-in grid (Mon–Sun columns)
  const set = new Set(p.checkins);
  const weeks: string[][] = [];
  const start = new Date(today + "T00:00:00Z");
  start.setUTCDate(start.getUTCDate() - ((start.getUTCDay() + 6) % 7) - 7 * 11);
  for (let w = 0; w < 12; w++) {
    const row: string[] = [];
    for (let d = 0; d < 7; d++) {
      const dt = new Date(start);
      dt.setUTCDate(start.getUTCDate() + w * 7 + d);
      row.push(dt.toISOString().slice(0, 10));
    }
    weeks.push(row);
  }
  const last14 = Array.from({ length: 14 }, (_, i) => plusDays(today, -13 + i));
  const kcalByDay = Object.fromEntries(last14.map((d) => [d, p.food.filter((f) => f.date === d).reduce((a, f) => a + Number(f.kcal), 0)]));
  const foodDays = last14.filter((d) => kcalByDay[d] > 0).length;
  const avgKcal = foodDays ? Math.round(last14.reduce((a, d) => a + kcalByDay[d], 0) / foodDays) : 0;
  const waterAvg = p.water.length ? Math.round(p.water.reduce((a, w) => a + Number(w.ml), 0) / p.water.length) : 0;
  const activeMin = p.activity.reduce((a, x) => a + x.minutes, 0);
  const trekNames: Record<string, string> = Object.fromEntries(staticTreks.map((t) => [t.id, t.title]));
  const a = admin();
  if (a && p.reservations.length) {
    const { data } = await a.from("treks").select("id, title").in("id", p.reservations.map((r) => r.trek_id));
    for (const t of (data ?? []) as { id: string; title: string }[]) trekNames[t.id] = t.title;
  }
  const first = p.weights[0];
  const latest = p.weights[p.weights.length - 1];

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.18em] uppercase text-lime font-bold"><Link href="/admin/members" className="underline">Members</Link></p>
          <h1 className="font-display text-3xl font-bold mt-1">{m.name || "Not onboarded yet"}</h1>
          <p className="text-muted text-sm mt-1">
            {m.phone ? phoneDisplay(m.phone) : m.email ?? ""} · joined {longDate(m.joined_on)}{m.goal ? ` · ${GOALS[m.goal] ?? m.goal}` : ""}{m.slot ? ` · ${SLOTS[m.slot] ?? m.slot}` : ""}
          </p>
        </div>
        {m.phone ? <a href={`https://wa.me/${normalizePhone(m.phone) ?? m.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"><Button variant="outline">WhatsApp</Button></a> : null}
      </header>
      <div className="mt-4"><Flash ok={ok} error={error} /></div>
      {justPaid && justPaid.member_id === id ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-lime/40 bg-surface p-4">
          <div>
            <p className="font-bold">Payment saved · {inr(justPaid.amount_inr)} · {justPaid.receipt_no}</p>
            <p className="text-sm text-muted">
              {justPaid.memberships ? `${justPaid.memberships.plan_name}, valid till ${dayMonthYear(justPaid.memberships.ends_on)}. ` : ""}Send them the receipt now.
            </p>
          </div>
          <div className="flex gap-2">
            {m.phone ? (
              <a href={`/admin/remind?p=${justPaid.id}&step=receipt`} target="_blank" rel="noreferrer" className="btn-green inline-flex min-h-[44px] items-center rounded-full px-5 font-bold text-on-accent">
                Send receipt on WhatsApp
              </a>
            ) : null}
            <a href={`/receipt/${justPaid.public_token}`} target="_blank" rel="noreferrer" className="inline-flex min-h-[44px] items-center rounded-full border border-line px-5 font-bold">
              View receipt
            </a>
          </div>
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Visits · 90 days" value={p.checkins.length} sub={p.checkins.length ? `last ${shortDate(p.checkins[p.checkins.length - 1])}` : "none"} />
        <Stat label="Weight" value={latest ? `${latest.kg} kg` : "—"} sub={first && latest && first !== latest ? `${latest.kg - first.kg > 0 ? "+" : ""}${Math.round((latest.kg - first.kg) * 10) / 10} kg since ${shortDate(first.date)}` : undefined} />
        <Stat label="Food · 14 days" value={foodDays ? `${foodDays} days` : "—"} sub={foodDays ? `≈ ${fmtKcal(avgKcal)} kcal/day` : "not logging"} />
        <Stat label="Water · activity" value={waterAvg ? `${(waterAvg / 1000).toFixed(1)} L` : "—"} sub={`${activeMin} active min · 14 days`} />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Card title="Membership & payments" className="lg:col-span-2">
          {(() => {
            const st = stageOf(m.renews_on, today);
            const tone = st.stage === "active" ? "lime" : st.stage === "due_soon" || st.stage === "due_today" || st.stage === "grace" ? "amber" : st.stage === "none" ? "muted" : "red";
            const words = { active: `valid till ${m.renews_on ? dayMonthYear(m.renews_on) : ""}`, due_soon: `ends ${m.renews_on ? dayMonth(m.renews_on) : ""} · in ${st.days} days`, due_today: "ends today", grace: `ended ${m.renews_on ? dayMonth(m.renews_on) : ""} · in grace`, lapsed: `ended ${m.renews_on ? dayMonth(m.renews_on) : ""} · lapsed`, winback: `ended ${m.renews_on ? dayMonth(m.renews_on) : ""}`, gone: "lapsed over 90 days", none: "no plan yet" }[st.stage];
            return (
              <div className="flex flex-wrap items-center gap-3">
                {m.plan_name ? <Badge tone={tone}>{m.plan_name}</Badge> : <Badge>no plan</Badge>}
                <span className="text-sm text-muted">{words}</span>
                {bill.reminders[0] ? <span className="text-xs text-muted">· last message: {STEP_LABEL[bill.reminders[0].step as keyof typeof STEP_LABEL] ?? bill.reminders[0].step}, {shortDate(bill.reminders[0].sent_at.slice(0, 10))}</span> : null}
              </div>
            );
          })()}
          {!bill.ready ? <MigrationNotice /> : null}

          <div className="mt-5 grid gap-6 lg:grid-cols-2">
            {editor ? (
              <form action={recordPaymentAction} id="pay" className="scroll-mt-6">
                <input type="hidden" name="member_id" value={m.id} />
                <p className="mb-3 text-sm font-bold">Record a payment / renew</p>
                <PaymentFields defaultPlan={m.plan_id && plans.some((pl) => pl.id === m.plan_id) ? m.plan_id : "monthly"} defaultStart={renewalStart(m.renews_on, today)} today={today} />
                <PaymentSubmit />
                <p className="mt-2 text-xs text-muted">Renewing before the end date (or within 5 days after) continues from the old end date, so no days are lost.</p>
              </form>
            ) : null}
            <div>
              <p className="mb-3 text-sm font-bold">Payments</p>
              {bill.payments.length ? (
                <ul className="divide-y divide-line text-sm">
                  {bill.payments.map((pay) => (
                    <li key={pay.id} className={`flex items-start justify-between gap-3 py-2.5 ${pay.voided ? "opacity-50" : ""}`}>
                      <div className="min-w-0">
                        <p className="font-semibold">
                          {pay.voided ? <s>{inr(pay.amount_inr)}</s> : inr(pay.amount_inr)} · {methodLabel(pay.method)}
                          {pay.voided ? <span className="ml-2"><Badge tone="red">void</Badge></span> : null}
                        </p>
                        <p className="text-xs text-muted">
                          {dayMonthYear(pay.paid_on)}{pay.memberships ? ` · ${pay.memberships.plan_name} ${dayMonth(pay.memberships.starts_on)}–${dayMonth(pay.memberships.ends_on)}` : ""} · {pay.recorded_by_name || "staff"}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1 text-xs">
                        <a href={`/receipt/${pay.public_token}`} target="_blank" rel="noreferrer" className="text-lime underline">{pay.receipt_no}</a>
                        {!pay.voided && m.phone ? <a href={`/admin/remind?p=${pay.id}&step=receipt`} target="_blank" rel="noreferrer" className="text-muted underline">Send on WhatsApp</a> : null}
                        {owner && !pay.voided ? (
                          <details>
                            <summary className="cursor-pointer text-muted underline">Void</summary>
                            <form action={voidPaymentAction} className="mt-1">
                              <input type="hidden" name="payment_id" value={pay.id} />
                              <input type="hidden" name="return" value={`/admin/members/${m.id}`} />
                              <button type="submit" className="rounded-full border border-red-400/40 px-3 py-1 font-bold tone-red">Yes, void</button>
                            </form>
                          </details>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <Empty>No payments recorded yet.</Empty>
              )}
              {editor ? (
                <details className="mt-4 text-sm">
                  <summary className="cursor-pointer text-muted underline">Correct the plan or end date without a payment</summary>
                  <form action={setMemberPlanAction} className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto] items-end">
                    <input type="hidden" name="member_id" value={m.id} />
                    <Field label="Plan">
                      <select name="plan_id" defaultValue={m.plan_id ?? ""} className={inputCls}>
                        <option value="">No plan</option>
                        {plans.map((pl) => <option key={pl.id} value={pl.id}>{pl.name}</option>)}
                      </select>
                    </Field>
                    <Field label="Valid till">
                      <input name="renews_on" type="date" defaultValue={m.renews_on ?? ""} className={inputCls} />
                    </Field>
                    <Button type="submit" variant="outline">Update</Button>
                  </form>
                </details>
              ) : null}
            </div>
          </div>
        </Card>

        <Card title="Check-ins · 12 weeks">
          <div className="flex gap-1">
            {weeks.map((w, i) => (
              <div key={i} className="flex flex-col gap-1">
                {w.map((d) => (
                  <div key={d} title={d} className={`size-3.5 rounded-sm ${d > today ? "bg-transparent" : set.has(d) ? "bg-green" : "bg-surface-2"}`} />
                ))}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted mt-2">Mon → Sun, oldest week on the left.</p>
        </Card>

        <Card title="Weight">
          {p.weights.length >= 2 ? (
            <div>
              <div className="flex items-end gap-1 h-24">
                {p.weights.slice(-20).map((w) => {
                  const min = Math.min(...p.weights.map((x) => x.kg));
                  const max = Math.max(...p.weights.map((x) => x.kg));
                  const h = 20 + ((w.kg - min) / Math.max(max - min, 2)) * 76;
                  return <div key={w.date} title={`${w.date}: ${w.kg} kg`} className="flex-1 rounded-t bg-surface-2 border border-line" style={{ height: `${h}%` }} />;
                })}
              </div>
              <p className="text-xs text-muted mt-2">{shortDate(p.weights[0].date)} → {shortDate(latest.date)} · {Math.min(...p.weights.map((x) => x.kg))}–{Math.max(...p.weights.map((x) => x.kg))} kg</p>
            </div>
          ) : (
            <Empty>{p.weights.length ? "One entry so far." : "No weight logged."}</Empty>
          )}
        </Card>

        <Card title="Food · last 14 days">
          {foodDays ? (
            <div>
              <div className="flex items-end gap-1 h-24">
                {last14.map((d) => {
                  const max = Math.max(...Object.values(kcalByDay), 1);
                  return <div key={d} title={`${d}: ${kcalByDay[d]} kcal`} className={`flex-1 rounded-t ${d === today ? "bg-green" : "bg-surface-2 border border-line"}`} style={{ height: `${(kcalByDay[d] / max) * 100}%` }} />;
                })}
              </div>
              <p className="text-xs text-muted mt-2">Logged {foodDays} of 14 days · avg {fmtKcal(avgKcal)} kcal · water avg {waterAvg ? `${waterAvg} ml` : "—"}</p>
            </div>
          ) : (
            <Empty>Not using the food log yet.</Empty>
          )}
          {p.activity.length ? (
            <ul className="mt-3 text-sm divide-y divide-line">
              {p.activity.slice(-5).reverse().map((x, i) => (
                <li key={i} className="py-1.5 flex justify-between"><span>{x.name}</span><span className="text-muted">{shortDate(x.date)} · {x.minutes} min · ≈{x.kcal} kcal</span></li>
              ))}
            </ul>
          ) : null}
        </Card>

        <Card title="Trek reservations">
          {p.reservations.length ? (
            <ul className="divide-y divide-line text-sm">
              {p.reservations.map((r) => (
                <li key={r.trek_id} className="py-2 flex items-center justify-between gap-3">
                  <Link href={`/admin/treks/${r.trek_id}`} className="hover:underline">{trekNames[r.trek_id] ?? r.trek_id}</Link>
                  <Badge tone={r.status === "confirmed" ? "lime" : r.status === "held" ? "amber" : "muted"}>{r.status}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>None.</Empty>
          )}
        </Card>

        <Card title="Staff notes">
          <form action={addNoteAction} className="flex gap-2">
            <input type="hidden" name="member_id" value={m.id} />
            <input name="body" placeholder="e.g. Wants PT from November · knee — go easy on squats" maxLength={1000} className={`${inputCls} mt-0`} />
            <Button type="submit" variant="outline">Add</Button>
          </form>
          {p.notes.length ? (
            <ul className="mt-3 divide-y divide-line text-sm">
              {p.notes.map((n) => (
                <li key={n.id} className="py-2 flex items-start justify-between gap-3">
                  <div>
                    <p>{n.body}</p>
                    <p className="text-xs text-muted">{n.author_name || "staff"} · {shortDate(n.created_at.slice(0, 10))}</p>
                  </div>
                  {editor ? (
                    <form action={deleteNoteAction}><input type="hidden" name="member_id" value={m.id} /><input type="hidden" name="note_id" value={n.id} /><button className="text-xs text-muted underline">remove</button></form>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
        </Card>
      </div>
    </>
  );
}
