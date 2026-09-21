# Fitness 7 Gym Unisex

Website + Android/iOS app for Fitness 7 Gym Unisex, Dharmapuri.

```
fitness7gym/
├── shared/    one content file both apps read — classes, trainers, plans, treks, contact
├── web/       Next.js 16 site with the 3D hero
└── mobile/    Expo app — one codebase, Android and iOS
```

## Run it

Install once, from this folder (npm workspaces — do **not** run install inside
`web/` or `mobile/`):

```bash
npm install
```

Then:

```bash
npm run web          # site at http://localhost:3000
npm run app          # Expo — scan the QR with Expo Go on your phone
npm run app:android  # Android emulator / connected device
npm run app:ios      # iOS simulator (needs a Mac)
```

Type-check everything: `npm run typecheck`
Production build of the site: `npm run web:build`

## Backend

```
app (Expo)  ──auth + own rows (RLS)──▶  Supabase (Postgres · Auth · no photos stored)
     │                                        ▲
     └──/api/* with the member's JWT──▶  web (Next.js on Render) ──secret key──┘
                                              └──▶ Anthropic (Ask F7, food text, food photos)
```

- **Supabase** holds members, check-ins, weights, class follows, trek
  reservations, food logs, leads. Schema + RLS: `supabase/schema.sql` (run once
  in the SQL editor). Setup, phone OTP, Google/Apple: **`supabase/README.md`**.
- **The app is offline-first.** Every write lands in local state and
  AsyncStorage first, then in an outbox (`mobile/src/lib/outbox.ts`) that
  replays to Supabase in the background and retries on reconnect. Kill the app
  in airplane mode after a check-in and it is still there, and synced later.
- **Local mode.** With no `EXPO_PUBLIC_SUPABASE_URL` the app behaves exactly
  like the prototype (session on the phone). A session created in local mode
  is migrated into the account on the first real sign-in.
- **Site + API** deploy to Render from `render.yaml` (Blueprint). The secret
  key lives only there. Leads from the enquiry form go to the `leads` table
  (JSONL file fallback when no key is set).

### Env vars

| Where | Var | Notes |
|---|---|---|
| Render + `web/.env.local` | `SUPABASE_URL`, `SUPABASE_SECRET_KEY` | secret key (`sb_secret_…`) or legacy `SUPABASE_SERVICE_ROLE_KEY` |
| | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | |
| | `ANTHROPIC_API_KEY`, `ASSISTANT_MODEL` | assistant (optional) |
| | `FOOD_TEXT_MODEL`, `FOOD_PHOTO_MODEL` | food logging (Phase 3) |
| | `OWNER_PASSWORD` | `/admin/login?mode=owner` — bootstraps the first staff login (Phase 4/6) |
| | `WHATSAPP_*`, `NEXT_PUBLIC_SITE_URL` | as before |
| `mobile/.env` | `EXPO_PUBLIC_API_URL` | the Render URL / fitness7gym.in |
| | `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | blank = local mode |
| | `EXPO_PUBLIC_GOOGLE_*_CLIENT_ID` | Google sign-in (optional) |

### SMS provider

Phone OTP needs an SMS provider in Supabase → Authentication → Providers →
Phone. Until the owner picks one (`CONFIRM` in `shared/gym.ts`), add **test
phone numbers with fixed codes** in that same screen and sign in with those —
no SMS is sent. Details and the Twilio steps: `supabase/README.md` §2.

### Deleting a member

Settings → Privacy → Delete my data calls `DELETE /api/member/me`, which
removes the auth user; every table cascades.

### Food logging — how it works and what it costs

```
"2 idli, sambar, oru coffee" ──▶ shared/foods.ts (on the phone, instant, offline)
                                   │ anything it can't match
                                   ▼
                       POST /api/food/parse ─▶ Claude Haiku 4.5 (tool-use, strict JSON, temp 0)
photo (≤1024 px JPEG)  POST /api/food/photo ─▶ Claude Sonnet 4.5 (vision) — photo never stored
```

- `shared/foods.ts` — 311 Indian foods with per-100 g and per-portion
  energy/macros, Tamil spellings, portion words ("rendu idli", "oru katori",
  "half plate"), and 26 plate combos ("meals", "parotta salna") that expand
  into their parts. Raw and simple foods use ICMR-NIN IFCT values; cooked
  dishes are recipe estimates and are marked `estimate: true`. The app shows a
  confidence pill on every line; nothing is a bare fact.
  `npx tsx shared/scripts/parse.test.ts "3 idly with sambar" "…"` prints the table.
- Prompts and JSON schemas: `web/src/server/food-prompts.ts`. They refuse diet
  advice and hand off under-18 / pregnancy / eating-disorder / medical
  mentions to a coach. `web/src/server/food.ts` re-checks every model number
  (kcal must agree with the macros; names that hit the table take the table's
  numbers).
- Limits: 200 text / 20 photo per member per day (`api_usage`, atomic
  counter). Tokens are logged there too; `/owner` shows the month's cost.
- **Cost per 1,000 logs** (list prices, ₹84/$): text logs that reach the model
  ≈ 1,100 in + 150 out tokens → about **₹150 per 1,000** (Haiku); most text
  logs never reach the model. Photo logs ≈ 1,500 in + 300 out → about
  **₹750 per 1,000** (Sonnet). At 100 members logging one photo and two text
  meals a day: roughly ₹2,500–3,000 a month.
- The daily target (`shared/nutrition.ts`) is Mifflin-St Jeor × activity ×
  goal; the arithmetic is shown to the member under "How this is calculated".
  Members can hide calories entirely in Settings → Training.

### Adding food — the flow

`/food/add` is one screen, three ways in, no forms: **tap** a tile (Recent,
"Usual for lunch", or a shelf — Tiffin, Rice & bread, Curries…) and it's on
the plate; **search** "idl" for instant table results (plates like "Idli,
sambar & chutney" first); or **type a sentence** ("2 idli, sambar, oru
coffee") and it's read by the table, then the model for anything left, with
one "Add all" button. The plate sits at the top with − n + steppers in the
food's own unit (idlis, katoris, cups); tap a name to swap for a neighbour.
One green button lands it in the meal. On Today, each meal is a card with
its own **+** that opens Add with that meal preselected. Tiles and shelves
come from `mobile/src/lib/food-picks.ts` (ids only — numbers stay in
`shared/foods.ts`). Screens: `web/screens/add-*.png`, `add-search-*`,
`add-sentence-*`, `add-plate-*`.

### Water, activity and reminders

- **Today screen** (`mobile/src/app/food/index.tsx`) — ring shows what's
  left of the day's budget (target + burned − eaten), three numbers, a row of
  glasses to tap as you drink (glass size 200/250/300/500 ml), and the day's
  activities. `food/activity.tsx` logs a session: pick the activity, a
  duration chip, see the estimate, add. Energy uses MET values
  (`shared/activities.ts`, Compendium of Physical Activities) × weight × hours;
  the screen calls it an estimate. Water goal = 33 ml/kg + 250 ml per 30 min
  of activity, or a fixed goal from Settings → Training.
- **Storage** — `water_logs` (one row per day) and `activity_logs`, offline-
  first through the same outbox. Run `supabase/migration-002-water-activity.sql`
  once on an existing project (fresh projects get it from `schema.sql`).
- **Reminders** (`mobile/src/lib/reminders.ts`) are local notifications, no
  server: "Breakfast/Lunch/Dinner logged?" at 9:30 / 1:30 / 9 pm only when
  that meal is empty, water nudges at 5 and 8:30 pm only when behind. The app
  reschedules them from its own state every time it comes to the foreground, so
  a reminder never fires for something already logged. Toggles in Settings →
  Notifications; permission is asked the first time the Today screen opens.
  Home also shows one quiet in-app nudge card when something is due — that one
  needs no permission.
- New native package: `expo-notifications` (bundled version). Expo Go shows
  local notifications on both platforms; a dev build is needed only for push.

### Admin dashboard (`/admin`)

The owner and staff run the gym from **`fitness7gym.in/admin`**. `/owner`
now redirects there.

```
/admin              Today — check-ins, plans ending, new leads, upcoming treks, food-analyser cost
/admin/treks        Post a trek: title, place, date, timing, difficulty, slots, prices, photos
/admin/treks/[id]   Reservations (confirm / cancel, WhatsApp the member), edit, cancel, delete
/admin/members      Every profile: search by name/phone/email; Ending this week · Inactive · No plan · New
/admin/members/[id] One member: plan editor, 12-week check-in grid, weight, 14-day food/water/activity, notes
/admin/leads        Enquiry form leads: new → contacted → joined / lost, with a note
/admin/announcements  Notices for the site banner and/or the app home (date range, optional link)
/admin/staff        Staff logins (owner only): coach · admin · owner
```

- **Roles** (`staff` table): *coach* sees members and notes; *admin* also
  treks, leads, announcements; *owner* also staff. The sidebar only shows what
  the role can open, and every server action re-checks.
- **Sign in** — staff use email + password at `/admin/login` (Supabase Auth;
  tokens in httpOnly cookies scoped to `/admin`, refreshed automatically).
  **First time:** sign in with the env `OWNER_PASSWORD` at
  `/admin/login?mode=owner`, open *Staff*, create your own login, then you
  never need the env password again (keep it as a fallback).
- **Treks** are rows in `treks` (status draft / published / cancelled).
  Published ones replace the hand-written list on the site (`/#trek`) and in
  the app (`GET /api/treks`, cached on the phone, refreshed every 5 min when
  opened). While the table is empty the site still shows `shared/gym.ts`'s
  list, so nothing goes blank. Photos are resized in the browser to 1600 px
  and land in the public `media` bucket (5 MB cap, JPEG/PNG/WebP).
- **Announcements** — `GET /api/announcements?audience=app|site`; the site
  shows them as a slim banner above the hero, the app as a card on Home.
- **Storage:** run `supabase/migration-003-admin.sql` once on an existing
  project (fresh projects get it from `schema.sql`). It adds `staff`, `treks`,
  `announcements`, `member_notes`, lead status, the `admin_member_summary`
  view and the `media` bucket. No new npm packages.
- Screenshots: `web/screens/admin/*.png` (desktop 1280 and phone 390), from
  `node web/scripts/admin-screens.mjs` against a running `next start`.
- The secret key stays on the server; the owner cookie holds a signature,
  not the password.

### Screenshots

`web/screens/*.png` — Food, Type it, Snap it (fixture plate), Home, Settings,
Progress at 390×844 in both themes, from `node web/scripts/screens.mjs` after
`npx expo export --platform web` in `mobile/` (`EXPO_PUBLIC_ALLOW_FIXTURES=1`
enables `/food/snap?fixture=1`).

## The hero

`web/src/components/story/Hero.tsx` + `HeroMedia.tsx`. GSAP ScrollTrigger drives
one timeline: the headline rises out of per-word masks, the glass panel and CTAs
follow, and the whole copy layer lifts and fades as the floor keeps moving behind
it. Everything non-essential is inside `gsap.matchMedia()` — reduced-motion
visitors get the final state immediately and a still frame.

**The walkthrough is in.** `web/public/hero/frames/` holds 80 frames cut from the Flow clip; the hero scrubs them. To replace them, regenerate with recipe 4 in the prompt pack and update `manifest.json`.

**How the media plane works.** The media plane runs in one of two modes
and picks at runtime:

- **still** (what runs today) — the gym's own wide floor photo with a slow
  scroll-driven push.
- **sequence** — drop JPEGs at `web/public/hero/frames/0001.jpg…` plus a
  `manifest.json` containing `{"count": 150}`, and it switches itself on. No code
  change.

It is a `<canvas>` frame sequence on purpose, not a `<video>` scrubbed through
`currentTime`. iOS Safari will not seek a video smoothly under scroll, so the
video approach looks perfect on a desktop and falls apart on most real traffic.
Generate the frames with recipe 4 in the ffmpeg section of the prompt pack.

Budget: keep the frame folder under 4MB. If it will not fit, cut the frame
count, not the resolution.

## Colour and type — FirstGrade's system, light and dark

Light is FirstGrade's cream set, read from its live stylesheet. Dark is **not**
FirstGrade's navy — it is a green-black charcoal taken from the gym's own
black-and-lime creative, with a hair of green in the greys so the accent sits in:

- **Type:** Fraunces 700 for headlines (tight, sentence case, optical size 144),
  Plus Jakarta Sans for everything else. Self-hosted from npm.
- **Buttons:** `.btn-green` — pill, weight 800, `0 4px 14px rgba(46,204,113,.4)` glow.
  Text on the green is ink, not white: white-on-#2ecc71 measures 2.1:1 and fails AA.
- **Theme:** `html[data-theme="dark|light"]`. A boot script in `layout.tsx` applies
  the saved choice (or the OS preference) before first paint. Toggle in the nav.
- **Bands:** the page is still a climb through three altitude bands; each band
  has a light and a dark reading in `shared/palettes.ts`. The summit is the same
  in both — full FirstGrade green, ink text.

| | dark | light |
|---|---|---|
| canvas | `#111412` | `#faf9f6` |
| card | `#181c19` | `#fffefc` |
| border | `#2a302c` | `#e9e6df` |
| text | `#eef2ef` | `#0a0f0d` |
| accent (text) | `#2ecc71` | `#15803d` |
| accent (fill) | `#2ecc71` | `#2ecc71` |

`text-lime` is the *readable* accent for the current canvas; `bg-green` / `.btn-green`
is always the vivid brand fill. Do not use `text-green` for copy on light.

**Logo:** `web/public/brand/logo-{dark,light}[@2x].png`, cut from the gym's own
creative. The logo's green is its own (`#8cba3d`) and is deliberately not
re-tinted to the UI green.

## Design system

`.claude/skills/ui-ux-pro-max/` is the UI/UX Pro Max skill, installed for
Claude Code. `design-system/fitness-7/MASTER.md` is its generated design
system for this project — read it before adding pages.

## Changing the content

Everything the owner needs to confirm lives in **`shared/gym.ts`**, marked
`CONFIRM`. Change it once and both the site and the app update:

| What | Where |
|---|---|
| Phone, WhatsApp, address, maps link | `contact` |
| Opening hours | `hours` |
| Classes and timings | `classes` |
| Trainers | `trainers` |
| Membership prices | `plans` |
| Monthly treks, dates, slots | `treks` |
| FAQ, testimonials, facilities | further down the file |

Brand colours are in `shared/brand.ts` — black `#05060A`, white, lime `#C8FF1E`,
taken from the gym's own Instagram creative.

### Photos

The prototype draws placeholder art instead of shipping stock photos. Once the
owner sends real images, drop them in and the filenames already referenced will
pick them up:

- `web/public/trainers/` — `arun.jpg`, `divya.jpg`, `vignesh.jpg`, `priya.jpg`
- `web/public/treks/` — `yercaud.jpg`, `kolli-hills.jpg`, `sitheri.jpg`, `kotagiri.jpg`
- `web/public/gallery/` — `floor-01.jpg` … `floor-06.jpg`

## WhatsApp

**Working now, no setup:** every button on the site and in the app opens
WhatsApp with the message already written — the plan they tapped, the trek they
want, their class. Enquiries land in the gym's normal WhatsApp inbox.

**Optional upgrade:** the contact form also posts to `/api/enquiry`. Fill in
`WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID` and `WHATSAPP_OWNER_NUMBER` in
`web/.env.local` (copy `web/.env.example`) and the gym gets an instant WhatsApp
alert for each form submission via the Cloud API. Leave them blank and
everything still works.

Form submissions go to the Supabase `leads` table (`web/src/server/leads.ts`);
without a Supabase key they append to `web/.data/leads.jsonl` as before.

## The app — screens and flow

The app follows the pattern people already know from every membership app
(Jakob's law): a welcome flash, a sign-in, three quick questions, then the
tabs. Signed-in members never see the first three again.

```
Welcome (1.4 s)  →  Login (+91 number · Google · Apple on iOS)
                 →  Onboarding 1/4 name · 2/4 goal · 3/4 slot · 4/4 your numbers (skippable)
                 →  Tabs: Home · Classes · Treks · Plans · Profile
```

| Screen | File | What matters |
| --- | --- | --- |
| Welcome | `app/index.tsx` | Logo, tagline, gone in under two seconds. |
| Login | `app/(auth)/login.tsx` | One field, one button, then Google/Apple. Three ways in, not seven (Hick). |
| Onboarding | `app/onboarding/index.tsx` | Progress bar 1/4 → 4/4, one question per screen; step 4 (height, age, sex, activity) can be skipped. |
| Home — empty | `app/(tabs)/index.tsx` | No plan: one green card (free trial), the popular plan as a text link, gym stats. |
| Home — member | same file | Plan + renewal date, streak, treks done, slot, next trek at member price. |
| Profile | `app/(tabs)/profile.tsx` | Initials, plan card, progress, goal/slot, help. Settings cog top-right. |
| Settings | `app/settings.tsx` | Grouped: Profile · Training · Notifications · Appearance · Support · Privacy · Sign out (red, last, alone — Von Restorff). |
| Plans | `app/(tabs)/membership.tsx` | Popular plan highlighted with a filled button; others outlined. Current plan marked. |
| Confirm plan | `app/upgrade/[plan].tsx` | What you get, how you pay (UPI / desk / WhatsApp), total, one button. |
| Welcome / success | `app/upgrade/success.tsx` | Big tick, first name, what happens next, "Go to my gym". |
| Ask F7 | `app/chat.tsx` | Same assistant as the site (see below). Chips for the common questions; "Human" opens WhatsApp. |
| Visit | `app/visit.tsx` | Address, call, WhatsApp, hours, coaches, FAQ. |
| Check in | `app/checkin.tsx` | Member code for the desk, one "I'm here" button, this week's strip, streak, bring-a-friend share. |
| Progress | `app/progress.tsx` | Streak · last 30 days · all-time visits; body-weight log with a ten-bar chart; 7-day food bars (no chart library). |
| Today | `app/food/index.tsx` | Ring (left of budget), eaten · burned · budget, protein bar, water glasses, activities, meals by slot, Type it · Snap it · Recent. |
| Log activity | `app/food/activity.tsx` | Your usual first, then categories → duration chips → estimate → add. |
| Type it | `app/food/add.tsx` | One box, live parse as you type, every line editable, one green "Add to lunch". |
| Snap it | `app/food/snap.tsx` | Camera or gallery → resized on-device → Analyse → confidence pills → "Looks right — add". |
| Recent | `app/food/recent.tsx` | Last 20 distinct items, tick and add. |

**What a member can do, online or off:** check in (feeds a real weekly
streak), log weight, follow classes (bell on each card → "Your classes" on
Home), reserve a trek slot (held, confirmed at the desk), share a guest pass.
A plan within 7 days of ending shows an amber renew banner on Home (the one
amber thing in the app — Von Restorff). All of it lives in
`src/state/session.tsx`, one Supabase table each, synced through the outbox.

**Theme.** `src/theme/ThemeProvider.tsx` — light / dark / system, saved on the
phone, on the same charcoal-and-green tokens as the website
(`shared/palettes.ts`). Switch it in Settings → Appearance.

**Session.** `src/state/session.tsx` — the member record is cached on the phone
(AsyncStorage) and backed by Supabase (see *Backend*). Every screen reads from
this one hook; writes go local-first through the outbox.

**Payment.** The confirm screen records the plan and hands off to UPI (deep
link, once `contact.upi` is set in `shared/gym.ts`), the front desk, or a
WhatsApp payment link. Razorpay drops into `confirm()` in `upgrade/[plan].tsx`
later without touching the screens around it.

**Assistant.** `shared/assistant.ts` is used by both the site (`/api/chat`) and
the app. On the phone the common questions are answered on-device — instant,
offline. Set `EXPO_PUBLIC_API_URL` (copy `mobile/.env.example`) to the deployed
site and free-text questions go through the site's API, which adds Claude on
top of the same facts when `ANTHROPIC_API_KEY` is set there.

## Shipping the app

The app is Expo, so one codebase builds both stores:

```bash
npx eas build --platform android
npx eas build --platform ios     # needs an Apple Developer account
```

Bundle ID / package name is `in.fitness7gym.app` — change it in `mobile/app.json`
before the first store submission if you want something different.

## Notes

- The 3D is hand-built geometry — layered sine ridgelines and a soft cloud layer — not a downloaded model, so it loads fast and works offline. It does not render for visitors with reduced motion on, or on very low-memory devices; they get the same page with a still gradient.
- The one glass panel is `.glass-panel` in `globals.css`, with an `@supports` fallback to an opaque surface where `backdrop-filter` is unavailable. There is deliberately only one — glass on every card reads cheap and wrecks contrast over moving media.
- Contrast was measured on rendered pixels, not computed from CSS: five of six sampled text blocks clear 4.5:1 by a wide margin, and the sixth was taken to full strength rather than estimated.
- The 3D hero is hand-built geometry, not a downloaded model, so it loads fast
  and works offline. It does not render for visitors who have "reduce motion"
  on, or on very low-memory devices — they get the same layout without it.
- Dates and prices are formatted by hand rather than through `Intl`, so the
  server and browser can never disagree and cause a hydration mismatch.
