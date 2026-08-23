-- Lets staff request more info from an applicant and the applicant reply, as
-- a message thread visible to both sides — separate from case_notes (which
-- stays staff-only) so there's no chance of an internal note leaking to the
-- applicant. Run after 0007.

alter type application_status add value if not exists 'needs_info';

create table application_followups (
  id bigserial primary key,
  application_id uuid not null references applications (id) on delete cascade,
  author_type text not null check (author_type in ('staff', 'applicant')),
  staff_id uuid references staff_members (id) on delete set null,
  message text not null check (char_length(message) between 1 and 3000),
  created_at timestamptz not null default now()
);

comment on table application_followups is
  'Applicant-visible message thread for an application (staff requesting more info, applicant replying). Distinct from the staff-only case_notes table. Only accessible via the service role from server-side routes.';

create index application_followups_application_idx on application_followups (application_id, created_at);

alter table application_followups enable row level security;
-- No permissive policies — same defense-in-depth posture as every other
-- table here. All access goes through server routes that check either staff
-- auth or applicant ownership of the application, using the service role key.
