-- Moderator Application System — initial schema
-- Run this in the Supabase SQL Editor (or via `supabase db push`) on a fresh project.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type application_status as enum (
  'pending',
  'reviewing',
  'accepted',
  'rejected',
  'withdrawn'
);

-- ---------------------------------------------------------------------------
-- Staff members
-- One row per authorised staff account. Rows must be inserted manually by an
-- existing administrator (via the SQL editor or the Supabase dashboard) after
-- the corresponding user has signed up through Supabase Auth. There is no
-- public self-signup path onto this table.
-- ---------------------------------------------------------------------------

create table staff_members (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text,
  role text not null default 'staff' check (role in ('staff', 'admin')),
  created_at timestamptz not null default now()
);

comment on table staff_members is
  'Authorised dashboard staff. A user must have a row here (added manually by an admin) to access /admin.';

-- ---------------------------------------------------------------------------
-- Applications
-- ---------------------------------------------------------------------------

create table applications (
  id uuid primary key default gen_random_uuid(),
  reference_code text not null unique,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Step 1 — basic information
  discord_username text not null check (char_length(discord_username) between 2 and 32),
  discord_user_id text not null check (discord_user_id ~ '^\d{15,25}$'),
  age integer not null check (age > 0 and age < 120),
  country text not null check (char_length(country) between 1 and 80),
  timezone text not null check (char_length(timezone) between 1 and 60),
  time_in_server text not null check (char_length(time_in_server) between 1 and 120),

  -- Step 2 — activity
  activity_level text not null check (char_length(activity_level) between 1 and 120),
  online_times text not null check (char_length(online_times) between 1 and 200),
  weekly_hours numeric(5, 1) not null check (weekly_hours >= 0 and weekly_hours <= 168),

  -- Step 3 — experience
  has_moderated_before boolean not null default false,
  previous_experience text check (char_length(previous_experience) <= 2000),
  bots_tools_used text check (char_length(bots_tools_used) <= 500),
  previous_staff_positions text check (char_length(previous_staff_positions) <= 1000),

  -- Step 4 — scenarios
  scenario_unaware_rules text not null check (char_length(scenario_unaware_rules) <= 2000),
  scenario_toxic_conflict text not null check (char_length(scenario_toxic_conflict) <= 2000),
  scenario_friend_breaks_rule text not null check (char_length(scenario_friend_breaks_rule) <= 2000),
  scenario_staff_abuse text not null check (char_length(scenario_staff_abuse) <= 2000),
  scenario_biased_report text not null check (char_length(scenario_biased_report) <= 2000),

  -- Step 5 — motivation
  motivation_why text not null check (char_length(motivation_why) <= 2000),
  motivation_suitable text not null check (char_length(motivation_suitable) <= 2000),
  motivation_good_moderator text not null check (char_length(motivation_good_moderator) <= 2000),
  motivation_improve_server text not null check (char_length(motivation_improve_server) <= 2000),
  additional_info text check (char_length(additional_info) <= 2000),
  confirmed_accurate boolean not null default false,

  -- Review / staff workflow
  status application_status not null default 'pending',
  staff_notes text check (char_length(staff_notes) <= 5000),
  last_updated_by uuid references staff_members (id) on delete set null,

  -- Abuse tracking (hashed, never the raw IP — see src/lib/rateLimit.ts)
  submitted_ip_hash text,

  constraint confirmed_accurate_must_be_true check (confirmed_accurate = true)
);

comment on table applications is
  'Moderator applications. Only accessible via the service role from server-side API routes — RLS grants no direct access.';
comment on column applications.reference_code is
  'Human-friendly ID shown to the applicant, e.g. MOD-2026-AB12CD.';
comment on column applications.submitted_ip_hash is
  'HMAC-SHA256 of the submitter IP + server pepper. Used only for rate limiting/abuse review, never the raw IP.';

create index applications_status_idx on applications (status);
create index applications_created_at_idx on applications (created_at desc);
create index applications_discord_user_id_idx on applications (discord_user_id);
create index applications_reference_code_idx on applications (reference_code);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger applications_set_updated_at
  before update on applications
  for each row
  execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Abuse / rate limiting
-- A lightweight append-only log the API checks before accepting a new
-- submission. Kept separate from `applications` so failed/blocked attempts
-- never pollute application data.
-- ---------------------------------------------------------------------------

create table application_submission_attempts (
  id bigserial primary key,
  ip_hash text not null,
  created_at timestamptz not null default now()
);

create index application_submission_attempts_ip_created_idx
  on application_submission_attempts (ip_hash, created_at desc);

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- The web app never talks to Postgres with the anon key for `applications`,
-- `staff_members`, or `application_submission_attempts` — every read/write
-- goes through Next.js server-side API routes using the service role key,
-- which bypasses RLS entirely. Enabling RLS here with zero permissive
-- policies for `anon`/`authenticated` is defense in depth: even if the anon
-- key leaked or a bug called Supabase directly from the browser, no rows
-- would be readable or writable.
-- ---------------------------------------------------------------------------

alter table applications enable row level security;
alter table application_submission_attempts enable row level security;
alter table staff_members enable row level security;

-- Staff may read their own membership row (used to render role info in the
-- dashboard UI). All other access to staff_members happens via service role.
create policy "staff can read own row"
  on staff_members
  for select
  to authenticated
  using (auth.uid() = id);

-- No insert/update/delete policies on staff_members: staff accounts are
-- provisioned manually by an administrator via the SQL editor.
