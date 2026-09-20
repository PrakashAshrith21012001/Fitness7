-- ============================================================================
-- Fitness 7 Gym Unisex — database schema
--
-- Run ONCE: Supabase dashboard → SQL editor → paste → Run.
-- Safe to re-run (every statement is idempotent).
--
-- Model: one row in `members` per auth user (created by trigger), one table per
-- thing a member does (check-ins, weights, class follows, trek reservations,
-- food logs). RLS: a member can only see and change rows where the member id
-- equals auth.uid(). `leads` and `api_usage` are written only by the site's
-- server (secret key, which bypasses RLS).
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- members — 1:1 with auth.users
-- ----------------------------------------------------------------------------
create table if not exists public.members (
  id            uuid primary key references auth.users(id) on delete cascade,
  name          text not null default '',
  phone         text,
  email         text,
  provider      text not null default 'phone' check (provider in ('phone','google','apple','email')),
  goal          text check (goal in ('strength','fat-loss','trek','general')),
  slot          text check (slot in ('early','morning','ladies','evening')),
  plan_id       text,
  plan_name     text,
  renews_on     date,
  joined_on     date not null default current_date,
  onboarded     boolean not null default false,
  treks_done    int  not null default 0,
  -- "Your numbers" (optional; used for the daily kcal / protein target)
  height_cm     smallint check (height_cm between 120 and 230),
  age           smallint check (age between 13 and 90),
  sex           text check (sex in ('male','female')),
  activity      text check (activity in ('gym3','gym5','trek')),
  hide_calories boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.notification_prefs (
  member_id uuid primary key references public.members(id) on delete cascade,
  classes   boolean not null default true,
  treks     boolean not null default true,
  renewals  boolean not null default true
);

-- ----------------------------------------------------------------------------
-- what a member does
-- ----------------------------------------------------------------------------
create table if not exists public.checkins (
  member_id  uuid not null references public.members(id) on delete cascade,
  date       date not null,
  created_at timestamptz not null default now(),
  primary key (member_id, date)
);

create table if not exists public.weights (
  member_id uuid not null references public.members(id) on delete cascade,
  date      date not null,
  kg        numeric(5,1) not null check (kg between 30 and 250),
  primary key (member_id, date)
);

create table if not exists public.class_follows (
  member_id  uuid not null references public.members(id) on delete cascade,
  class_id   text not null,
  created_at timestamptz not null default now(),
  primary key (member_id, class_id)
);

create table if not exists public.trek_reservations (
  member_id  uuid not null references public.members(id) on delete cascade,
  trek_id    text not null,
  status     text not null default 'held' check (status in ('held','confirmed','cancelled')),
  created_at timestamptz not null default now(),
  primary key (member_id, trek_id)
);

-- ----------------------------------------------------------------------------
-- website enquiry form — server-only
-- ----------------------------------------------------------------------------
create table if not exists public.leads (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  phone      text not null,
  interest   text,
  message    text,
  source     text not null default 'website' check (source in ('website','app')),
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- food logs
-- ----------------------------------------------------------------------------
create table if not exists public.food_logs (
  id            uuid primary key,                 -- generated on the phone so an offline add can be retried safely
  member_id     uuid not null references public.members(id) on delete cascade,
  date          date not null,
  meal          text not null check (meal in ('breakfast','lunch','snacks','dinner')),
  name          text not null,
  food_id       text,                             -- shared/foods.ts id when matched, else null
  grams         numeric(7,1) not null check (grams > 0),
  portion_label text,
  kcal          numeric(7,1) not null check (kcal >= 0),
  protein_g     numeric(6,1) not null default 0,
  carbs_g       numeric(6,1) not null default 0,
  fat_g         numeric(6,1) not null default 0,
  confidence    numeric(3,2) not null default 1 check (confidence between 0 and 1),
  source        text not null check (source in ('table','model','photo')),
  logged_at     timestamptz not null default now(),
  deleted_at    timestamptz
);
create index if not exists food_logs_member_date on public.food_logs (member_id, date);

-- ----------------------------------------------------------------------------
-- API usage — rate limits and token accounting for the food routes
-- ----------------------------------------------------------------------------
create table if not exists public.api_usage (
  member_id     uuid not null references public.members(id) on delete cascade,
  date          date not null,
  kind          text not null check (kind in ('food_text','food_photo')),
  count         int  not null default 0,
  input_tokens  int  not null default 0,
  output_tokens int  not null default 0,
  primary key (member_id, date, kind)
);

-- ----------------------------------------------------------------------------
-- updated_at
-- ----------------------------------------------------------------------------
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists members_touch on public.members;
create trigger members_touch before update on public.members
  for each row execute function public.touch_updated_at();

-- ----------------------------------------------------------------------------
-- a members row for every new auth user
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.members (id, phone, email, provider)
  values (
    new.id,
    new.phone,
    new.email,
    case
      when new.phone is not null then 'phone'
      when coalesce(new.raw_app_meta_data->>'provider', '') = 'google' then 'google'
      when coalesce(new.raw_app_meta_data->>'provider', '') = 'apple'  then 'apple'
      else 'email'
    end
  )
  on conflict (id) do nothing;
  insert into public.notification_prefs (member_id) values (new.id)
  on conflict do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- Row-level security
-- ----------------------------------------------------------------------------
alter table public.members            enable row level security;
alter table public.notification_prefs enable row level security;
alter table public.checkins           enable row level security;
alter table public.weights            enable row level security;
alter table public.class_follows      enable row level security;
alter table public.trek_reservations  enable row level security;
alter table public.food_logs          enable row level security;
alter table public.api_usage          enable row level security;
alter table public.leads              enable row level security;

-- members: own row only
drop policy if exists members_self on public.members;
create policy members_self on public.members
  for all to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- every per-member table gets the same policy
do $$
declare t text;
begin
  foreach t in array array['notification_prefs','checkins','weights','class_follows','trek_reservations','food_logs']
  loop
    execute format('drop policy if exists %I_self on public.%I', t, t);
    execute format(
      'create policy %I_self on public.%I for all to authenticated using (member_id = auth.uid()) with check (member_id = auth.uid())',
      t, t
    );
  end loop;
end $$;

-- api_usage: a member may read their own counters; only the server writes
drop policy if exists api_usage_read on public.api_usage;
create policy api_usage_read on public.api_usage
  for select to authenticated using (member_id = auth.uid());

-- leads: RLS on with NO policy for anon/authenticated → only the service role
-- (which bypasses RLS) can insert or read. That is the intent.

-- ----------------------------------------------------------------------------
-- atomic daily counter used by /api/food/*  (called with the secret key)
-- returns the new count for today; the caller compares it with the limit
-- ----------------------------------------------------------------------------
create or replace function public.bump_api_usage(
  p_member uuid, p_kind text, p_in int default 0, p_out int default 0
) returns int
language plpgsql security definer set search_path = public as $$
declare c int;
begin
  insert into public.api_usage (member_id, date, kind, count, input_tokens, output_tokens)
  values (p_member, current_date, p_kind, 1, p_in, p_out)
  on conflict (member_id, date, kind) do update
    set count         = api_usage.count + 1,
        input_tokens  = api_usage.input_tokens  + excluded.input_tokens,
        output_tokens = api_usage.output_tokens + excluded.output_tokens
  returning count into c;
  return c;
end $$;

-- grant nothing extra: the server calls this with the secret key.
revoke execute on function public.bump_api_usage(uuid, text, int, int) from anon, authenticated;
