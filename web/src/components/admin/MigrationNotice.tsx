/** Shown when the billing tables (migration-005) haven't been created in Supabase yet. */
export function MigrationNotice() {
  return (
    <div className="mt-4 rounded-xl border border-amber-300/40 px-4 py-3 text-sm tone-amber">
      <p className="font-bold">One-time setup needed</p>
      <p className="mt-1">
        Open Supabase → SQL editor, paste the contents of <code>supabase/migration-005-billing.sql</code> and press Run. Until then, payments and reminders can&apos;t be saved.
      </p>
    </div>
  );
}
