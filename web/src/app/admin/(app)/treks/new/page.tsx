import { redirect } from "next/navigation";
import { can, currentStaff } from "@/server/admin-auth";
import { saveTrekAction } from "@/app/admin/actions";
import { TrekForm } from "@/components/admin/TrekForm";
import { Flash } from "@/components/admin/ui";

export default async function NewTrek({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { staff } = await currentStaff();
  if (!can(staff, "admin")) redirect("/admin/login?error=role");
  const { error } = await searchParams;
  return (
    <>
      <header>
        <p className="text-xs tracking-[0.18em] uppercase text-lime font-bold">Treks</p>
        <h1 className="font-display text-3xl font-bold mt-1">Post a trek</h1>
        <p className="text-muted text-sm mt-1">Fill in what you know; you can save as a draft and finish later.</p>
      </header>
      <div className="mt-4"><Flash error={error} /></div>
      <div className="mt-5"><TrekForm trek={null} action={saveTrekAction} /></div>
    </>
  );
}
