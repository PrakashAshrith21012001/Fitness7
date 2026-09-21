import Link from "next/link";
import { shortDate, treks as staticTreks } from "@f7/content";
import { listTreks } from "@/server/admin-data";
import { Badge, Button, Card, Empty, Flash } from "@/components/admin/ui";

export default async function TreksAdmin({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const { ok, error } = await searchParams;
  const rows = await listTreks();
  const tone = { published: "lime", draft: "muted", cancelled: "red" } as const;
  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.18em] uppercase text-lime font-bold">Content</p>
          <h1 className="font-display text-3xl font-bold mt-1">Treks</h1>
          <p className="text-muted text-sm mt-1">Published treks appear on the site and in the app within a minute. Drafts are only here.</p>
        </div>
        <Link href="/admin/treks/new"><Button>Post a trek</Button></Link>
      </header>
      <div className="mt-4"><Flash ok={ok} error={error} /></div>

      <Card className="mt-5">
        {rows.length ? (
          <ul className="divide-y divide-line">
            {rows.map((t) => (
              <li key={t.id} className="py-3 flex items-center gap-4">
                <div className="size-14 shrink-0 rounded-xl bg-surface-2 overflow-hidden">
                  {t.cover_url ? <img src={t.cover_url} alt="" className="size-full object-cover" /> : null}
                </div>
                <Link href={`/admin/treks/${t.id}`} className="min-w-0 flex-1">
                  <p className="font-semibold truncate">{t.title}</p>
                  <p className="text-muted text-xs">{shortDate(t.date)} · {t.location} · {t.difficulty} · {t.distance_km} km</p>
                </Link>
                <div className="text-right shrink-0">
                  <p className="text-sm tabular-nums">{t.reserved} / {t.slots_total} slots</p>
                  <Badge tone={tone[t.status]}>{t.status}</Badge>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <Empty>
            Nothing posted yet. The site and app are showing the {staticTreks.length} built-in treks from <code>shared/gym.ts</code>; the first published trek here replaces them.
          </Empty>
        )}
      </Card>
    </>
  );
}
