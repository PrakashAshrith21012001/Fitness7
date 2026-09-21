import { redirect } from "next/navigation";
import { shortDate } from "@f7/content";
import { can, currentStaff } from "@/server/admin-auth";
import { istToday, listAnnouncements, plusDays } from "@/server/admin-data";
import { deleteAnnouncementAction, saveAnnouncementAction } from "@/app/admin/actions";
import { Badge, Button, Card, Empty, Field, Flash, inputCls } from "@/components/admin/ui";

export default async function AnnouncementsAdmin({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const { staff } = await currentStaff();
  if (!can(staff, "admin")) redirect("/admin/login?error=role");
  const { ok, error } = await searchParams;
  const rows = await listAnnouncements();
  const today = istToday();

  return (
    <>
      <header>
        <p className="text-xs tracking-[0.18em] uppercase text-lime font-bold">Content</p>
        <h1 className="font-display text-3xl font-bold mt-1">Announcements</h1>
        <p className="text-muted text-sm mt-1">A short notice on the app's Home (and the site if you choose) between two dates — holidays, a new class, trek bookings opening.</p>
      </header>
      <div className="mt-4"><Flash ok={ok} error={error} /></div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_360px]">
        <Card title="Posted">
          {rows.length ? (
            <ul className="divide-y divide-line">
              {rows.map((an) => {
                const live = an.starts_on <= today && an.ends_on >= today;
                return (
                  <li key={an.id} className="py-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold">{an.title} <Badge tone={live ? "lime" : an.ends_on < today ? "muted" : "amber"}>{live ? "live" : an.ends_on < today ? "ended" : "scheduled"}</Badge> <Badge>{an.audience}</Badge></p>
                      <p className="text-sm text-muted">{an.body}</p>
                      <p className="text-xs text-muted mt-0.5">{shortDate(an.starts_on)} → {shortDate(an.ends_on)}{an.link_url ? ` · ${an.link_url}` : ""}</p>
                    </div>
                    <form action={deleteAnnouncementAction}><input type="hidden" name="id" value={an.id} /><button className="text-xs text-muted underline">remove</button></form>
                  </li>
                );
              })}
            </ul>
          ) : (
            <Empty>Nothing yet.</Empty>
          )}
        </Card>

        <Card title="New announcement">
          <form action={saveAnnouncementAction} className="space-y-3">
            <Field label="Title"><input name="title" required maxLength={80} placeholder="Closed on Pongal, 15 Jan" className={inputCls} /></Field>
            <Field label="Text"><textarea name="body" rows={3} maxLength={600} placeholder="Back at 5 AM on the 16th. Happy Pongal!" className={inputCls} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="From"><input name="starts_on" type="date" defaultValue={today} className={inputCls} /></Field>
              <Field label="Until"><input name="ends_on" type="date" defaultValue={plusDays(today, 14)} className={inputCls} /></Field>
            </div>
            <Field label="Show on">
              <select name="audience" defaultValue="both" className={inputCls}>
                <option value="both">App and site</option>
                <option value="app">App only</option>
                <option value="site">Site only</option>
              </select>
            </Field>
            <Field label="Link (optional)"><input name="link_url" type="url" placeholder="https://…" className={inputCls} /></Field>
            <Button type="submit" className="w-full">Post</Button>
          </form>
        </Card>
      </div>
    </>
  );
}
