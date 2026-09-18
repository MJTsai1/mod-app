-- Granular per-section staff permissions. Admins are unaffected (they
-- always have full access, enforced in application code); this only
-- restricts non-admin "staff" accounts to specific sections. Existing
-- staff default to all four sections so nobody loses access on deploy.
alter table staff_members
  add column sections text[] not null default '{applications,reports,appeals,support}';

comment on column staff_members.sections is
  'Sections this staff member can access (applications/reports/appeals/support). Ignored for role = admin, who always have full access.';
