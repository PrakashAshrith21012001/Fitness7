import Link from "next/link";
import { notFound } from "next/navigation";
import { longDate, wa } from "@f7/content";
import { can, currentStaff } from "@/server/admin-auth";
import { getTrek } from "@/server/admin-data";
import { deleteTrekAction, saveTrekAction, setReservationAction, setTrekStatusAction } from "@/app/admin/actions";
import { TrekForm } from "@/components/admin/TrekForm";
import { Badge, Button, Card, Empty, Flash } from "@/components/admin/ui";

export default async function TrekAdmin({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; error?: string }> }) {
  const { id } = await params;
  const { ok, error } = await searchParams;
  const { staff } = await currentStaff();
  const editor = can(staff, "admin");
  const { trek, reservations } = await getTrek(id);
  if (!trek) notFound();
  const active = reservations.filter((r) => r.status !== "cancelled");
  const tone = { held: "amber", confirmed: "lime", cancelled: "muted" } as const;

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.18em] uppercase text-lime font-bold"><Link href="/admin/treks" className="underline">Treks</Link> · {trek.status}</p>
          <h1 className="font-display text-3xl font-bold mt-1">{trek.title}</h1>
          <p className="text-muted text-sm mt-1">{longDate(trek.date)} · {trek.location} · {active.length} of {trek.slots_total} slots taken</p>
        </div>
        {editor ? (
          <div className="flex flex-wrap gap-2">
            {trek.status !== "published" ? (
              <form action={setTrekStatusAction}><input type="hidden" name="id" value={trek.id} /><input type="hidden" name="status" value="published" /><Button type="submit">Publish</Button></form>
            ) : (
              <form action={setTrekStatusAction}><input type="hidden" name="id" value={trek.id} /><input type="hidden" name="status" value="draft" /><Button type="submit" variant="outline">Unpublish</Button></form>
            )}
            {trek.status !== "cancelled" ? (
              <form action={setTrekStatusAction}><input type="hidden" name="id" value={trek.id} /><input type="hidden" name="status" value="cancelled" /><Button type="submit" variant="danger">Cancel trek</Button></form>
            ) : null}
          </div>
        ) : null}
      </header>
      <div className="mt-4"><Flash ok={ok} error={error} /></div>

      <Card className="mt-5" title={`Reservations · ${active.length}`}>
        {reservations.length ? (
          <ul className="divide-y divide-line">
            {reservations.map((r) => (
              <li key={r.member_id} className="py-2.5 flex flex-wrap items-center gap-3">
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/members/${r.member_id}`} className="font-semibold hover:underline">{r.members?.name || "—"}</Link>
                  <p className="text-muted text-xs">{r.members?.phone ?? ""}{r.members?.plan_name ? ` · ${r.members.plan_name}` : " · no plan"} · reserved {new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" })}</p>
                </div>
                <Badge tone={tone[r.status]}>{r.status}</Badge>
                {r.members?.phone ? (
                  <a href={`https://wa.me/${r.members.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${r.members.name?.split(" ")[0] ?? ""}, about your slot on ${trek.title} (${longDate(trek.date)}) —`)}`} target="_blank" rel="noreferrer" className="text-sm text-lime underline">WhatsApp</a>
                ) : null}
                {r.status !== "confirmed" ? (
                  <form action={setReservationAction}><input type="hidden" name="trek_id" value={trek.id} /><input type="hidden" name="member_id" value={r.member_id} /><input type="hidden" name="status" value="confirmed" /><Button type="submit" variant="outline" className="min-h-[36px] px-3 text-sm">Confirm paid</Button></form>
                ) : null}
                {r.status !== "cancelled" ? (
                  <form action={setReservationAction}><input type="hidden" name="trek_id" value={trek.id} /><input type="hidden" name="member_id" value={r.member_id} /><input type="hidden" name="status" value="cancelled" /><Button type="submit" variant="ghost" className="min-h-[36px] px-2 text-sm">Cancel</Button></form>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <Empty>No one has reserved yet. Members reserve from the app; the desk confirms once they've paid. <a className="text-lime underline" href={wa.general()} target="_blank" rel="noreferrer">Share on WhatsApp</a>.</Empty>
        )}
      </Card>

      {editor ? (
        <>
          <h2 className="font-display text-2xl font-bold mt-8">Edit</h2>
          <div className="mt-4"><TrekForm trek={trek} action={saveTrekAction} /></div>
          <form action={deleteTrekAction} className="mt-8 border-t border-line pt-5">
            <input type="hidden" name="id" value={trek.id} />
            <p className="text-sm text-muted mb-2">Delete removes it completely. If anyone holds a slot, cancel the trek instead so they still see what happened.</p>
            <Button type="submit" variant="danger">Delete this trek</Button>
          </form>
        </>
      ) : null}
    </>
  );
}
