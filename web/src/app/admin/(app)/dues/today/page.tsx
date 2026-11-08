import type { Metadata } from "next";
import { sendList } from "@/server/billing";
import { inr, STEP_LABEL } from "@/lib/billing";
import { Card, Empty } from "@/components/admin/ui";
import { MigrationNotice } from "@/components/admin/MigrationNotice";
import { SendQueue, type QueueItem } from "@/components/admin/SendQueue";

export const metadata: Metadata = { title: "Today's reminders" };
export const dynamic = "force-dynamic";

/**
 * /admin/dues/today — everything to send today in one list, most urgent first:
 * due today → grace → 3-day → 7-day → lapsed → win-back → "we miss you"
 * notes for regulars who've stopped coming. Rebuilt on every visit from the
 * end dates and the reminders log, so it is always today's list.
 */
export default async function TodayPage() {
  const { ready, items } = await sendList();
  const queue: QueueItem[] = items.map((i) => ({
    id: i.id,
    name: i.name,
    phone: i.phone,
    label: STEP_LABEL[i.kind].replace(/^./, (c) => c.toUpperCase()),
    detail: i.detail,
    amount: i.amount ? inr(i.amount) : null,
    href: i.href,
    nudge: i.kind === "nudge",
  }));

  return (
    <>
      <header>
        <p className="text-xs tracking-[0.18em] uppercase text-lime font-bold">Renewals</p>
        <h1 className="font-display text-3xl font-bold mt-1">Today&apos;s reminders</h1>
        <p className="text-muted text-sm mt-1">Tap Send, press send in WhatsApp, come back — the next one is highlighted.</p>
      </header>
      {!ready ? <MigrationNotice /> : null}
      <div className="mt-6">
        {queue.length ? (
          <SendQueue items={queue} />
        ) : (
          <Card>
            <Empty>Nothing to send today — everyone due has been reminded.</Empty>
          </Card>
        )}
      </div>
    </>
  );
}
