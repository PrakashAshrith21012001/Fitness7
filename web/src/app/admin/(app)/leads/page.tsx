import Link from "next/link";
import { listLeads, type LeadRowFull } from "@/server/admin-data";
import { updateLeadAction } from "@/app/admin/actions";
import { Badge, Button, Card, Empty, Flash, inputCls } from "@/components/admin/ui";
import { cn } from "@/lib/cn";

const STATUSES = ["new", "contacted", "joined", "lost"] as const;
const TONE = { new: "amber", contacted: "muted", joined: "lime", lost: "red" } as const;

export default async function LeadsAdmin({ searchParams }: { searchParams: Promise<{ status?: string; ok?: string; error?: string }> }) {
  const sp = await searchParams;
  const status = (STATUSES.includes(sp.status as LeadRowFull["status"]) ? sp.status : "all") as LeadRowFull["status"] | "all";
  const { ok, error } = sp;
  const rows = await listLeads(status);
  const ret = `/admin/leads${status !== "all" ? `?status=${status}` : ""}`;

  return (
    <>
      <header>
        <p className="text-xs tracking-[0.18em] uppercase text-lime font-bold">Website enquiries</p>
        <h1 className="font-display text-3xl font-bold mt-1">Leads</h1>
        <p className="text-muted text-sm mt-1">Everyone who filled the form on the site. Call or WhatsApp, then mark what happened.</p>
      </header>
      <div className="mt-4"><Flash ok={ok} error={error} /></div>
      <div className="mt-3 flex flex-wrap gap-2">
        {(["all", ...STATUSES] as const).map((s) => (
          <Link key={s} href={s === "all" ? "/admin/leads" : `/admin/leads?status=${s}`} className={cn("rounded-full border px-4 py-2 text-sm font-semibold capitalize min-h-[40px] flex items-center", s === status ? "bg-green text-on-accent border-green" : "border-line text-white/80 hover:border-lime/50")}>
            {s}
          </Link>
        ))}
      </div>

      <Card className="mt-5">
        {rows.length ? (
          <ul className="divide-y divide-line">
            {rows.map((l) => (
              <li key={l.id} className="py-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">
                      {l.name} <span className="text-muted font-normal">· {l.phone}</span>
                      {l.interest ? <span className="ml-2 rounded-full border border-line px-2 py-0.5 text-xs text-lime">{l.interest}</span> : null}
                    </p>
                    {l.message ? <p className="text-muted text-sm mt-0.5">{l.message}</p> : null}
                    <p className="text-muted text-xs mt-0.5">{l.created_at.slice(0, 10)} · {l.source}</p>
                  </div>
                  <Badge tone={TONE[l.status]}>{l.status}</Badge>
                  <a href={`https://wa.me/${l.phone.replace(/\D/g, "").replace(/^(\d{10})$/, "91$1")}?text=${encodeURIComponent(`Hi ${l.name.split(" ")[0]}, this is Fitness 7 — thanks for getting in touch!`)}`} target="_blank" rel="noreferrer" className="text-sm text-lime underline">WhatsApp</a>
                  <a href={`tel:${l.phone}`} className="text-sm text-lime underline">Call</a>
                </div>
                <form action={updateLeadAction} className="mt-2 flex flex-wrap items-center gap-2">
                  <input type="hidden" name="id" value={l.id} />
                  <input type="hidden" name="return" value={ret} />
                  <select name="status" defaultValue={l.status} className={cn(inputCls, "mt-0 w-auto min-h-[40px] py-1.5")} aria-label="Status">
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <input name="note" defaultValue={l.note ?? ""} placeholder="Note — e.g. coming Saturday for trial" maxLength={500} className={cn(inputCls, "mt-0 flex-1 min-w-[200px] min-h-[40px] py-1.5")} />
                  <Button type="submit" variant="outline" className="min-h-[40px]">Save</Button>
                </form>
              </li>
            ))}
          </ul>
        ) : (
          <Empty>No leads {status !== "all" ? `marked ${status}` : "yet"}.</Empty>
        )}
      </Card>
    </>
  );
}
