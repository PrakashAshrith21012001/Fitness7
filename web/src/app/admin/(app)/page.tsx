import Link from "next/link";
import { longDate, shortDate } from "@f7/content";
import { overview } from "@/server/admin-data";
import { supabaseConfigured } from "@/server/supabase";
import { Badge, Card, Empty, Stat } from "@/components/admin/ui";

type Row = Record<string, unknown>;
const m = (r: Row) => (r.members as { name?: string; phone?: string; plan_name?: string } | null) ?? {};
const time = (iso: unknown) => new Date(String(iso)).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" });

/** /admin — the day at a glance, with a link into everything. */
export default async function AdminHome() {
  const o = await overview();
  return (
    <>
      <header>
        <p className="text-xs tracking-[0.18em] uppercase text-lime font-bold">Today</p>
        <h1 className="font-display text-3xl font-bold mt-1">{longDate(o.today)}</h1>
        {!supabaseConfigured ? <p className="text-sm text-amber-300 mt-2">Supabase isn't configured on this server — nothing to show yet.</p> : null}
      </header>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Checked in" value={o.checkins.length} sub="today" />
        <Stat label="Active members" value={o.active30} sub={`of ${o.members} · last 30 days`} />
        <Stat label="Plans ending" value={o.expiring.length} sub="next 7 days" />
        <Stat label="New leads" value={o.newLeads} sub="not yet contacted" />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Card title={`Checked in today · ${o.checkins.length}`} action={<Link href="/admin/members" className="text-sm text-lime underline">All members</Link>}>
          {o.checkins.length ? (
            <ul className="divide-y divide-line">
              {o.checkins.map((r, i) => (
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
        </Card>

        <Card title={`Plans ending this week · ${o.expiring.length}`} action={<Link href="/admin/members?filter=expiring" className="text-sm text-lime underline">Open list</Link>}>
          {o.expiring.length ? (
            <ul className="divide-y divide-line">
              {o.expiring.map((r, i) => (
                <li key={i} className="flex items-center justify-between py-2.5">
                  <Link href={`/admin/members/${String(r.id)}`} className="min-w-0">
                    <p className="font-semibold truncate">{String(r.name || "—")}</p>
                    <p className="text-muted text-xs">{String(r.phone ?? "")}{r.plan_name ? ` · ${String(r.plan_name)}` : ""}</p>
                  </Link>
                  <span className="text-sm tabular-nums">{shortDate(String(r.renews_on))}</span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>Nothing ending this week.</Empty>
          )}
        </Card>

        <Card title="Upcoming treks" action={<Link href="/admin/treks/new" className="text-sm text-lime underline">Post a trek</Link>}>
          {o.upcoming.length ? (
            <ul className="divide-y divide-line">
              {o.upcoming.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 py-2.5">
                  <Link href={`/admin/treks/${t.id}`} className="min-w-0">
                    <p className="font-semibold truncate">{t.title}</p>
                    <p className="text-muted text-xs">{shortDate(t.date)} · {t.location}</p>
                  </Link>
                  <div className="text-right shrink-0">
                    <p className="text-sm tabular-nums">{t.reserved} / {t.slots_total}</p>
                    <Badge tone={t.status === "published" ? "lime" : "muted"}>{t.status}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>No treks posted yet — the site is showing the built-in list. <Link href="/admin/treks/new" className="text-lime underline">Post the first one.</Link></Empty>
          )}
        </Card>

        <Card title="Food analyser · this month">
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Text logs" value={o.usage.text} />
            <Stat label="Photo logs" value={o.usage.photo} />
            <Stat label="Cost" value={`₹${o.usage.inr.toFixed(0)}`} sub="list prices" />
          </div>
          <p className="text-muted text-xs mt-3">Only logs that needed the model are counted; most text logs are answered from the food table for free.</p>
        </Card>

        <Card title="Live announcements" action={<Link href="/admin/announcements" className="text-sm text-lime underline">Manage</Link>} className="lg:col-span-2">
          {o.announcements.length ? (
            <ul className="divide-y divide-line">
              {o.announcements.map((an) => (
                <li key={an.id} className="py-2.5">
                  <p className="font-semibold">{an.title} <Badge>{an.audience}</Badge></p>
                  <p className="text-muted text-sm">{an.body}</p>
                  <p className="text-muted text-xs mt-0.5">{shortDate(an.starts_on)} → {shortDate(an.ends_on)}</p>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>Nothing live. Post one for a holiday, a new class, or the next trek's booking window.</Empty>
          )}
        </Card>
      </div>
    </>
  );
}
