import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { can, currentStaff } from "@/server/admin-auth";
import { istToday } from "@/server/admin-data";
import { addMemberAction } from "@/app/admin/billing-actions";
import { Card, Field, Flash, inputCls } from "@/components/admin/ui";
import { PaymentFields, PaymentSubmit } from "@/components/admin/PaymentForm";

export const metadata: Metadata = { title: "Add member" };

/**
 * /admin/members/new — sign someone up at the desk. Only name + phone are
 * required; if they pay now, the first plan and receipt are created too. When
 * they later install the app and sign in with this number, it's the same account.
 */
export default async function NewMemberPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const { staff } = await currentStaff();
  if (!can(staff, "admin")) redirect("/admin/members");
  const today = istToday();

  return (
    <>
      <header>
        <p className="text-xs tracking-[0.18em] uppercase text-lime font-bold">
          <Link href="/admin/members" className="underline">Members</Link>
        </p>
        <h1 className="font-display text-3xl font-bold mt-1">Add a member</h1>
        <p className="text-muted text-sm mt-1">For walk-ins who join at the desk. They don&apos;t need the app — if they install it later and sign in with this number, everything is already there.</p>
      </header>
      <div className="mt-4"><Flash error={error} /></div>

      <form action={addMemberAction} className="mt-6 grid gap-5 lg:grid-cols-2">
        <Card title="Who">
          <div className="grid gap-3">
            <Field label="Name">
              <input name="name" required minLength={2} maxLength={60} autoComplete="off" className={inputCls} />
            </Field>
            <Field label="Mobile number" hint="10 digits. Reminders and receipts go to this WhatsApp.">
              <input name="phone" required inputMode="tel" placeholder="98765 43210" className={inputCls} />
            </Field>
          </div>
        </Card>
        <Card title="First payment">
          <PaymentFields defaultPlan="monthly" defaultStart={today} today={today} optional />
          <PaymentSubmit label="Add member" />
        </Card>
      </form>
    </>
  );
}
