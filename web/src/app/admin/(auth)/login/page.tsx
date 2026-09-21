import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { brand } from "@f7/content";
import { currentStaff } from "@/server/admin-auth";
import { ownerEnabled } from "@/server/owner";
import { supabaseConfigured } from "@/server/supabase";
import { loginAction } from "@/app/admin/actions";
import { Button, Flash, Label, inputCls } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const MESSAGES: Record<string, string> = {
  wrong: "That password didn't match.",
  role: "Your account can't open that page.",
  expired: "Your session ended — sign in again.",
};

export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ error?: string; mode?: string }> }) {
  const { staff } = await currentStaff();
  if (staff) redirect("/admin");
  const { error, mode } = await searchParams;
  const ownerMode = mode === "owner" || !supabaseConfigured;
  const msg = error ? MESSAGES[error] ?? error : null;

  return (
    <main className="min-h-screen bg-ink text-white font-sans flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">
        <p className="text-xs tracking-[0.18em] uppercase text-lime font-bold">{brand.name} · Admin</p>
        <h1 className="font-display text-3xl font-bold mt-2">{ownerMode ? "Owner sign in" : "Staff sign in"}</h1>
        <p className="text-muted text-sm mt-2">{ownerMode ? "The owner password from the server settings." : "The email and password the owner set up for you."}</p>

        <form action={loginAction} className="mt-6 space-y-4 rounded-2xl border border-line bg-surface p-6">
          <input type="hidden" name="mode" value={ownerMode ? "owner" : "staff"} />
          {!ownerMode ? (
            <div>
              <Label htmlFor="email">Email</Label>
              <input id="email" name="email" type="email" autoComplete="username" required className={inputCls} />
            </div>
          ) : null}
          <div>
            <Label htmlFor="password">Password</Label>
            <input id="password" name="password" type="password" autoComplete="current-password" required className={inputCls} />
          </div>
          <Flash error={msg ?? undefined} />
          <Button type="submit" className="w-full" disabled={ownerMode && !ownerEnabled()}>
            Sign in
          </Button>
          {ownerMode && !ownerEnabled() ? <p className="text-xs text-muted">Set OWNER_PASSWORD (8+ characters) on the server to enable this.</p> : null}
        </form>

        {supabaseConfigured ? (
          <p className="mt-4 text-center text-sm text-muted">
            {ownerMode ? (
              <a href="/admin/login" className="text-lime underline">Staff sign in instead</a>
            ) : (
              <a href="/admin/login?mode=owner" className="text-lime underline">Owner password instead</a>
            )}
          </p>
        ) : null}
      </div>
    </main>
  );
}
