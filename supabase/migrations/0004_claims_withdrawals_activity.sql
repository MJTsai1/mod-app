-- Adds: withdrawn status for reports/appeals (applications already have it),
-- staff "claim" tracking, and a cross-entity activity log. Run after 0003.

-- ---------------------------------------------------------------------------
-- Withdrawn status for reports and ban appeals
-- ---------------------------------------------------------------------------

alter type report_status add value 'withdrawn';
alter type appeal_status add value 'withdrawn';

-- ---------------------------------------------------------------------------
-- Staff claiming — lets one staff member mark an item as theirs so two
-- people don't duplicate work reviewing the same submission.
-- ---------------------------------------------------------------------------

alter table applications
  add column claimed_by uuid references staff_members (id) on delete set null,
  add column claimed_at timestamptz;

alter table reports
  add column claimed_by uuid references staff_members (id) on delete set null,
  add column claimed_at timestamptz;

alter table ban_appeals
  add column claimed_by uuid references staff_members (id) on delete set null,
  add column claimed_at timestamptz;

-- ---------------------------------------------------------------------------
-- Activity log — full history of status changes, note edits, claims, and
-- self-service withdrawals across all three submission types. Distinct from
-- last_updated_by, which only ever shows the most recent reviewer.
-- ---------------------------------------------------------------------------

create table activity_log (
  id bigserial primary key,
  entity_type text not null check (entity_type in ('application', 'report', 'appeal')),
  entity_id uuid not null,
  actor_type text not null check (actor_type in ('staff', 'applicant')),
  staff_id uuid references staff_members (id) on delete set null,
  detail text not null check (char_length(detail) <= 500),
  created_at timestamptz not null default now()
);

comment on table activity_log is
  'Append-only history of changes to applications/reports/ban_appeals. Only accessible via the service role from server-side routes.';

create index activity_log_entity_idx on activity_log (entity_type, entity_id, created_at desc);
create index activity_log_created_at_idx on activity_log (created_at desc);

alter table activity_log enable row level security;
-- No permissive policies — same defense-in-depth posture as every other
-- table here. All access goes through staff-authorized server routes using
-- the service role key.
