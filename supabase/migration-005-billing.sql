-- ============================================================================
-- 005 — renewals & billing (Phase 1)
--
-- Run once: Supabase dashboard → SQL editor → paste → Run. Safe to re-run.
--
--   memberships  every plan period a member has paid for (history)
--   payments     every payment, with a numbered receipt (F7/2026-27/0001)
--   reminders    every renewal nudge sent, so nobody is messaged twice
--
-- members.plan_id / plan_name / renews_on stay the "current plan" the app
-- reads; record_payment() keeps them in sync. Writes go through the website's
-- server (secret key). Members may read their own memberships and payments
-- (for receipts in the app later).
-- ============================================================================

create table if not exists public.memberships (
  id          uuid primary key default gen_random_uuid(),
  member_id   uuid not null references public.members(id) on delete cascade,
  plan_id     text not null,
  plan_name   text not null,
  price_inr   int  not null default 0 check (price_inr >= 0),
  starts_on   date not null,
  ends_on     date not null,
  status      text not null default 'active' check (status in ('active','cancelled')),
  created_by  uuid,
  created_at  timestamptz not null default now(),
  check (ends_on >= starts_on)
);
create index if not exists memberships_member on public.memberships (member_id, ends_on desc);
create index if not exists memberships_ends on public.memberships (ends_on) where status = 'active';

create table if not exists public.payments (
  id               uuid primary key default gen_random_uuid(),
  member_id        uuid not null references public.members(id) on delete cascade,
  membership_id    uuid references public.memberships(id) on delete set null,
  amount_inr       int  not null check (amount_inr >= 0),
  method           text not null default 'upi_desk' check (method in ('upi_desk','cash','card','upi_link','autopay','other')),
  reference        text,
  note             text,
  paid_on          date not null default ((now() at time zone 'Asia/Kolkata')::date),
  receipt_no       text not null unique,
  public_token     uuid not null default gen_random_uuid() unique,
  recorded_by      uuid,
  recorded_by_name text not null default '',
  voided           boolean not null default false,
  voided_at        timestamptz,
  created_at       timestamptz not null default now()
);
create index if not exists payments_paid_on on public.payments (paid_on desc);
create index if not exists payments_member on public.payments (member_id, paid_on desc);

create table if not exists public.reminders (
  id            uuid primary key default gen_random_uuid(),
  member_id     uuid not null references public.members(id) on delete cascade,
  step          text not null check (step in ('t-7','t-3','due','grace','lapsed','winback','receipt')),
  channel       text not null default 'whatsapp_manual' check (channel in ('whatsapp_manual','whatsapp_api','push','sms')),
  for_end       date,              -- the end date the reminder was about
  sent_by       uuid,
  sent_by_name  text not null default '',
  sent_at       timestamptz not null default now()
);
create index if not exists reminders_member on public.reminders (member_id, sent_at desc);

-- receipt numbers: one running counter per Indian financial year (Apr–Mar)
create table if not exists public.receipt_counters (
  fy   text primary key,
  last int  not null default 0
);

alter table public.memberships      enable row level security;
alter table public.payments         enable row level security;
alter table public.reminders        enable row level security;
alter table public.receipt_counters enable row level security;   -- server only

drop policy if exists memberships_self_read on public.memberships;
create policy memberships_self_read on public.memberships for select to authenticated using (member_id = auth.uid());
drop policy if exists payments_self_read on public.payments;
create policy payments_self_read on public.payments for select to authenticated using (member_id = auth.uid() and not voided);

-- ---------------------------------------------------------------------------
-- record_payment: membership + payment + receipt number + members sync, atomically
-- ---------------------------------------------------------------------------
create or replace function public.record_payment(
  p_member uuid, p_plan_id text, p_plan_name text, p_price int,
  p_starts date, p_ends date,
  p_amount int, p_method text, p_reference text, p_note text, p_paid_on date,
  p_staff uuid, p_staff_name text
) returns table (payment_id uuid, receipt_no text, public_token uuid, membership_id uuid)
language plpgsql security definer set search_path = public as $$
#variable_conflict use_column
declare
  y int := extract(year from p_paid_on);
  v_fy text := case when extract(month from p_paid_on) >= 4
                  then y::text || '-' || lpad(((y + 1) % 100)::text, 2, '0')
                  else (y - 1)::text || '-' || lpad((y % 100)::text, 2, '0') end;
  v_n int;
  v_ms uuid;
  v_pay uuid;
  v_no text;
  v_tok uuid;
begin
  insert into public.receipt_counters (fy, last) values (v_fy, 1)
    on conflict (fy) do update set last = public.receipt_counters.last + 1
    returning public.receipt_counters.last into v_n;
  v_no := 'F7/' || v_fy || '/' || lpad(v_n::text, 4, '0');

  insert into public.memberships (member_id, plan_id, plan_name, price_inr, starts_on, ends_on, created_by)
    values (p_member, p_plan_id, p_plan_name, p_price, p_starts, p_ends, p_staff)
    returning id into v_ms;

  insert into public.payments (member_id, membership_id, amount_inr, method, reference, note, paid_on, receipt_no, recorded_by, recorded_by_name)
    values (p_member, v_ms, p_amount, p_method, nullif(p_reference, ''), nullif(p_note, ''), p_paid_on, v_no, p_staff, coalesce(p_staff_name, ''))
    returning id, payments.public_token into v_pay, v_tok;

  update public.members
     set plan_id = p_plan_id, plan_name = p_plan_name,
         renews_on = greatest(p_ends, coalesce((select max(m.ends_on) from public.memberships m where m.member_id = p_member and m.status = 'active'), p_ends)),
         updated_at = now()
   where id = p_member;

  return query select v_pay, v_no, v_tok, v_ms;
end $$;

-- void a payment (wrong entry): cancels its membership and recomputes the end date
create or replace function public.void_payment(p_payment uuid) returns void
language plpgsql security definer set search_path = public as $$
declare v_member uuid; v_ms uuid; v_end date; v_plan text; v_name text;
begin
  update public.payments set voided = true, voided_at = now() where id = p_payment and not voided
    returning member_id, membership_id into v_member, v_ms;
  if v_member is null then return; end if;
  if v_ms is not null then update public.memberships set status = 'cancelled' where id = v_ms; end if;
  select m.ends_on, m.plan_id, m.plan_name into v_end, v_plan, v_name
    from public.memberships m where m.member_id = v_member and m.status = 'active'
    order by m.ends_on desc limit 1;
  update public.members
     set renews_on = v_end, plan_id = coalesce(v_plan, plan_id), plan_name = coalesce(v_name, plan_name), updated_at = now()
   where id = v_member;
end $$;

revoke all on function public.record_payment(uuid, text, text, int, date, date, int, text, text, text, date, uuid, text) from public, anon, authenticated;
revoke all on function public.void_payment(uuid) from public, anon, authenticated;
