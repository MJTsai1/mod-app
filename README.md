# Moderator Application Website

A production-ready community portal for a Discord server: moderator applications, member
reports, ban appeals, an FAQ page, and an authenticated staff dashboard — backed by a Postgres
database (Supabase) and built with Next.js (App Router) + TypeScript, deployed to Vercel.

Two separate identities exist in the app:

- **Staff** sign in with email + an admin-assigned password (`/admin/login`) — no self-service
  signup. This grants access to `/admin/*`.
- **Community members** sign in with Discord OAuth (via Supabase Auth) to apply, file a report,
  submit a ban appeal, and check status later (`/account`). This grants no dashboard access on
  its own — see "Security notes" below.

Applications, reports, and ban appeals all require Discord sign-in — the applicant's Discord
username/ID are taken directly from their session (not typed in), so there's no way to apply or
report under a fake identity.

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind CSS v4)
- **Supabase** — Postgres database, Auth (staff sign-in), Row Level Security
- **Vercel** — hosting/CDN
- **Zod** — client- and server-side validation
- **Cloudflare Turnstile** (optional) — spam/abuse protection on the form

Everything sensitive (Supabase service role key, Discord webhook URL, Turnstile secret) lives in
server-only environment variables and is read only inside API routes / server components — never
in code that ships to the browser.

## Project layout

```
src/
  app/
    (site)/            Public site: home, /apply, /report, /appeal, /faq, /account, /privacy
    admin/              Staff dashboard (auth-gated): /admin/dashboard, /admin/reports, /admin/appeals, /admin/staff
    api/
      applications/     POST — public application submission endpoint
      reports/          POST — report submission (requires Discord sign-in)
      appeals/          POST — ban appeal submission (requires Discord sign-in)
      account/          Community member session/logout
      admin/             Staff-only endpoints (list/view/update applications, reports, appeals, staff)
    auth/callback/       OAuth code exchange for community Discord sign-in
  components/           UI components (form steps, dashboard, site chrome)
  lib/
    config.ts            <-- central site configuration (start here to rebrand)
    supabase/             Supabase client factories (server / browser / admin / types)
    validation/           Zod schemas shared by client + server
    staffAuth.ts          Server-side staff session/authorization check (email+password accounts)
    userAuth.ts            Server-side community member session (Discord OAuth accounts)
    rateLimit.ts             DB-backed rate limiting
    turnstile.ts               Server-side CAPTCHA verification
    discord.ts                   Server-side Discord webhook integration
    profanity.ts                  Whole-word profanity filter used across all free-text fields
  proxy.ts                Route protection for /admin/*
supabase/migrations/
  0001_init.sql                        Applications, staff, rate-limit tables + RLS
  0002_reports_appeals.sql             Reports, ban appeals, their rate-limit tables + RLS
  0003_application_login_and_qol.sql   Ties applications to a Discord-authenticated applicant
  0004_claims_withdrawals_activity.sql Withdrawn status, staff claiming, activity_log
  0005_case_notes.sql                  Threaded staff notes (case_notes table)
```

## 1. Customise the site

Edit **`src/lib/config.ts`** — server name, tagline, accent color, requirements, application
question wording, contact email, Discord invite link, minimum age (optional), and the rate-limit
window. This is the only file you should need to touch for a rebrand.

## 2. Create the Supabase project

1. Go to [supabase.com](https://supabase.com/dashboard) and create a new project (pick a region
   close to your primary audience — Supabase's Postgres runs from a single region, but the
   Next.js app on Vercel's CDN will still be fast worldwide since page/API logic runs at the
   edge/region nearest each visitor and only the database round-trip is fixed-region).
2. Open **SQL Editor** in the Supabase dashboard and run every file in `supabase/migrations/`
   **in numeric order** (0001 through 0005). Together these create the `applications`, `reports`,
   `ban_appeals`, `staff_members`, `activity_log`, `case_notes`, and rate-limit tables, their
   enums, indexes, and Row Level Security policies.
3. Go to **Project Settings -> API** and copy:
   - **Project URL** -> `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key -> `SUPABASE_SERVICE_ROLE_KEY` (keep this secret — never commit it or
     put it in `NEXT_PUBLIC_*`)
4. Staff sign-in uses email + an admin-assigned password (no self-service signup, no magic
   link) — there's nothing to configure under Authentication for this to work.
5. **Enable Discord sign-in for community members** (needed for the Report and Ban Appeal pages):
   1. Go to the [Discord Developer Portal](https://discord.com/developers/applications) -> **New
      Application** (any name, e.g. "Server Portal Login").
   2. Under **OAuth2 -> General**, copy the **Client ID** and (click "Reset Secret" if needed)
      the **Client Secret**.
   3. In Supabase, go to **Authentication -> Sign In / Providers -> Discord**, toggle it on,
      paste the Client ID and Client Secret, and save. Supabase shows a **Callback URL** on that
      same screen (looks like `https://<project-ref>.supabase.co/auth/v1/callback`) — copy it.
   4. Back in the Discord Developer Portal, under **OAuth2 -> General -> Redirects**, add the
      callback URL you just copied, and save.
   This only affects the Report/Ban Appeal/Account pages — staff login is unrelated and doesn't
   need this.
6. **Create your own admin account.** There's a chicken-and-egg problem the first time: the
   "Manage Staff" page requires you to already be an admin. Bootstrap yourself once via the
   Supabase **SQL Editor** and the [Admin API](https://supabase.com/docs/reference/api/introduction)
   — easiest is to ask an AI coding assistant (or the person who built this) to run it for you
   using your `SUPABASE_SERVICE_ROLE_KEY`, since it's two API calls (create the auth user, then
   insert into `staff_members` with `role = 'admin'`). After that, sign in at `/admin/login` and
   use **Manage Staff** in the dashboard header to create every other staff account — it assigns
   the password for you, no further SQL needed.

   Only users with a row in `staff_members` can access `/admin/dashboard` — having a Supabase
   Auth login alone is not enough, and there's no page anywhere that lets someone create their
   own staff row.

## 3. Configure environment variables

Copy `.env.example` to `.env.local` for local development and fill in real values:

```bash
cp .env.example .env.local
```

Required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`, `IP_HASH_SECRET` (generate with `openssl rand -hex 32`).

Optional: `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY` (CAPTCHA — form works without
it, just without bot protection), `DISCORD_WEBHOOK_URL` (posts an embed to a staff channel on
each new application).

## 4. Run locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`. Submit a test application, then sign in at `/admin/login` with
the staff email you added above to review it. To test reports/appeals, visit `/report` or
`/appeal`, sign in with Discord, and submit — then review it at `/admin/reports` or
`/admin/appeals`.

## 5. Deploy to Vercel

1. Push this repository to GitHub (or GitLab/Bitbucket).
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Under **Environment Variables**, add every variable from `.env.example` with your real
   values (same names). Set `NEXT_PUBLIC_SITE_URL` to your production URL, e.g.
   `https://your-project.vercel.app` or your custom domain.
4. Deploy. Vercel builds and serves the app globally via its CDN/edge network, so it will work
   for visitors in Singapore, Australia, Hong Kong, the UK, US, Europe, etc. without extra
   configuration.
5. Use **Manage Staff** in the dashboard to create accounts for your production staff emails, if
   they differ from whoever you bootstrapped locally.

## Enabling optional features later

- **CAPTCHA (Cloudflare Turnstile):** create a widget at the [Turnstile
  dashboard](https://dash.cloudflare.com/?to=/:account/turnstile), set
  `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`, redeploy. The form automatically
  renders the widget and the API automatically enforces it once the secret is set — no code
  changes needed.
- **Discord webhook notifications:** in Discord, go to a staff channel's Settings ->
  Integrations -> Webhooks -> New Webhook, copy the URL into `DISCORD_WEBHOOK_URL`, redeploy.
  New applications, reports, and ban appeals will each post an `@everyone`-mention embed with a
  link into the staff dashboard. **Only point this at a private, staff-only channel** — the
  `@everyone` ping is intentional so nothing gets missed, but that means anyone with access to
  the target channel gets pinged, applicant/reporter data and all. See `src/lib/discord.ts` if
  you want to extend this (e.g. a bot token for DMs instead of
  a webhook) — all Discord credential handling is isolated to that one file.
- **Live member count on the homepage:** in Discord, go to **Server Settings -> Widget** and
  enable **Server Widget**. Then set `discordGuildId` in `src/lib/config.ts` to your server's ID
  (enable Developer Mode in Discord, right-click your server icon -> Copy Server ID). No token
  needed — this uses Discord's public widget API (`src/lib/discordWidget.ts`). Leave
  `discordGuildId` as `null` to hide this section entirely.
- **Installable on mobile:** `src/app/manifest.ts` already makes the site installable ("Add to
  Home Screen") using the existing logo as the icon — nothing to configure. This is a basic
  installable web app, not a full offline-capable PWA (no service worker/offline caching).

## Staff dashboard features

- **Pending-count badges** in the nav show how many applications/reports/appeals need attention
  at a glance.
- **Inline status changes** — change status directly from the list view (`InlineStatusSelect`),
  no need to open every item individually.
- **Claiming** — a staff member can claim an item (list view or detail page) so two people don't
  duplicate work; only the claimer or an admin can unclaim it. `/admin/my-claims` shows everything
  you personally have claimed.
- **Threaded staff notes** (`case_notes` table) — every note is its own timestamped, attributed
  entry instead of one text box that silently overwrites whenever someone else saves. The old
  single `staff_notes` column is preserved (unused) with existing notes carried forward as the
  first thread entry.
- **Activity History** — every status change, note, claim, and self-service withdrawal is logged
  to `activity_log`, shown per-item on each detail page and as a combined feed at
  `/admin/activity`. This is a full history, unlike "Last reviewed by" which only shows the most
  recent reviewer.
- **Bulk actions** — select multiple rows in a list view and change their status all at once
  (`/api/admin/*/bulk-status`).
- **Sortable columns** — click Applicant/Status/Submitted (etc.) column headers to sort; click
  again to reverse.
- **Stats** (`/admin/stats`) — status breakdowns and acceptance/resolution/approval rates across
  all three submission types.
- **CSV export** on each list view, respecting the current search/status filter.
- Toast notifications confirm saves/failures instead of inline banners.

## Applicant/member self-service

- Applicants, reporters, and appellants can **withdraw their own submission** from `/account`
  (only while it's still pending/reviewing — not after it's been decided).
- Configurable cooldowns in `src/lib/config.ts` (`applicationRules`) prevent immediately
  reapplying after a rejection or a self-withdrawal. Set either to `null` to disable.

## Site polish

- Themed 404 (`src/app/not-found.tsx`) and error boundary (`src/app/error.tsx`) pages instead of
  Next.js's generic defaults.
- A branded Open Graph image (`src/app/opengraph-image.tsx`, generated at build time) so links
  shared in Discord show a proper preview card.
- Report and Ban Appeal forms auto-save answers to sessionStorage as you type, same as the
  moderator application form — accidentally navigating away doesn't lose progress.

## Security notes

- Every data table (`applications`, `reports`, `ban_appeals`, `staff_members`, and the rate-limit
  tables) has Row Level Security enabled with **no** policies granting the public `anon` or
  `authenticated` role access. The browser never talks to these tables directly — all reads/writes
  go through Next.js API routes using the service role key, which lives only in server-side
  environment variables.
- `/admin/*` is protected twice: `src/proxy.ts` does an optimistic redirect for signed-out
  visitors, and every admin page/API route re-verifies both the Supabase session *and* staff
  table membership server-side (`src/lib/staffAuth.ts`) before returning any data.
- Community members signing in with Discord get a normal Supabase Auth session but **no**
  `staff_members` row — that session only ever proves "I am this Discord user," never "I can see
  the dashboard." Report/appeal API routes check ownership (`reporter_id`/`appellant_id` matches
  the caller) server-side before returning anything; there is no path from a Discord login to
  `/admin/*`.
- Submitted data is validated with the same Zod schema on the client (fast feedback) and again on
  the server before it ever reaches the database — client-side validation is never trusted alone.
  Every free-text field also runs through a whole-word profanity filter (`src/lib/profanity.ts`).
- IP addresses are never stored raw — only an HMAC-SHA256 hash (`IP_HASH_SECRET`), used solely to
  rate-limit repeat submissions.

## What you still need to provide

- Real values for every variable in `.env.example`.
- Your Discord server's invite link and contact email in `src/lib/config.ts`.
- **Run every migration through `0005_case_notes.sql`** if you haven't already — required, not
  optional, once this version of the code is deployed. Without 0003, `/apply` and `/account` will
  error; without 0004, claiming/withdrawing/Activity/Stats will error; without 0005, adding staff
  notes will error.
- Discord OAuth client ID/secret configured in Supabase (step 5 above) — without this, the
  "Sign in with Discord" button on `/apply`, `/report`, `/appeal`, and `/account` will fail.
- At least one `staff_members` row (step 6 above) before anyone can use the dashboard.
- Optional: a Turnstile site/secret key pair and/or a Discord webhook URL if you want those
  features active — the app runs correctly without them, just without CAPTCHA and without
  Discord notifications.
