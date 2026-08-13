# Moderator Application Website

A production-ready moderator application system for a Discord community: a public multi-step
application form, a Postgres database (Supabase), and an authenticated staff dashboard — built
with Next.js (App Router) + TypeScript, deployed to Vercel.

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
    (site)/            Public marketing site: home, /apply, /apply/success, /privacy
    admin/              Staff dashboard (auth-gated): /admin/login, /admin/dashboard, /admin/dashboard/[id]
    api/
      applications/     POST — public application submission endpoint
      admin/             Staff-only endpoints (list/view/update applications)
    auth/callback/       Supabase magic-link callback
  components/           UI components (form steps, dashboard, site chrome)
  lib/
    config.ts            <-- central site configuration (start here to rebrand)
    supabase/             Supabase client factories (server / browser / admin / types)
    validation/           Zod schemas shared by client + server
    staffAuth.ts          Server-side staff session/authorization check
    rateLimit.ts           DB-backed rate limiting
    turnstile.ts            Server-side CAPTCHA verification
    discord.ts               Server-side Discord webhook integration
  proxy.ts                Route protection for /admin/*
supabase/migrations/0001_init.sql   Full database schema + RLS policies
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
2. Open **SQL Editor** in the Supabase dashboard, paste the contents of
   [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql), and run it. This
   creates the `applications`, `staff_members`, and `application_submission_attempts` tables,
   the `application_status` enum, indexes, and Row Level Security policies.
3. Go to **Project Settings -> API** and copy:
   - **Project URL** -> `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key -> `SUPABASE_SERVICE_ROLE_KEY` (keep this secret — never commit it or
     put it in `NEXT_PUBLIC_*`)
4. Staff sign-in uses email + an admin-assigned password (no self-service signup, no magic
   link) — there's nothing to configure under Authentication for this to work.
5. **Create your own admin account.** There's a chicken-and-egg problem the first time: the
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
the staff email you added above to review it.

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
  New applications will post an embed with the applicant's username, Discord ID, and reference
  code. See `src/lib/discord.ts` if you want to extend this (e.g. a bot token for DMs instead of
  a webhook) — all Discord credential handling is isolated to that one file.

## Security notes

- The `applications`, `staff_members`, and `application_submission_attempts` tables have Row
  Level Security enabled with **no** policies granting the public `anon` role access. The
  browser never talks to these tables directly — all reads/writes go through Next.js API routes
  using the service role key, which lives only in server-side environment variables.
- `/admin/*` is protected twice: `src/proxy.ts` does an optimistic redirect for signed-out
  visitors, and every admin page/API route re-verifies both the Supabase session *and* staff
  table membership server-side (`src/lib/staffAuth.ts`) before returning any data.
- Submitted data is validated with the same Zod schema on the client (fast feedback) and again
  on the server (`src/app/api/applications/route.ts`) before it ever reaches the database —
  client-side validation is never trusted alone.
- IP addresses are never stored raw — only an HMAC-SHA256 hash (`IP_HASH_SECRET`), used solely to
  rate-limit repeat submissions.

## What you still need to provide

- Real values for every variable in `.env.example`.
- Your Discord server's invite link and contact email in `src/lib/config.ts`.
- At least one `staff_members` row (step 5 above) before anyone can use the dashboard.
- Optional: a Turnstile site/secret key pair and/or a Discord webhook URL if you want those
  features active — the app runs correctly without them, just without CAPTCHA and without
  Discord notifications.
