import Link from "next/link";
import { notFound } from "next/navigation";
import { longDate, shortDate, plans, treks as staticTreks, fmtKcal } from "@f7/content";
import { can, currentStaff } from "@/server/admin-auth";
import { getMemberProfile, istToday, plusDays } from "@/server/admin-data";
import { admin } from "@/server/supabase";
import { addNoteAction, deleteNoteAction, setMemberPlanAction } from "@/app/admin/actions";
import { Badge, Button, Card, Empty, Field, Flash, Stat, inputCls } from "@/components/admin/ui";

const GOALS: Record<string, string> = { strength: "Get stronger", "fat-loss": "Lose fat", trek: "Train for treks", general: "Stay fit" };
const SLOTS: Record<string, string> = { early: "5–8 AM", morning: "8–12", ladies: "Ladies' hour", evening: "4–10 PM" };

export default async function MemberProfile({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; error?: string }> }) {
  const { id } = await params;
  const { ok, error } = await searchParams;
  const { staff } = await currentStaff();
  const editor = can(staff, "admin");
  const p = await getMemberProfile(id);
  if (!p) notFound();
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
            {m.phone ?? m.email ?? ""} · joined {longDate(m.joined_on)}{m.goal ? ` · ${GOALS[m.goal] ?? m.goal}` : ""}{m.slot ? ` · ${SLOTS[m.slot] ?? m.slot}` : ""}
          </p>
        </div>
        {m.phone ? <a href={`https://wa.me/${m.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"><Button variant="outline">WhatsApp</Button></a> : null}
      </header>
      <div className="mt-4"><Flash ok={ok} error={error} /></div>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Visits · 90 days" value={p.checkins.length} sub={p.checkins.length ? `last ${shortDate(p.checkins[p.checkins.length - 1])}` : "none"} />
        <Stat label="Weight" value={latest ? `${latest.kg} kg` : "—"} sub={first && latest && first !== latest ? `${latest.kg - first.kg > 0 ? "+" : ""}${Math.round((latest.kg - first.kg) * 10) / 10} kg since ${shortDate(first.date)}` : undefined} />
        <Stat label="Food · 14 days" value={foodDays ? `${foodDays} days` : "—"} sub={foodDays ? `≈ ${fmtKcal(avgKcal)} kcal/day` : "not logging"} />
        <Stat label="Water · activity" value={waterAvg ? `${(waterAvg / 1000).toFixed(1)} L` : "—"} sub={`${activeMin} active min · 14 days`} />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Card title="Plan">
          <div className="flex items-center gap-3">
            {m.plan_name ? <Badge tone={m.renews_on && m.renews_on < today ? "red" : "lime"}>{m.plan_name}</Badge> : <Badge>no plan</Badge>}
            {m.renews_on ? <span className="text-sm text-muted">{m.renews_on < today ? "ended" : "renews"} {longDate(m.renews_on)}</span> : null}
          </div>
          {editor ? (
            <form action={setMemberPlanAction} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] items-end">
              <input type="hidden" name="member_id" value={m.id} />
              <Field label="Plan">
                <select name="plan_id" defaultValue={m.plan_id ?? ""} className={inputCls}>
                  <option value="">No plan</option>
                  {plans.map((pl) => <option key={pl.id} value={pl.id}>{pl.name} · ₹{pl.priceINR}</option>)}
                </select>
              </Field>
              <Field label="Renews on">
                <input name="renews_on" type="date" defaultValue={m.renews_on ?? ""} className={inputCls} />
              </Field>
              <Button type="submit" variant="outline">Update</Button>
            </form>
          ) : null}
          <p className="text-xs text-muted mt-3">Set this when the member pays at the desk. The app updates on its next open.</p>
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
