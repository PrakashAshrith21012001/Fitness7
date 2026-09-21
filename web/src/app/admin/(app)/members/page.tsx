import Link from "next/link";
import { shortDate } from "@f7/content";
import { istToday, listMembers, plusDays, type MemberFilter } from "@/server/admin-data";
import { Badge, Card, Empty, inputCls } from "@/components/admin/ui";
import { cn } from "@/lib/cn";

const FILTERS: { id: MemberFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "expiring", label: "Ending this week" },
  { id: "inactive", label: "Inactive 14 days" },
  { id: "noplan", label: "No plan" },
  { id: "new", label: "Joined recently" },
];

export default async function MembersAdmin({ searchParams }: { searchParams: Promise<{ q?: string; filter?: string }> }) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const filter = (FILTERS.some((f) => f.id === sp.filter) ? sp.filter : "all") as MemberFilter;
  const rows = await listMembers(q, filter);
  const today = istToday();
  const soon = plusDays(today, 7);

  return (
    <>
      <header>
        <p className="text-xs tracking-[0.18em] uppercase text-lime font-bold">People</p>
        <h1 className="font-display text-3xl font-bold mt-1">Members</h1>
      </header>

      <form className="mt-5 flex flex-wrap items-center gap-2" action="/admin/members">
        <input type="hidden" name="filter" value={filter} />
        <input name="q" defaultValue={q} placeholder="Name, phone or email" className={cn(inputCls, "mt-0 max-w-xs")} aria-label="Search members" />
        <button type="submit" className="btn-green min-h-[44px] rounded-full px-5 font-bold text-on-accent">Search</button>
      </form>
      <div className="mt-3 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link key={f.id} href={`/admin/members?filter=${f.id}${q ? `&q=${encodeURIComponent(q)}` : ""}`} className={cn("rounded-full border px-4 py-2 text-sm font-semibold min-h-[40px] flex items-center", f.id === filter ? "bg-green text-on-accent border-green" : "border-line text-white/80 hover:border-lime/50")}>
            {f.label}
          </Link>
        ))}
      </div>

      <Card className="mt-5">
        {rows.length ? (
          <ul className="divide-y divide-line">
            {rows.map((m) => {
              const expiring = !!m.renews_on && m.renews_on >= today && m.renews_on <= soon;
              const lapsed = !!m.renews_on && m.renews_on < today;
              return (
                <li key={m.id}>
                  <Link href={`/admin/members/${m.id}`} className="py-3 flex items-center gap-4 hover:bg-surface-2/50 -mx-2 px-2 rounded-lg">
                    <div className="grid size-11 shrink-0 place-items-center rounded-full bg-surface-2 font-bold text-sm">{(m.name || "?").trim().slice(0, 2).toUpperCase()}</div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold truncate">{m.name || "— (not onboarded)"}</p>
                      <p className="text-muted text-xs truncate">{m.phone ?? m.email ?? ""} · joined {shortDate(m.joined_on)}{m.latest_kg ? ` · ${m.latest_kg} kg` : ""}</p>
                    </div>
                    <div className="hidden sm:block text-right text-xs text-muted">
                      <p>{m.last_checkin ? `last visit ${shortDate(m.last_checkin)}` : "no visits"}</p>
                      <p>{m.checkins_30d} in 30 days</p>
                    </div>
                    <div className="text-right shrink-0">
                      {m.plan_name ? <Badge tone={lapsed ? "red" : expiring ? "amber" : "lime"}>{m.plan_name}</Badge> : <Badge>no plan</Badge>}
                      {m.renews_on ? <p className="text-xs text-muted mt-1">{lapsed ? "ended" : "renews"} {shortDate(m.renews_on)}</p> : null}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <Empty>{q ? "No member matches that." : "No members yet — they appear here after their first sign-in on the app."}</Empty>
        )}
      </Card>
    </>
  );
}
