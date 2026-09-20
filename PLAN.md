# PLAN — Fitness 7: real backend + nutrition tracking

_Written 2026-09-21 before any code. Phases ship one at a time; the tree typechecks after each._

## 0. Ground rules that shape every decision below

- **Nothing on screen changes in Phase 1.** Same hook API (`useSession → member, signIn, signOut, update, checkIn, logWeight, toggleFollow, toggleReserve`), same screens. The only visible addition is a 6-digit code field that appears under the phone field *after* "Continue" is tapped (phone OTP needs somewhere to type the code; the field, the button and the Google/Apple buttons stay as they are).
- **Offline-first, no new spinners.** Every write lands in local state and AsyncStorage first, then goes into an outbox that syncs to Supabase in the background and retries on reconnect. The UI never waits for the network.
- **Local mode still works.** If `EXPO_PUBLIC_SUPABASE_URL` is unset the app behaves exactly as today (local session), so `expo export --platform web`, screenshots and the owner demo keep working with no keys.
- **No invented nutrition numbers.** Every kcal/macro comes from `shared/foods.ts` (`source:"table"`) or from Claude with a 0–1 `confidence` the UI shows (`source:"model"`). Table rows that are estimates are marked `estimate: true`.
- **Keys.** Supabase now issues `sb_publishable_…` / `sb_secret_…` keys; the legacy `anon` / `service_role` JWTs still work until end-2026. Env names below accept either (`SUPABASE_SECRET_KEY` **or** `SUPABASE_SERVICE_ROLE_KEY`; `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` **or** `EXPO_PUBLIC_SUPABASE_ANON_KEY`). `render.yaml` already lists the new names.
- **Design language unchanged.** `useColors()` everywhere, `Card / Body / Display / Eyebrow / LimeButton / Pill` from `components/ui.tsx`, `Screen / Group / Row` from `components/Screen.tsx`, one accent element per screen, 44 pt targets, no new UI libraries. New native packages are limited to what the feature physically needs (Supabase client, NetInfo, image picker, auth-session, Apple auth) and are installed at the versions in `node_modules/expo/bundledNativeModules.json`.

## 1. Files

### Created
| File | Phase | Purpose |
|---|---|---|
| `PLAN.md` | 0 | this file |
| `supabase/schema.sql` | 1 | whole schema + RLS + triggers, runs once in the SQL editor |
| `supabase/README.md` | 1 | how to create the project, run the SQL, enable phone OTP (test mode → Twilio/MSG91), Google/Apple providers |
| `shared/supabase-types.ts` | 1 | row types shared by app and site (`MemberRow`, `FoodLogRow`, …) |
| `mobile/src/lib/supabase.ts` | 1 | client factory (AsyncStorage session, `isConfigured()`); returns `null` in local mode |
| `mobile/src/lib/outbox.ts` | 1 | offline write queue: `enqueue(op)`, `flush()`, reconnect listener, exponential backoff |
| `mobile/src/lib/auth.ts` | 1 | `sendOtp`, `verifyOtp`, `googleSignIn` (expo-auth-session → `signInWithIdToken`), `appleSignIn` (iOS) |
| `mobile/src/lib/api.ts` | 3 | `postJson(path, body)` with the Supabase JWT in `Authorization` |
| `web/src/server/supabase.ts` | 1 | server-only client (secret key) + `memberFromRequest(req)` JWT verify |
| `web/src/app/api/member/me/route.ts` | 1 | GET own member row (JWT) — also used by the owner dashboard with the secret key |
| `shared/nutrition.ts` | 2 | `mifflinStJeor`, `activityFactor`, `dailyTarget`, `MemberNumbers` type |
| `shared/scripts/nutrition.test.ts` | 2 | tiny assertion script, `npx tsx shared/scripts/nutrition.test.ts` |
| `shared/foods.ts` | 3 | ≥300 Indian foods, per-100 g + per-portion macros, aliases, `matchFood`, `parseLocal` |
| `shared/scripts/parse.test.ts` | 3 | runs the parser over the 25 test strings, prints the table |
| `web/src/server/food-prompts.ts` | 3 | the exact prompts + tool schemas (section 4) |
| `web/src/server/food-limits.ts` | 3 | per-member daily counters in `api_usage` + token logging |
| `web/src/app/api/food/parse/route.ts` | 3 | POST text → items |
| `web/src/app/api/food/photo/route.ts` | 3 | POST photo → items + plateDescription |
| `mobile/src/state/food.tsx` | 3 | `useFood()` — today's log, targets, add/remove, same outbox |
| `mobile/src/components/Ring.tsx` | 3 | kcal ring drawn with Views (no SVG lib): two half-circle arcs, mask trick — same technique as the weight chart |
| `mobile/src/components/FoodItemRow.tsx` | 3 | editable item row: name, grams stepper ±, kcal, confidence pill |
| `mobile/src/app/food/index.tsx` | 3 | Food screen |
| `mobile/src/app/food/add.tsx` | 3 | Type it |
| `mobile/src/app/food/snap.tsx` | 3 | Snap it |
| `mobile/src/app/food/recent.tsx` | 3 | Recent (last 20 distinct items, one-tap re-add) |
| `mobile/assets/fixtures/plate.jpg` | 3 | fixture photo for the web build / screenshots |
| `web/src/app/owner/page.tsx` + `web/src/app/owner/login/route.ts` | 4 | owner dashboard behind `OWNER_PASSWORD` cookie |
| `web/scripts/screens.ts` | verify | Playwright: 4 screens × 2 themes at 390×844 + contrast check |

### Changed
| File | Phase | Change |
|---|---|---|
| `mobile/src/state/session.tsx` | 1 | same API; Supabase + cache + outbox behind it; migration of an existing local session; `Member` gains `heightCm? age? sex? activity? hideCalories?` |
| `mobile/src/app/(auth)/login.tsx` | 1 | after Continue: OTP field appears; Google/Apple call real auth; error copy |
| `mobile/src/app/settings.tsx` | 1, 2, 3 | Privacy copy ("Stored on this phone only" → "Stored in your account…"); Delete my data → calls `/api/member/me` DELETE; Training gets Your numbers + targets + hide-calories toggle |
| `mobile/src/app/_layout.tsx` | 1, 3 | `OutboxProvider`-less: flush is wired inside SessionProvider; add `food/*` stack screens |
| `mobile/src/app/onboarding/index.tsx` | 2 | step 4 "Your numbers", skippable, 1/4…4/4 |
| `mobile/src/app/(tabs)/index.tsx` | 3 | Today tile under the check-in card |
| `mobile/src/app/progress.tsx` | 3 | 7-day kcal bars next to the weight chart |
| `mobile/src/app/checkin.tsx` | 1 | `memberCode` unchanged (uses id; Supabase uuid works) |
| `mobile/package.json` | 1, 3 | new deps (see §6) |
| `web/src/server/leads.ts` | 1 | `appendLead` → Supabase insert (falls back to JSONL when no secret key, so local dev still works) |
| `web/src/app/api/enquiry/route.ts` | 1 | unchanged call site |
| `web/package.json` | 1 | `@supabase/supabase-js` |
| `web/.env.example`, `mobile/.env.example`, `render.yaml` | 1, 3, 4 | env vars |
| `README.md` | 1, 4 | Backend section |
| `shared/gym.ts` | 4 | CONFIRM list: SMS provider; is calorie tracking in every plan or PT only |
| `shared/index.ts` | 2, 3 | export nutrition, foods |

## 2. Supabase schema (`supabase/schema.sql`)

Runs once in the SQL editor with no manual steps: extensions, tables, RLS, the trigger that creates a `members` row for every new auth user, and the `api_usage` table for rate limits.

```sql
-- Fitness 7 Gym Unisex — schema. Run once in Supabase → SQL editor.
create extension if not exists pgcrypto;

-- ---------- members (1:1 with auth.users) ----------
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

create table if not exists public.checkins (
  member_id uuid not null references public.members(id) on delete cascade,
  date      date not null,
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
  member_id uuid not null references public.members(id) on delete cascade,
  class_id  text not null,
  created_at timestamptz not null default now(),
  primary key (member_id, class_id)
);

create table if not exists public.trek_reservations (
  member_id uuid not null references public.members(id) on delete cascade,
  trek_id   text not null,
  status    text not null default 'held' check (status in ('held','confirmed','cancelled')),
  created_at timestamptz not null default now(),
  primary key (member_id, trek_id)
);

-- ---------- website leads (service role only) ----------
create table if not exists public.leads (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  phone      text not null,
  interest   text,
  message    text,
  source     text not null default 'website' check (source in ('website','app')),
  created_at timestamptz not null default now()
);

-- ---------- food logs ----------
create table if not exists public.food_logs (
  id          uuid primary key,                       -- generated on the device so offline adds are idempotent
  member_id   uuid not null references public.members(id) on delete cascade,
  date        date not null,
  meal        text not null check (meal in ('breakfast','lunch','snacks','dinner')),
  name        text not null,
  food_id     text,                                   -- shared/foods.ts id when matched
  grams       numeric(7,1) not null check (grams > 0),
  portion_label text,
  kcal        numeric(7,1) not null,
  protein_g   numeric(6,1) not null default 0,
  carbs_g     numeric(6,1) not null default 0,
  fat_g       numeric(6,1) not null default 0,
  confidence  numeric(3,2) not null default 1 check (confidence between 0 and 1),
  source      text not null check (source in ('table','model','photo')),
  logged_at   timestamptz not null default now(),
  deleted_at  timestamptz
);
create index if not exists food_logs_member_date on public.food_logs (member_id, date);

-- ---------- API usage / rate limits ----------
create table if not exists public.api_usage (
  member_id  uuid not null references public.members(id) on delete cascade,
  date       date not null,
  kind       text not null check (kind in ('food_text','food_photo')),
  count      int  not null default 0,
  input_tokens  int not null default 0,
  output_tokens int not null default 0,
  primary key (member_id, date, kind)
);

-- ---------- updated_at ----------
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists members_touch on public.members;
create trigger members_touch before update on public.members
  for each row execute function public.touch_updated_at();

-- ---------- create a member row for every new auth user ----------
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.members (id, phone, email, provider)
  values (
    new.id,
    new.phone,
    new.email,
    case when new.phone is not null then 'phone'
         when coalesce(new.raw_app_meta_data->>'provider','') = 'google' then 'google'
         when coalesce(new.raw_app_meta_data->>'provider','') = 'apple' then 'apple'
         else 'email' end
  ) on conflict (id) do nothing;
  insert into public.notification_prefs (member_id) values (new.id) on conflict do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- RLS ----------
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
  for all to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- every per-member table: same shape
do $$
declare t text;
begin
  foreach t in array array['notification_prefs','checkins','weights','class_follows','trek_reservations','food_logs']
  loop
    execute format('drop policy if exists %I_self on public.%I', t, t);
    execute format(
      'create policy %I_self on public.%I for all to authenticated using (member_id = auth.uid()) with check (member_id = auth.uid())',
      t, t);
  end loop;
end $$;

-- api_usage: members may read their own counters; only the service role writes
drop policy if exists api_usage_read on public.api_usage;
create policy api_usage_read on public.api_usage for select to authenticated using (member_id = auth.uid());

-- leads: no policy for anon/authenticated → only the service role (bypasses RLS) can insert/read
-- (an explicit deny is the absence of a policy once RLS is on)

-- ---------- atomic counter used by the food routes ----------
create or replace function public.bump_api_usage(p_member uuid, p_kind text, p_limit int, p_in int, p_out int)
returns int language plpgsql security definer set search_path = public as $$
declare c int;
begin
  insert into public.api_usage (member_id, date, kind, count, input_tokens, output_tokens)
  values (p_member, current_date, p_kind, 1, p_in, p_out)
  on conflict (member_id, date, kind) do update
    set count = api_usage.count + 1,
        input_tokens = api_usage.input_tokens + excluded.input_tokens,
        output_tokens = api_usage.output_tokens + excluded.output_tokens
  returning count into c;
  return c;   -- caller compares with p_limit; >limit means 429
end $$;
```

Optional (only if photos may be kept 30 days): a private Storage bucket `food-photos`, path `{member_id}/{log_id}.jpg`, RLS on `storage.objects` scoped to `auth.uid()`, and a daily `pg_cron` job deleting objects older than 30 days. Default is **discard** — the image never leaves the request.

## 3. API contracts

All routes: `Content-Type: application/json`. Food and member routes require `Authorization: Bearer <supabase access token>`; the server verifies it with `supabase.auth.getUser(token)` using the secret key. Errors are `{ error: string }` with 400/401/413/429/502.

### `POST /api/enquiry` (unchanged shape) → inserts into `leads`

### `GET /api/member/me`
→ `200 { member: MemberRow, notifications: {classes,treks,renewals}, counts: { checkins, weights, follows, reservations } }`
### `DELETE /api/member/me`
Deletes the auth user (cascades to every table) → `200 { ok: true }`. Used by Settings → Delete my data.

### `POST /api/food/parse`
```jsonc
// request
{ "text": "2 idli, sambar, one filter coffee",
  "memberContext": { "goal": "fat-loss", "targetKcal": 1900, "hour": 8 } }   // optional
// response
{ "items": [
    { "name": "Idli", "foodId": "idli", "grams": 80, "portionLabel": "2 idli",
      "kcal": 116, "proteinG": 3.4, "carbsG": 24.4, "fatG": 0.4,
      "confidence": 1, "source": "table", "needsConfirm": false },
    { "name": "Sambar", "foodId": "sambar", "grams": 150, "portionLabel": "1 katori",
      "kcal": 98, "proteinG": 4.5, "carbsG": 14, "fatG": 2.4, "confidence": 1, "source": "table", "needsConfirm": false },
    { "name": "Filter coffee (with milk & sugar)", "foodId": "filter-coffee", "grams": 120, "portionLabel": "1 cup",
      "kcal": 62, "proteinG": 1.6, "carbsG": 9.5, "fatG": 1.9, "confidence": 1, "source": "table", "needsConfirm": false }
  ],
  "mealSlot": "breakfast",
  "notes": null,
  "usage": { "modelCalled": false, "inputTokens": 0, "outputTokens": 0, "remainingToday": 197 } }
```
- `grams` is the total for the portion (2 idli = 2 × 40 g).
- Table match runs first (`parseLocal`); only unmatched fragments go to Claude, which returns the same item shape with `source:"model"` and its own confidence.
- `mealSlot` = explicit word in the text ("lunch") else by `memberContext.hour` (5–10 breakfast, 11–15 lunch, 16–18 snacks, else dinner).
- 429: `{ "error": "You've logged a lot today — text logging resets at midnight. You can still add from Recent." }`

### `POST /api/food/photo`
```jsonc
// request  (JPEG, longest side ≤1024 px, ≤600 KB base64-decoded; larger → 413)
{ "imageBase64": "/9j/4AAQ…", "hint": "lunch at home" }
// response — same `items` shape, every item has needsConfirm, plus:
{ "items": [ … "source": "photo" … ],
  "mealSlot": "lunch",
  "plateDescription": "Steel plate with white rice, a ladle of sambar, a small katori of curd and two papads.",
  "notFood": false,
  "notes": "Papad count unclear — check.",
  "usage": { "modelCalled": true, "inputTokens": 1450, "outputTokens": 310, "remainingToday": 18 } }
```
- Non-food image → `200 { items: [], notFood: true, plateDescription: "…", notes: "That doesn't look like a meal — try a photo of the plate." }` (no usage counted against the photo limit… it is counted, since the model was called).
- 429: `{ "error": "20 photos a day is the limit — type the meal instead and it still counts." }`

### Rate limits & logging
`bump_api_usage(member, kind, limit, inTokens, outTokens)` after each model call; the count check happens *before* the call with a read, and the atomic bump after, so a burst can overshoot by at most the in-flight requests. Limits: `food_text` 200/day, `food_photo` 20/day. Token totals stay in `api_usage` for the cost line in the owner dashboard.

## 4. Prompts sent to Claude (verbatim, from `web/src/server/food-prompts.ts`)

### 4.1 Shared safety block (prepended to both system prompts)
```
You are the nutrition logging assistant inside the Fitness 7 Gym app (Dharmapuri, Tamil Nadu). Your only job is to turn what a member ate into food items with portion sizes in grams or millilitres and their energy and macronutrients. You are not a dietitian and you do not give advice.

RULES
- Never give diet, weight-loss, supplement or medical advice. If the text asks for advice, or mentions being under 18, pregnancy, breastfeeding, an eating disorder, diabetes or any medical condition, set "handoff": true and put one short, kind sentence in "notes" telling them to talk to a Fitness 7 coach — do not answer the question.
- Never invent a brand, a sugar level, an oil quantity or an ingredient you cannot infer from the words or see in the image. When unsure, choose the plainer, more common home-style version and lower the confidence.
- Indian home food, South-Indian first. Use these portion references:
  1 idli = 40 g · 1 dosa = 80 g · 1 set dosa = 60 g · 1 uthappam = 120 g · 1 parotta = 90 g · 1 chapati/roti/phulka = 40 g · 1 poori = 35 g · 1 vada/vadai = 45 g · 1 medu vada = 45 g · 1 masala vada = 40 g · 1 cup cooked rice = 150 g · 1 katori/small bowl = 150 ml · 1 glass = 250 ml · 1 cup/tumbler (coffee, tea) = 120 ml · 1 ladle = 60 ml · 1 tbsp = 15 g · 1 tsp = 5 g · 1 banana (medium) = 100 g · 1 egg = 50 g · 1 scoop protein powder = 30 g.
- Spelling varies: idli/idly, dosa/dosai, sambar/sambhar, kuzhambu/kulambu, parotta/porotta/barotta, kothu/kothu parotta, pongal/ven pongal, vada/vadai, curd rice/thayir sadam, rasam, upma/uppuma, poori/puri, chapati/chapathi/roti, biryani/biriyani, chicken 65, mutton kuzhambu, meen kuzhambu, kootu, poriyal, appalam/papad, payasam, kesari, filter coffee/kaapi, tea/chai, buttermilk/mor/neer mor, groundnut chikki, puttu, appam, idiyappam, kichadi, kuruma/kurma. Read Tanglish (e.g. "rendu idli" = 2 idli, "oru cup" = 1 cup, "konjam" = a little ≈ half portion).
- Energy and macros are per the whole portion, in kcal and grams. Use standard Indian food-composition values (ICMR-NIN). Round kcal to whole numbers and grams to one decimal.
- "confidence" is 0–1: 0.9+ when the food and portion are both clear, 0.6–0.8 when the food is clear but the portion is guessed, below 0.6 when the food itself is uncertain. Anything below 0.75 must have "needsConfirm": true.
- Output only through the tool. No prose outside it.
```

### 4.2 Text parse — system prompt suffix (Haiku 4.5, temperature 0, max_tokens 400, `tool_choice: {type:"tool", name:"log_items"}`)
```
The app already matched these fragments against its food table and will use those numbers as-is — DO NOT return them again:
{{MATCHED_ITEMS_JSON}}

Return items only for the remaining text:
"{{UNMATCHED_TEXT}}"

If the remaining text contains no food, return an empty items list. Meal slot: if the text names a meal (breakfast/tiffin, lunch/saapadu, snacks/evening, dinner) use it, else use "{{DEFAULT_SLOT}}".
```
User message: the original full text (so the model has context for quantities like "2 with sambar").

Tool schema `log_items` (strict, `additionalProperties:false` everywhere):
```json
{ "type":"object", "required":["items","mealSlot","handoff"], "properties":{
  "items":{"type":"array","maxItems":12,"items":{"type":"object",
    "required":["name","grams","portionLabel","kcal","proteinG","carbsG","fatG","confidence","needsConfirm"],
    "properties":{
      "name":{"type":"string","maxLength":60},
      "grams":{"type":"number","minimum":1,"maximum":2000},
      "portionLabel":{"type":"string","maxLength":40},
      "kcal":{"type":"number","minimum":0,"maximum":3000},
      "proteinG":{"type":"number","minimum":0,"maximum":300},
      "carbsG":{"type":"number","minimum":0,"maximum":500},
      "fatG":{"type":"number","minimum":0,"maximum":300},
      "confidence":{"type":"number","minimum":0,"maximum":1},
      "needsConfirm":{"type":"boolean"} }}},
  "mealSlot":{"type":"string","enum":["breakfast","lunch","snacks","dinner"]},
  "handoff":{"type":"boolean"},
  "notes":{"type":"string","maxLength":160} } }
```

### 4.3 Photo — system prompt suffix (Sonnet 4.5 vision, temperature 0, max_tokens 700, same tool plus `plateDescription` and `notFood`)
```
You will receive one photo of food and an optional hint from the member.

1. First decide whether the image shows food or drink a person is about to eat. If not (a person, a gym floor, a screenshot, a menu, packaging with no visible food), set "notFood": true, describe what you see in one plain sentence in "plateDescription", return no items, and put "That doesn't look like a meal — try a photo of the plate." in "notes".
2. Identify each distinct food or drink you can actually see. Do not add items you would expect but cannot see (no invisible sambar, no assumed sugar in coffee, no ghee unless it glistens).
3. Estimate each portion in grams or millilitres using what is in the frame as a scale: a standard steel plate is ~27 cm, a steel tumbler ~120 ml, a katori ~150 ml, an idli ~8 cm, a dosa covers most of the plate, a tablespoon ~15 g. If the count of pieces is unclear, give the lower count and set "needsConfirm": true.
4. Map to plain Indian food names (the spelling list above). Rice + sambar + curd on one plate are three items.
5. Give energy and macros per portion and a confidence per item. Portion estimates from a photo are inherently rough: cap confidence at 0.85 and set "needsConfirm": true for anything under 0.75, for mixed dishes (biryani, kothu, pulao) and for anything fried where oil is unknown.
6. "plateDescription": one sentence a member can check at a glance ("Steel plate: white rice, a ladle of sambar, a katori of curd, two papads.").
Hint from the member (may be empty, may be wrong — trust the image): "{{HINT}}"
Default meal slot if the hint does not say: "{{DEFAULT_SLOT}}".
```
User content: `[{type:"image", source:{type:"base64", media_type:"image/jpeg", data}}, {type:"text", text:"Log this."}]`.

Post-processing on both routes (never trust the model blindly): drop items with `grams<=0` or `kcal<0`; if kcal is wildly off the macros (|4P+4C+9F − kcal| > 35 % of kcal) recompute kcal from the macros and lower confidence by 0.1; if an item name fuzzy-matches the table with score ≥0.9, replace the macros with the table's (scaled to the model's grams) and mark `source:"table"`.

## 5. Phases

### Phase 1 — Supabase + auth + sync (no new UI)
1. `supabase/schema.sql` + `supabase/README.md`.
2. `shared/supabase-types.ts`.
3. Mobile: `lib/supabase.ts`, `lib/outbox.ts`, `lib/auth.ts`; rewrite `state/session.tsx` (same API):
   - Boot: read cache (`f7-session`) → `ready:true` immediately (no spinner) → if configured, `supabase.auth.getSession()`; if a session exists, pull `members` + child tables, merge (server wins for profile fields, union for checkins/weights/follows/reservations), write cache.
   - Writes: update state + cache synchronously, `enqueue({kind, payload})`, `flush()` fire-and-forget. Ops: `member.update`, `checkin.add`, `weight.upsert`, `follow.set`, `reserve.set`, `food.add`, `food.remove`. Each op is idempotent (upserts keyed by primary key) so retries are safe. Flush runs on boot, after each enqueue, on `NetInfo` reconnect, and on app foreground; backoff 2 s → 60 s.
   - `signIn({provider, identity})` keeps its signature. Phone: `sendOtp(+91…)` → login shows the code field → `verifyOtp` → session. Google: `expo-auth-session` Google provider → `signInWithIdToken`. Apple: `expo-apple-authentication` → `signInWithIdToken`. In local mode the old behaviour (accept and store) remains.
   - Migration: on the first successful sign-in, if a `local-*` member exists in cache, its name/goal/slot/plan/checkins/weights/followed/reserved are enqueued to the new account, then the cache key is rewritten under the Supabase id.
   - `signOut`: `supabase.auth.signOut()`, clear cache and outbox.
4. Login screen: OTP field (6 digits, `oneTimeCode` content type), "Resend code" text link after 30 s; buttons unchanged.
5. Web: `server/supabase.ts`; `leads.ts` insert; `/api/member/me` GET + DELETE; `.env.example`s; README Backend section.
6. Settings → Privacy copy.
7. Checks: `npm run typecheck`, `npx expo export --platform web`, `npm run build --workspace=web`. Then the on-device checklist for Praki (sign in, check in, kill app, reopen; airplane mode check-in then reconnect).

### Phase 2 — Onboarding "Your numbers" + target
1. `shared/nutrition.ts`: `mifflinStJeor({kg, cm, age, sex})`, `activityFactor("gym3"|"gym5"|"trek")` = 1.375 / 1.55 / 1.725, `dailyTarget(member)` → `{kcal, proteinG, carbsG, fatG, basis}` with goal: fat-loss ×0.85, strength ×1.10, trek/general ×1.0; protein = 1.6 g/kg (general/trek), 1.8 (fat-loss), 2.0 (strength); fat = 25 % of kcal; carbs = remainder. Returns `null` when height/age/sex/weight missing (UI then shows "Add your numbers to get a target"). Weight comes from the latest `weights` entry.
2. `shared/scripts/nutrition.test.ts` with 6 assertions (known Mifflin values, goal multipliers, null path).
3. Onboarding step 4, skippable ("Skip for now" text link), 1/4…4/4; numeric pads, placeholders 170 / 28; ranges only.
4. Settings → Training: Your numbers (same fields) + target line.

### Phase 3 — Nutrition
1. `shared/foods.ts` (≥300 foods, ICMR-NIN where known, `estimate:true` otherwise), `matchFood(text)`, `parseLocal(text)` (quantity words: numbers, "one/two/rendu/moonu/half/oru/quarter", units: idli/piece/cup/katori/glass/plate/bowl/spoon/ladle/scoop/g/ml).
2. `parse.test.ts` prints item → grams → kcal → source.
3. Web routes `food/parse`, `food/photo`, `food-prompts.ts`, `food-limits.ts`.
4. Mobile: `state/food.tsx`, `lib/api.ts`, `Ring.tsx`, `FoodItemRow.tsx`, four `food/*` screens, Home Today tile, Progress 7-day bars, Settings → Training targets + "How this is calculated" + Hide calories.
5. New deps: `expo-image-picker`, `expo-image-manipulator` (resize to 1024 px, JPEG 0.8), at bundled versions.

### Phase 4 — Owner dashboard
`/owner`: password form → cookie (HMAC of `OWNER_PASSWORD`, 7 days) → server component reading with the secret key: today's check-ins (name, time), plans expiring in 7 days, trek reservations by trek, last 50 leads, API usage this month with an estimated ₹ cost line. Read-only, no client JS beyond the form.

### Verify & deliver
Playwright screenshots (Food, Add, Snap with the fixture, Home Today tile) × dark/light at 390×844 against `expo export --platform web` served locally; contrast measured on the rendered ring labels; the 25-string parser table; README + CONFIRM list; final env var list + commands.

## 6. Packages

| Workspace | Package | Why |
|---|---|---|
| mobile | `@supabase/supabase-js` | auth + data |
| mobile | `@react-native-community/netinfo` (bundled version) | reconnect trigger for the outbox |
| mobile | `expo-auth-session`, `expo-crypto` (bundled) | Google sign-in |
| mobile | `expo-apple-authentication` (bundled) | Apple sign-in on iOS |
| mobile | `expo-image-picker`, `expo-image-manipulator` (bundled) | Snap it |
| web | `@supabase/supabase-js` | server client |

`react-native-url-polyfill` is no longer needed with supabase-js ≥2.45 on RN 0.86 (global URL is complete); verified during Phase 1 install.

## 7. Env vars

**web/.env.local and Render**
```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SECRET_KEY=sb_secret_…            # or SUPABASE_SERVICE_ROLE_KEY=eyJ… (legacy)
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_…   # or NEXT_PUBLIC_SUPABASE_ANON_KEY
ANTHROPIC_API_KEY=sk-ant-…
ASSISTANT_MODEL=claude-haiku-4-5-20251001
FOOD_TEXT_MODEL=claude-haiku-4-5-20251001
FOOD_PHOTO_MODEL=claude-sonnet-4-5
OWNER_PASSWORD=…                            # phase 4
FOOD_PHOTO_RETENTION=discard                # or "30d" if you say so
```
**mobile/.env**
```
EXPO_PUBLIC_API_URL=https://fitness7gym.in
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_…   # or EXPO_PUBLIC_SUPABASE_ANON_KEY
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=…apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=…
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=…
```

## 8. Two questions (asked once, then I proceed)
1. Supabase project URL + publishable/anon key + secret/service-role key → you paste them into `web/.env.local` and `mobile/.env` (I never need to see them; the build works without them in local mode).
2. Photos: **discard after analysis (default)** or keep in Supabase Storage for 30 days?
