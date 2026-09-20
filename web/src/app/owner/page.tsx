import type { Metadata } from "next";
import { cookies } from "next/headers";
import { treks, longDate, shortDate, brand } from "@f7/content";
import { admin, supabaseConfigured } from "@/server/supabase";
import { readLeads } from "@/server/leads";
import { OWNER_COOKIE, cookieValid, estimateInr, ownerEnabled } from "@/server/owner";

export const metadata: Metadata = { title: "Owner", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/**
 * /owner — read-only, one password, for the front desk.
 * Today's check-ins · plans ending this week · trek reservations · leads ·
 * what the food analyser cost this month. Server component; the secret key
 * never leaves the server.
 */

const istToday = () => {
  const d = new Date(Date.now() + 5.5 * 3_600_000);
  return d.toISOString().slice(0, 10);
};
const plusDays = (iso: string, n: number) => {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

type Row = Record<string, unknown>;

export default async function Owner({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const jar = await cookies();
  const { error } = await searchParams;
  const authed = cookieValid(jar.get(OWNER_COOKIE)?.value);

  if (!authed) {
    const msg = !ownerEnabled()
      ? "The dashboard is off: set OWNER_PASSWORD (8+ characters) on the server."
      : error === "wrong"
        ? "That password didn't match."
        : error === "slow"
          ? "Too many tries — wait ten minutes."
          : null;
    return (
      <main className="min-h-screen bg-ink text-white font-sans flex items-center justify-center px-6">
        <form method="post" action="/owner/login" className="w-full max-w-sm rounded-2xl border border-line bg-surface p-6">
          <p className="text-xs tracking-[0.18em] uppercase text-lime font-bold">{brand.name} · Owner</p>
          <h1 className="font-display text-2xl font-bold mt-2">Front desk</h1>
          <label className="block mt-6 text-xs tracking-[0.14em] uppercase text-muted">Password</label>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="mt-2 w-full rounded-xl border border-line bg-surface-2 px-4 py-3 text-white outline-none focus:border-green"
          />
          {msg ? <p className="mt-3 text-sm text-muted">{msg}</p> : null}
          <button type="submit" className="btn-green mt-5 w-full rounded-full py-3 font-extrabold text-on-accent" disabled={!ownerEnabled()}>
            Open
          </button>
        </form>
      </main>
    );
  }

  const today = istToday();
  const weekEnd = plusDays(today, 7);
  const monthStart = today.slice(0, 8) + "01";
  const c = admin();

  let checkins: Row[] = [];
  let expiring: Row[] = [];
  let reservations: Row[] = [];
  let usage: Row[] = [];
  let memberCount = 0;
  if (c) {
    const [ck, ex, rs, us, mc] = await Promise.all([
      c.from("checkins").select("created_at, members(name, phone, plan_name)").eq("date", today).order("created_at", { ascending: true }),
      c.from("members").select("name, phone, plan_name, renews_on").gte("renews_on", today).lte("renews_on", weekEnd).order("renews_on"),
      c.from("trek_reservations").select("trek_id, status, created_at, members(name, phone)").neq("status", "cancelled").order("created_at"),
      c.from("api_usage").select("kind, count, input_tokens, output_tokens").gte("date", monthStart),
      c.from("members").select("*", { count: "exact", head: true }),
    ]);
    checkins = (ck.data as Row[]) ?? [];
    expiring = (ex.data as Row[]) ?? [];
    reservations = (rs.data as Row[]) ?? [];
    usage = (us.data as Row[]) ?? [];
    memberCount = mc.count ?? 0;
  }
  const leads = await readLeads(50);

  const m = (r: Row) => (r.members as { name?: string; phone?: string; plan_name?: string } | null) ?? {};
  const byTrek = new Map<string, Row[]>();
  for (const r of reservations) {
    const k = String(r.trek_id);
    byTrek.set(k, [...(byTrek.get(k) ?? []), r]);
  }
  const cost: Record<"food_text" | "food_photo", { calls: number; inr: number }> = { food_text: { calls: 0, inr: 0 }, food_photo: { calls: 0, inr: 0 } };
  for (const u of usage) {
    const kind = u.kind === "food_photo" ? "food_photo" : "food_text";
    cost[kind].calls += Number(u.count ?? 0);
    cost[kind].inr += estimateInr(kind, Number(u.input_tokens ?? 0), Number(u.output_tokens ?? 0));
  }

  const time = (iso: unknown) => new Date(String(iso)).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" });

  return (
    <main className="min-h-screen bg-ink text-white font-sans px-5 py-8 md:px-10">
      <header className="flex flex-wrap items-end justify-between gap-4 max-w-5xl mx-auto">
        <div>
          <p className="text-xs tracking-[0.18em] uppercase text-lime font-bold">{brand.name} · Owner</p>
          <h1 className="font-display text-3xl font-bold mt-1">{longDate(today)}</h1>
          <p className="text-muted text-sm mt-1">
            {memberCount} member{memberCount === 1 ? "" : "s"} in the app · read-only
            {!supabaseConfigured ? " · Supabase not configured on this server" : ""}
          </p>
        </div>
        <form method="post" action="/owner/login">
          <input type="hidden" name="signout" value="1" />
          <button type="submit" className="text-sm text-muted underline">Sign out</button>
        </form>
      </header>

      <div className="max-w-5xl mx-auto grid gap-5 md:grid-cols-2 mt-8">
        <Section title={`Checked in today · ${checkins.length}`}>
          {checkins.length ? (
            <ul className="divide-y divide-line">
              {checkins.map((r, i) => (
                <li key={i} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="font-semibold">{m(r).name || "—"}</p>
                    <p className="text-muted text-xs">{m(r).phone ?? ""}{m(r).plan_name ? ` · ${m(r).plan_name}` : ""}</p>
                  </div>
                  <span className="text-muted text-sm tabular-nums">{time(r.created_at)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>No check-ins yet today.</Empty>
          )}
        </Section>

        <Section title={`Plans ending by ${shortDate(weekEnd)} · ${expiring.length}`}>
          {expiring.length ? (
            <ul className="divide-y divide-line">
              {expiring.map((r, i) => (
                <li key={i} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="font-semibold">{String(r.name || "—")}</p>
                    <p className="text-muted text-xs">{String(r.phone ?? "")}{r.plan_name ? ` · ${String(r.plan_name)}` : ""}</p>
                  </div>
                  <span className="text-sm tabular-nums">{shortDate(String(r.renews_on))}</span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>Nothing ending this week.</Empty>
          )}
        </Section>

        <Section title={`Trek reservations · ${reservations.length}`}>
          {byTrek.size ? (
            <div className="space-y-4">
              {[...byTrek.entries()].map(([id, rows]) => {
                const t = treks.find((x) => x.id === id);
                return (
                  <div key={id}>
                    <p className="text-xs tracking-[0.14em] uppercase text-lime font-bold">
                      {t ? `${t.title} · ${shortDate(t.date)}` : id} · {rows.length}
                    </p>
                    <ul className="mt-1 divide-y divide-line">
                      {rows.map((r, i) => (
                        <li key={i} className="flex items-center justify-between py-2">
                          <span className="font-semibold">{m(r).name || "—"}</span>
                          <span className="text-muted text-xs">{m(r).phone ?? ""} · {String(r.status)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          ) : (
            <Empty>No reservations held.</Empty>
          )}
        </Section>

        <Section title="Food analyser · this month">
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-surface-2 p-3">
              <dt className="text-muted text-xs uppercase tracking-[0.12em]">Text logs</dt>
              <dd className="font-display text-2xl font-bold mt-1">{cost.food_text.calls}</dd>
              <dd className="text-muted text-xs">≈ ₹{cost.food_text.inr.toFixed(0)}</dd>
            </div>
            <div className="rounded-xl bg-surface-2 p-3">
              <dt className="text-muted text-xs uppercase tracking-[0.12em]">Photo logs</dt>
              <dd className="font-display text-2xl font-bold mt-1">{cost.food_photo.calls}</dd>
              <dd className="text-muted text-xs">≈ ₹{cost.food_photo.inr.toFixed(0)}</dd>
            </div>
          </dl>
          <p className="text-muted text-xs mt-3">Only logs that needed the model are counted; most text logs are answered from the food table for free.</p>
        </Section>

        <Section title={`Leads · last ${leads.length}`} wide>
          {leads.length ? (
            <ul className="divide-y divide-line">
              {leads.map((l) => (
                <li key={l.id} className="py-2.5 grid gap-1 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <p className="font-semibold">
                      {l.name} <span className="text-muted font-normal">· {l.phone}</span>
                      {l.interest ? <span className="ml-2 rounded-full border border-line px-2 py-0.5 text-xs text-lime">{l.interest}</span> : null}
                    </p>
                    {l.message ? <p className="text-muted text-sm mt-0.5">{l.message}</p> : null}
                  </div>
                  <span className="text-muted text-xs tabular-nums">{l.createdAt.slice(0, 10)} · {l.source}</span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>No enquiries yet.</Empty>
          )}
        </Section>
      </div>
    </main>
  );
}

function Section({ title, children, wide }: { title: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <section className={`rounded-2xl border border-line bg-surface p-5 ${wide ? "md:col-span-2" : ""}`}>
      <h2 className="font-display text-lg font-bold">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-muted text-sm">{children}</p>;
}
