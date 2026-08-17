-- Replaces the single overwritable staff_notes column with a proper thread
-- of timestamped notes, so nothing gets silently lost when more than one
-- staff member is working the same case. Run after 0004.

create table case_notes (
  id bigserial primary key,
  entity_type text not null check (entity_type in ('application', 'report', 'appeal')),
  entity_id uuid not null,
  staff_id uuid references staff_members (id) on delete set null,
  note text not null check (char_length(note) between 1 and 5000),
  created_at timestamptz not null default now()
);

comment on table case_notes is
  'Threaded staff notes per application/report/appeal. Replaces the single staff_notes column (kept in place, unused going forward, for historical reference). Only accessible via the service role from server-side routes.';

create index case_notes_entity_idx on case_notes (entity_type, entity_id, created_at desc);

alter table case_notes enable row level security;
-- No permissive policies — same defense-in-depth posture as every other
-- table here. All access goes through staff-authorized server routes using
-- the service role key.

-- Backfill: carry any existing single staff_notes value forward as the
-- first note in each thread, attributed to whoever last touched the item.
insert into case_notes (entity_type, entity_id, staff_id, note, created_at)
select 'application', id, last_updated_by, staff_notes, updated_at
from applications
where staff_notes is not null and char_length(trim(staff_notes)) > 0;

insert into case_notes (entity_type, entity_id, staff_id, note, created_at)
select 'report', id, last_updated_by, staff_notes, updated_at
from reports
where staff_notes is not null and char_length(trim(staff_notes)) > 0;

insert into case_notes (entity_type, entity_id, staff_id, note, created_at)
select 'appeal', id, last_updated_by, staff_notes, updated_at
from ban_appeals
where staff_notes is not null and char_length(trim(staff_notes)) > 0;
