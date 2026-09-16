-- General member support requests, answered by staff as a two-way message
-- thread. Distinct from Reports (requires a reported member) and Appeals
-- (requires a ban) — this is for anything else a member needs to ask staff
-- directly. Run after 0008.

create type support_status as enum (
  'open',
  'answered',
  'resolved',
  'withdrawn'
);

create table support_requests (
  id uuid primary key default gen_random_uuid(),
  reference_code text not null unique,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  requester_id uuid not null references auth.users (id) on delete cascade,
  discord_username text not null check (char_length(discord_username) between 2 and 32),

  subject text not null check (char_length(subject) between 3 and 150),
  message text not null check (char_length(message) between 10 and 3000),

  status support_status not null default 'open',
  last_updated_by uuid references staff_members (id) on delete set null,

  claimed_by uuid references staff_members (id) on delete set null,
  claimed_at timestamptz,

  submitted_ip_hash text
);

comment on table support_requests is
  'General support requests from community members. Only accessible via the service role from server-side API routes — RLS grants no direct access.';

create index support_requests_status_idx on support_requests (status);
create index support_requests_created_at_idx on support_requests (created_at desc);
create index support_requests_requester_id_idx on support_requests (requester_id);
create index support_requests_reference_code_idx on support_requests (reference_code);

create trigger support_requests_set_updated_at
  before update on support_requests
  for each row
  execute function set_updated_at();

-- Abuse / rate limiting (mirrors report_submission_attempts)
create table support_request_submission_attempts (
  id bigserial primary key,
  ip_hash text not null,
  created_at timestamptz not null default now()
);

create index support_request_submission_attempts_ip_created_idx
  on support_request_submission_attempts (ip_hash, created_at desc);

-- Two-way message thread, visible to both the requester and staff — same
-- shape as application_followups (0008), reusing 'applicant' as the generic
-- non-staff author type for consistency with the rest of the app.
create table support_messages (
  id bigserial primary key,
  support_request_id uuid not null references support_requests (id) on delete cascade,
  author_type text not null check (author_type in ('staff', 'applicant')),
  staff_id uuid references staff_members (id) on delete set null,
  message text not null check (char_length(message) between 1 and 3000),
  created_at timestamptz not null default now()
);

create index support_messages_request_idx on support_messages (support_request_id, created_at);

alter table support_requests enable row level security;
alter table support_request_submission_attempts enable row level security;
alter table support_messages enable row level security;
-- No permissive policies — same defense-in-depth posture as every other
-- table here. All access goes through server routes that check either staff
-- auth or requester ownership, using the service role key.

-- Widen activity_log/case_notes to accept the new 'support' entity type.
-- These constraints were created unnamed in 0004/0005, so Postgres assigned
-- the default "<table>_<column>_check" name.
alter table activity_log drop constraint activity_log_entity_type_check;
alter table activity_log add constraint activity_log_entity_type_check
  check (entity_type in ('application', 'report', 'appeal', 'support'));

alter table case_notes drop constraint case_notes_entity_type_check;
alter table case_notes add constraint case_notes_entity_type_check
  check (entity_type in ('application', 'report', 'appeal', 'support'));
