-- Allows activity_log entries authored by automated system processes (the
-- nudge cron, see src/app/api/cron/nudge/route.ts), distinct from staff and
-- applicant actions. Run after 0009.

alter table activity_log drop constraint activity_log_actor_type_check;
alter table activity_log add constraint activity_log_actor_type_check
  check (actor_type in ('staff', 'applicant', 'system'));
