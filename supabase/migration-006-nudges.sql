-- Fitness 7 — Phase 2: allow "we miss you" notes in the reminders log.
-- Safe to run more than once. Run after migration-005-billing.sql.

alter table public.reminders drop constraint if exists reminders_step_check;
alter table public.reminders add constraint reminders_step_check
  check (step in ('t-7','t-3','due','grace','lapsed','winback','receipt','nudge'));
