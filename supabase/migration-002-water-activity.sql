-- ============================================================================
-- Migration 002 — water + activity logging, reminder prefs.
-- Run once in Supabase → SQL editor (after schema.sql). Safe to re-run.
-- schema.sql also contains these statements for fresh projects.
-- ============================================================================

alter table public.members add column if not exists water_goal_ml int check (water_goal_ml between 500 and 6000);
alter table public.members add column if not exists glass_ml int not null default 250 check (glass_ml in (200, 250, 300, 500));

alter table public.notification_prefs add column if not exists meals boolean not null default true;
alter table public.notification_prefs add column if not exists water boolean not null default true;

create table if not exists public.water_logs (
  member_id uuid not null references public.members(id) on delete cascade,
  date      date not null,
  ml        int  not null default 0 check (ml between 0 and 10000),
  updated_at timestamptz not null default now(),
  primary key (member_id, date)
);

create table if not exists public.activity_logs (
  id          uuid primary key,                 -- generated on the phone
  member_id   uuid not null references public.members(id) on delete cascade,
  date        date not null,
  activity_id text not null,
  name        text not null,
  minutes     int  not null check (minutes between 1 and 720),
  kcal        int  not null check (kcal >= 0),
  logged_at   timestamptz not null default now(),
  deleted_at  timestamptz
);
create index if not exists activity_logs_member_date on public.activity_logs (member_id, date);

alter table public.water_logs    enable row level security;
alter table public.activity_logs enable row level security;

drop policy if exists water_logs_self on public.water_logs;
create policy water_logs_self on public.water_logs
  for all to authenticated using (member_id = auth.uid()) with check (member_id = auth.uid());

drop policy if exists activity_logs_self on public.activity_logs;
create policy activity_logs_self on public.activity_logs
  for all to authenticated using (member_id = auth.uid()) with check (member_id = auth.uid());
