-- AI-generated application analysis reports, generated on-demand by staff.
-- Stored so a report doesn't need to be regenerated (and re-billed) every
-- time the application page is opened.

create table if not exists public.ai_reports (
  id bigint generated always as identity primary key,
  entity_type text not null default 'application' check (entity_type = 'application'),
  entity_id uuid not null references public.applications(id) on delete cascade,
  requested_by uuid references public.staff_members(id) on delete set null,
  model text not null,
  summary text not null,
  answer_quality text not null,
  strengths text[] not null default '{}',
  concerns text[] not null default '{}',
  consistency_notes text not null default '',
  history_notes text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists ai_reports_entity_idx
  on public.ai_reports (entity_type, entity_id, created_at desc);

alter table public.ai_reports enable row level security;
-- No permissive policies: like every other table here, all access goes
-- through server routes using the service-role key (see src/lib/aiReport.ts).
