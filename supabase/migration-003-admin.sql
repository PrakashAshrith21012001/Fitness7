-- ============================================================================
-- Migration 003 — admin area: staff roles, treks as content, announcements,
-- lead status, member notes, media bucket.
-- Run once in Supabase → SQL editor (after schema.sql + 002). Safe to re-run.
-- ============================================================================

-- ---------- staff (web admin) ----------
create table if not exists public.staff (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  name       text not null default '',
  email      text not null,
  role       text not null default 'admin' check (role in ('owner','admin','coach')),
  active     boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.staff enable row level security;   -- no policies: service role only

-- ---------- treks as content ----------
create table if not exists public.treks (
  id               text primary key,                       -- slug, e.g. yercaud-oct-2026
  title            text not null,
  location         text not null,
  date             date not null,
  duration_text    text not null default 'Day trip',
  meeting_point    text not null default 'Fitness 7 Gym',
  difficulty       text not null default 'Moderate' check (difficulty in ('Easy','Moderate','Challenging')),
  distance_km      numeric(5,1) not null default 0,
  altitude_m       int not null default 0,
  price_inr        int not null default 0,
  member_price_inr int not null default 0,
  slots_total      int not null default 20 check (slots_total between 1 and 500),
  summary          text not null default '',
  highlights       text[] not null default '{}',
  includes         text[] not null default '{}',
  cover_url        text,
  gallery          text[] not null default '{}',
  status           text not null default 'draft' check (status in ('draft','published','cancelled')),
  created_by       uuid,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
drop trigger if exists treks_touch on public.treks;
create trigger treks_touch before update on public.treks
  for each row execute function public.touch_updated_at();

alter table public.treks enable row level security;
drop policy if exists treks_public_read on public.treks;
create policy treks_public_read on public.treks
  for select to anon, authenticated using (status = 'published');

alter table public.trek_reservations add column if not exists note text;
alter table public.trek_reservations add column if not exists updated_at timestamptz not null default now();

-- ---------- announcements ----------
create table if not exists public.announcements (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  body       text not null default '',
  starts_on  date not null default current_date,
  ends_on    date not null default current_date + 14,
  audience   text not null default 'both' check (audience in ('app','site','both')),
  link_url   text,
  created_by uuid,
  created_at timestamptz not null default now()
);
alter table public.announcements enable row level security;
drop policy if exists announcements_public_read on public.announcements;
create policy announcements_public_read on public.announcements
  for select to anon, authenticated using (current_date between starts_on and ends_on);

-- ---------- leads: status + note ----------
alter table public.leads add column if not exists status text not null default 'new' check (status in ('new','contacted','joined','lost'));
alter table public.leads add column if not exists note text;
alter table public.leads add column if not exists updated_at timestamptz not null default now();

-- ---------- member notes (staff only) ----------
create table if not exists public.member_notes (
  id         uuid primary key default gen_random_uuid(),
  member_id  uuid not null references public.members(id) on delete cascade,
  author     uuid,
  author_name text not null default '',
  body       text not null,
  created_at timestamptz not null default now()
);
create index if not exists member_notes_member on public.member_notes (member_id, created_at desc);
alter table public.member_notes enable row level security;   -- service role only

-- ---------- member list view for the admin ----------
create or replace view public.admin_member_summary as
select
  m.id, m.name, m.phone, m.email, m.goal, m.slot, m.plan_id, m.plan_name, m.renews_on, m.joined_on, m.onboarded,
  (select max(c.date) from public.checkins c where c.member_id = m.id)                      as last_checkin,
  (select count(*) from public.checkins c where c.member_id = m.id)                         as checkin_count,
  (select count(*) from public.checkins c where c.member_id = m.id and c.date >= current_date - 30) as checkins_30d,
  (select w.kg from public.weights w where w.member_id = m.id order by w.date desc limit 1) as latest_kg,
  (select max(f.date) from public.food_logs f where f.member_id = m.id and f.deleted_at is null) as last_food
from public.members m;

-- ---------- storage: public media bucket ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 5242880, allowed_mime_types = array['image/jpeg','image/png','image/webp'];

drop policy if exists media_public_read on storage.objects;
create policy media_public_read on storage.objects
  for select to anon, authenticated using (bucket_id = 'media');
-- inserts/updates/deletes: service role only (via /api/admin/upload)
