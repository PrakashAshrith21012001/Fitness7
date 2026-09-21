# PLAN — Phase 6: Admin dashboard on the website

_2026-09-21. This is the build prompt for the admin phase, written before code, in the same form as the backend prompt._

## The prompt

```
You are continuing the Fitness 7 Gym Unisex monorepo (shared/, web/ Next.js 16, mobile/ Expo 57). Supabase is live (supabase/schema.sql + migration-002), the app syncs offline-first, /owner is a read-only password page. Keep the site's design language: charcoal-green dark tokens from globals.css (bg-ink, bg-surface, border-line, text-lime, .btn-green with ink text), Fraunces headings, Plus Jakarta Sans body, one accent per screen, 44 px targets, no new UI libraries, Tailwind 4 utilities only.

GOAL — a real admin area at /admin on the website:
A. Roles. Staff sign in with email + password (Supabase Auth). Roles: owner (everything, manages staff), admin (content, members, leads), coach (members + check-ins, read-only content). The existing OWNER_PASSWORD keeps working as "owner mode" so the first admin can be created without touching the Supabase dashboard.
B. Treks are content the owner posts: title, place, date, meet time & point, difficulty, distance, price / member price, slots, what's included, description, cover photo + gallery (uploaded from the browser to Supabase Storage), status draft / published / cancelled. The website and the app read published treks from the database and fall back to shared/gym.ts when the table is empty or Supabase isn't configured. Reservations show per trek with confirm / cancel.
C. Announcements: short notices with a date range, shown on the app's Home and optionally as a site banner.
D. Members: searchable list (name, phone, plan, renews, last check-in, streak) with filters (expiring this week, inactive 14 days, no plan) and a full profile page (plan editing, check-in history, weight trend, food / water / activity summary, reservations, staff notes). Coaches see it read-only.
E. Leads: status (new / contacted / joined / lost) and a note per lead.
F. Overview: today's check-ins, expiring plans, new leads, upcoming trek fill, food-analyser cost — the current /owner page, moved to /admin with links into everything.

WORKING RULES
- Server components + server actions; the secret key never leaves the server; every action re-checks the role. Sessions in httpOnly cookies (access + refresh token), refreshed server-side.
- SQL as supabase/migration-003-admin.sql, re-runnable; also folded into schema.sql.
- Photos: bucket `media` (public read, ≤5 MB, jpeg/png/webp), path treks/<trek-id>/<uuid>.<ext>. Resized client-side to 1600 px before upload.
- Public reads: GET /api/treks (published, with slotsLeft), GET /api/announcements (active). App uses them with a cache and the static fallback; no spinner where there was none.
- Ship in sub-phases; typecheck + next build + expo export after each; Playwright screenshots of /admin/login, /admin, /admin/treks/new, /admin/members/[id] at 1280×800 and 390×844.
- Copy: plain, no jargon; forms say what happens on save; destructive actions confirm.
```

## Schema (migration-003-admin.sql)

- `staff(user_id uuid pk → auth.users, name, email, role owner|admin|coach, active bool, created_at)`; RLS: only service role (no policies).
- `treks(id text pk slug, title, location, date, meet_time, meeting_point, difficulty, distance_km numeric, elevation_m int, price_inr int, member_price_inr int, slots_total int, description text, includes text[], cover_url text, gallery text[], status draft|published|cancelled, created_by uuid, created_at, updated_at)`; RLS: `select` for anon+authenticated where status='published'; writes service role only.
- `trek_reservations` gets `note text`, `updated_at`.
- `announcements(id uuid pk, title, body, starts_on date, ends_on date, audience app|site|both, created_by, created_at)`; RLS: select where current_date between starts_on and ends_on.
- `leads` gets `status new|contacted|joined|lost default new`, `note text`, `updated_at`.
- `member_notes(id uuid pk, member_id, author uuid, body text, created_at)`; service role only.
- Storage: bucket `media` public; policy: public select; inserts service role only (uploads go through /api/admin/upload).
- View `admin_member_summary` (member + last check-in + check-in count + latest weight + last food date) for the members list.

## Files

web/src/server/admin-auth.ts (cookie session, roles) · admin-data.ts (queries) · app/admin/layout.tsx (nav, role gate) · app/admin/login/page.tsx + actions · app/admin/page.tsx (overview) · app/admin/treks/page.tsx, new/page.tsx, [id]/page.tsx, actions.ts, TrekForm.tsx (client, with photo upload) · app/admin/members/page.tsx, [id]/page.tsx, actions.ts · app/admin/leads/page.tsx, actions.ts · app/admin/announcements/page.tsx, actions.ts · app/admin/staff/page.tsx, actions.ts · app/api/admin/upload/route.ts · app/api/treks/route.ts · app/api/announcements/route.ts · app/owner/page.tsx → redirect to /admin · web/src/server/treks.ts (DB-or-static) used by components/sections/Trek.tsx · mobile/src/lib/content.ts (fetch + cache) used by (tabs)/treks.tsx, trek/[id].tsx, (tabs)/index.tsx (announcement card) · shared/supabase-types.ts · README.
