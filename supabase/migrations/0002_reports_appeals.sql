-- Member reports and ban appeals — adds two new submission types alongside
-- moderator applications. Run this after 0001_init.sql.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type report_status as enum (
  'pending',
  'reviewing',
  'resolved',
  'dismissed'
);

create type appeal_status as enum (
  'pending',
  'reviewing',
  'approved',
  'denied'
);

-- ---------------------------------------------------------------------------
-- Reports
-- Submitted by a Discord-authenticated community member against another
-- member. reporter_id ties the row to the submitter's Supabase Auth account
-- so they can look up their own submission status (via a server route that
-- checks auth.uid() — see src/app/(site)/account/page.tsx) without RLS
-- granting any direct table access.
-- ---------------------------------------------------------------------------

create table reports (
  id uuid primary key default gen_random_uuid(),
  reference_code text not null unique,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  reporter_id uuid not null references auth.users (id) on delete cascade,
  reporter_discord_username text not null check (char_length(reporter_discord_username) between 2 and 32),

  reported_discord_username text not null check (char_length(reported_discord_username) between 2 and 100),
  reported_discord_user_id text check (reported_discord_user_id ~ '^\d{15,25}$'),

  category text not null check (
    category in ('harassment', 'spam', 'cheating_exploiting', 'inappropriate_content', 'impersonation', 'other')
  ),
  description text not null check (char_length(description) between 10 and 3000),
  evidence_links text check (char_length(evidence_links) <= 1000),

  status report_status not null default 'pending',
  staff_notes text check (char_length(staff_notes) <= 5000),
  last_updated_by uuid references staff_members (id) on delete set null,

  submitted_ip_hash text
);

comment on table reports is
  'Reports filed by community members against another member. Only accessible via the service role from server-side API routes — RLS grants no direct access.';

create index reports_status_idx on reports (status);
create index reports_created_at_idx on reports (created_at desc);
create index reports_reporter_id_idx on reports (reporter_id);
create index reports_reference_code_idx on reports (reference_code);

create trigger reports_set_updated_at
  before update on reports
  for each row
  execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Ban appeals
-- ---------------------------------------------------------------------------

create table ban_appeals (
  id uuid primary key default gen_random_uuid(),
  reference_code text not null unique,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  appellant_id uuid not null references auth.users (id) on delete cascade,
  discord_username text not null check (char_length(discord_username) between 2 and 32),
  discord_user_id text not null check (discord_user_id ~ '^\d{15,25}$'),

  ban_reason text check (char_length(ban_reason) <= 1000),
  appeal_reason text not null check (char_length(appeal_reason) between 20 and 3000),
  additional_info text check (char_length(additional_info) <= 2000),

  status appeal_status not null default 'pending',
  staff_notes text check (char_length(staff_notes) <= 5000),
  last_updated_by uuid references staff_members (id) on delete set null,

  submitted_ip_hash text
);

comment on table ban_appeals is
  'Ban appeals filed by community members. Only accessible via the service role from server-side API routes — RLS grants no direct access.';

create index ban_appeals_status_idx on ban_appeals (status);
create index ban_appeals_created_at_idx on ban_appeals (created_at desc);
create index ban_appeals_appellant_id_idx on ban_appeals (appellant_id);
create index ban_appeals_reference_code_idx on ban_appeals (reference_code);

create trigger ban_appeals_set_updated_at
  before update on ban_appeals
  for each row
  execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Abuse / rate limiting (mirrors application_submission_attempts)
-- ---------------------------------------------------------------------------

create table report_submission_attempts (
  id bigserial primary key,
  ip_hash text not null,
  created_at timestamptz not null default now()
);

create index report_submission_attempts_ip_created_idx
  on report_submission_attempts (ip_hash, created_at desc);

create table appeal_submission_attempts (
  id bigserial primary key,
  ip_hash text not null,
  created_at timestamptz not null default now()
);

create index appeal_submission_attempts_ip_created_idx
  on appeal_submission_attempts (ip_hash, created_at desc);

-- ---------------------------------------------------------------------------
-- Row Level Security — same defense-in-depth posture as applications: RLS
-- enabled with zero permissive policies. Every read/write goes through
-- Next.js server-side routes using the service role key, which already
-- verifies the caller is the row's owner (for community members) or staff
-- (for the dashboard) before touching these tables.
-- ---------------------------------------------------------------------------

alter table reports enable row level security;
alter table ban_appeals enable row level security;
alter table report_submission_attempts enable row level security;
alter table appeal_submission_attempts enable row level security;
