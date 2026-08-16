-- Ties applications to a Discord-authenticated submitter (applications now
-- require sign-in, same as reports/appeals). Existing rows predate this and
-- are grandfathered in with a null applicant_id.

alter table applications
  add column applicant_id uuid references auth.users (id) on delete set null;

create index applications_applicant_id_idx on applications (applicant_id);
