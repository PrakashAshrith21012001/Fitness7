import { redirect } from "next/navigation";
import { can, currentStaff } from "@/server/admin-auth";
import { listStaff } from "@/server/admin-data";
import { supabaseConfigured } from "@/server/supabase";
import { createStaffAction, setStaffActiveAction } from "@/app/admin/actions";
import { Badge, Button, Card, Empty, Field, Flash, inputCls } from "@/components/admin/ui";

export default async function StaffAdmin({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const { staff } = await currentStaff();
  if (!can(staff, "owner")) redirect("/admin/login?error=role");
  const { ok, error } = await searchParams;
  const rows = await listStaff();

  return (
    <>
      <header>
        <p className="text-xs tracking-[0.18em] uppercase text-lime font-bold">Owner</p>
        <h1 className="font-display text-3xl font-bold mt-1">Staff logins</h1>
        <p className="text-muted text-sm mt-1">
          <b>Owner</b> does everything including this page · <b>Admin</b> posts treks and announcements, edits plans · <b>Coach</b> sees members, confirms trek slots, updates leads.
        </p>
      </header>
      <div className="mt-4"><Flash ok={ok} error={error} /></div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_360px]">
        <Card title="People with access">
          {rows.length ? (
            <ul className="divide-y divide-line">
              {rows.map((s) => (
                <li key={s.user_id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold">{s.name || s.email} <Badge tone={s.active ? "lime" : "muted"}>{s.role}{s.active ? "" : " · off"}</Badge></p>
                    <p className="text-muted text-xs">{s.email}</p>
                  </div>
                  {s.user_id !== staff?.userId ? (
                    <form action={setStaffActiveAction}>
                      <input type="hidden" name="user_id" value={s.user_id} />
                      <input type="hidden" name="active" value={s.active ? "0" : "1"} />
                      <Button type="submit" variant={s.active ? "danger" : "outline"} className="min-h-[36px] px-3 text-sm">{s.active ? "Deactivate" : "Re-activate"}</Button>
                    </form>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <Empty>No staff logins yet. You're in with the owner password — add yourself below so you can sign in with email too.</Empty>
          )}
        </Card>

        <Card title="Add a login">
          {supabaseConfigured ? (
            <form action={createStaffAction} className="space-y-3">
              <Field label="Name"><input name="name" required maxLength={60} className={inputCls} /></Field>
              <Field label="Email"><input name="email" type="email" required className={inputCls} /></Field>
              <Field label="Password" hint="8+ characters. Share it with them; they can't reset it themselves yet."><input name="password" type="text" required minLength={8} className={inputCls} /></Field>
              <Field label="Role">
                <select name="role" defaultValue="admin" className={inputCls}>
                  <option value="admin">Admin</option>
                  <option value="coach">Coach</option>
                  <option value="owner">Owner</option>
                </select>
              </Field>
              <Button type="submit" className="w-full">Create login</Button>
            </form>
          ) : (
            <Empty>Needs Supabase configured on the server.</Empty>
          )}
        </Card>
      </div>
    </>
  );
}
