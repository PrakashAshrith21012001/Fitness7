import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { brand } from "@f7/content";
import { currentStaff } from "@/server/admin-auth";
import { logoutAction } from "@/app/admin/actions";
import { AdminNav } from "@/components/admin/AdminNav";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin" }, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/**
 * Gate + chrome for everything under /admin. No staff → sign in. Expired
 * access token with a refresh token → /admin/refresh. The nav shows only
 * what the role can open.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { staff, needsRefresh } = await currentStaff();
  if (!staff) redirect(needsRefresh ? "/admin/refresh" : "/admin/login");

  return (
    <div className="min-h-screen bg-ink text-white font-sans md:grid md:grid-cols-[220px_1fr]">
      <aside className="border-b border-line bg-surface md:border-b-0 md:border-r md:min-h-screen">
        <div className="px-5 pt-6 pb-4">
          <p className="text-xs tracking-[0.18em] uppercase text-lime font-bold">{brand.name}</p>
          <p className="font-display text-xl font-bold mt-1">Admin</p>
        </div>
        <AdminNav role={staff.role} />
        <div className="px-5 py-4 mt-auto border-t border-line text-sm">
          <p className="font-semibold truncate">{staff.name}</p>
          <p className="text-muted text-xs capitalize">{staff.ownerMode ? "owner mode" : staff.role}</p>
          <form action={logoutAction} className="mt-2">
            <button type="submit" className="text-xs text-muted underline">Sign out</button>
          </form>
        </div>
      </aside>
      <main className="px-5 py-6 md:px-10 md:py-8 max-w-6xl w-full">{children}</main>
    </div>
  );
}
