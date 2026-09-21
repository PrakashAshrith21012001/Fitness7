# Supabase — setup for Fitness 7

One project, free tier, region **Mumbai (ap-south-1)** — closest to Dharmapuri.

## 1. Create the project (5 min)

1. supabase.com → New project → name `fitness7`, region Mumbai, generate a database password (you never need it again).
2. **SQL editor → New query** → paste all of `supabase/schema.sql` → **Run**. It creates every table, the RLS policies and the trigger that adds a `members` row for each new sign-in. Re-running it is safe.
3. **Settings → API keys**. Copy:
   - Project URL → `SUPABASE_URL` (web) and `EXPO_PUBLIC_SUPABASE_URL` (mobile)
   - **Publishable** key (`sb_publishable_…`) → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - **Secret** key (`sb_secret_…`) → `SUPABASE_SECRET_KEY` — **web/.env.local and Render only, never in the app**

   The older `anon` / `service_role` JWT keys still work: put them in `…_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` instead. The code accepts either name.

## 2. Phone OTP

**Authentication → Sign In / Providers → Phone → enable.**

### Development — no SMS provider yet
Supabase lets you define **test phone numbers with fixed OTPs**:
Authentication → Providers → Phone → *Test OTPs* (or *Phone numbers for testing*) → add e.g. `+919876543210 = 123456`.
Sign in with that number in the app, type `123456`. No SMS is sent, nothing is billed. Add one line per tester.

### Production — a real SMS provider
Supabase sends OTPs through Twilio, MessageBird, Textlocal or Vonage. For India the cheapest paths that clear DLT registration are **Twilio** (works out of the box, ~₹0.5/SMS) or **MSG91 via the "Twilio-compatible" bridge**. Steps for Twilio:

1. twilio.com → buy a number with SMS (an Indian long code needs DLT; a US number works for testing but Indian carriers may drop it — ask the owner which provider they already pay for; that is the `CONFIRM` item in `shared/gym.ts`).
2. Supabase → Authentication → Providers → Phone → SMS provider **Twilio** → paste Account SID, Auth Token, Message Service SID.
3. Template: `Your Fitness 7 code is {{ .Code }}. Valid 5 minutes.`
4. Remove the test numbers.

Rate limits: Authentication → Rate limits → keep "SMS messages per hour" at 30 until launch.

## 3. Google sign-in

1. Google Cloud console → APIs & Services → Credentials → **OAuth client IDs**:
   - *Web application* — authorized redirect URI `https://<project-ref>.supabase.co/auth/v1/callback`. Copy the client id + secret.
   - *Android* — package `in.fitness7gym.app`, SHA-1 from `eas credentials` (or `keytool` on the debug keystore for Expo Go).
   - *iOS* — bundle id `in.fitness7gym.app`.
2. Supabase → Authentication → Providers → **Google** → paste the *web* client id and secret. Under "Authorized Client IDs" also add the Android and iOS client ids (comma-separated) so `signInWithIdToken` accepts tokens from the app.
3. `mobile/.env`:
   ```
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=…apps.googleusercontent.com
   EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=…
   EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=…
   ```
   Without these the Google button falls back to a local session (dev only) and says so in the Metro log.

## 4. Apple sign-in (iOS only)

Supabase → Authentication → Providers → **Apple** → enable, and add the bundle id `in.fitness7gym.app` under "Authorized Client IDs". `expo-apple-authentication` returns an identity token that Supabase verifies directly — no Services ID or secret is needed for native sign-in. Requires a paid Apple developer account and the "Sign in with Apple" capability, which EAS adds when `ios.usesAppleSignIn` is true in `app.json` (already set).

## 5. Deleting a member

Settings → Privacy → *Delete my data* calls `DELETE /api/member/me`, which removes the auth user with the secret key; every table cascades from `members.id`.

## 6. Food photos

Photos are **not stored**. The app resizes to 1024 px, posts the JPEG to `/api/food/photo`, the route forwards it to Claude and returns the items. Nothing is written to Storage. (If that ever changes: private bucket `food-photos`, path `{member_id}/{log_id}.jpg`, RLS on `storage.objects`, a nightly `pg_cron` delete older than 30 days.)

## 7. Admin dashboard (`/admin`)

Run `supabase/migration-003-admin.sql` once (SQL editor) on a project created before Phase 6; fresh projects get it from `schema.sql`. It adds:

- `staff` — who may open `/admin` (`role`: coach / admin / owner, `active`). Rows are created from `/admin/staff`, which also creates the Supabase Auth user (email + password, confirmed). Nothing to do in the Supabase dashboard.
- `treks`, `announcements` — public **read** of published/active rows (RLS), writes only with the secret key from the server.
- `member_notes`, `leads.status/note`, `trek_reservations.note`, view `admin_member_summary`.
- Storage bucket **`media`** — public read, 5 MB, JPEG/PNG/WebP. Trek photos go to `treks/<id>/…`. Uploads happen only through `/api/admin/upload` with a staff cookie.

**First admin:** sign in at `/admin/login?mode=owner` with the env `OWNER_PASSWORD`, open *Staff*, add yourself as *owner*. From then on use email + password at `/admin/login`.
