/**
 * Hand-written types matching supabase/migrations/0001_init.sql.
 *
 * If you evolve the schema, regenerate this with the Supabase CLI instead:
 *   supabase gen types typescript --project-id <ref> > src/lib/supabase/types.ts
 */

export type ApplicationStatus =
  | "pending"
  | "reviewing"
  | "accepted"
  | "rejected"
  | "withdrawn";

export type ApplicationRow = {
  id: string;
  reference_code: string;
  created_at: string;
  updated_at: string;
  applicant_id: string | null;
  discord_username: string;
  discord_user_id: string;
  age: number;
  country: string;
  timezone: string;
  time_in_server: string;
  activity_level: string;
  online_times: string;
  weekly_hours: number;
  has_moderated_before: boolean;
  previous_experience: string | null;
  bots_tools_used: string | null;
  previous_staff_positions: string | null;
  scenario_unaware_rules: string;
  scenario_toxic_conflict: string;
  scenario_friend_breaks_rule: string;
  scenario_staff_abuse: string;
  scenario_biased_report: string;
  motivation_why: string;
  motivation_suitable: string;
  motivation_good_moderator: string;
  motivation_improve_server: string;
  additional_info: string | null;
  confirmed_accurate: boolean;
  status: ApplicationStatus;
  staff_notes: string | null;
  last_updated_by: string | null;
  submitted_ip_hash: string | null;
  claimed_by: string | null;
  claimed_at: string | null;
};

export type ApplicationInsert = Omit<
  ApplicationRow,
  | "id"
  | "created_at"
  | "updated_at"
  | "status"
  | "staff_notes"
  | "last_updated_by"
  | "claimed_by"
  | "claimed_at"
> & {
  id?: string;
  status?: ApplicationStatus;
  staff_notes?: string | null;
  last_updated_by?: string | null;
};

export type ApplicationUpdate = Partial<
  Pick<ApplicationRow, "status" | "staff_notes" | "last_updated_by" | "claimed_by" | "claimed_at">
>;

export type ApplicationListItem = Pick<
  ApplicationRow,
  | "id"
  | "reference_code"
  | "created_at"
  | "updated_at"
  | "discord_username"
  | "discord_user_id"
  | "status"
  | "age"
  | "country"
  | "claimed_by"
>;

export type StaffMemberRow = {
  id: string;
  email: string;
  display_name: string | null;
  role: "staff" | "admin";
  created_at: string;
};

export type ApplicationSubmissionAttemptRow = {
  id: number;
  ip_hash: string;
  created_at: string;
};

export type ReportStatus = "pending" | "reviewing" | "resolved" | "dismissed" | "withdrawn";

export type ReportCategory =
  | "harassment"
  | "spam"
  | "cheating_exploiting"
  | "inappropriate_content"
  | "impersonation"
  | "other";

export type ReportRow = {
  id: string;
  reference_code: string;
  created_at: string;
  updated_at: string;
  reporter_id: string;
  reporter_discord_username: string;
  reported_discord_username: string;
  reported_discord_user_id: string | null;
  category: ReportCategory;
  description: string;
  evidence_links: string | null;
  status: ReportStatus;
  staff_notes: string | null;
  last_updated_by: string | null;
  submitted_ip_hash: string | null;
  claimed_by: string | null;
  claimed_at: string | null;
};

export type ReportInsert = Omit<
  ReportRow,
  | "id"
  | "created_at"
  | "updated_at"
  | "status"
  | "staff_notes"
  | "last_updated_by"
  | "claimed_by"
  | "claimed_at"
> & {
  id?: string;
  status?: ReportStatus;
  staff_notes?: string | null;
  last_updated_by?: string | null;
};

export type ReportUpdate = Partial<
  Pick<ReportRow, "status" | "staff_notes" | "last_updated_by" | "claimed_by" | "claimed_at">
>;

export type ReportListItem = Pick<
  ReportRow,
  | "id"
  | "reference_code"
  | "created_at"
  | "reporter_discord_username"
  | "reported_discord_username"
  | "category"
  | "status"
  | "claimed_by"
>;

export type AppealStatus = "pending" | "reviewing" | "approved" | "denied" | "withdrawn";

export type BanAppealRow = {
  id: string;
  reference_code: string;
  created_at: string;
  updated_at: string;
  appellant_id: string;
  discord_username: string;
  discord_user_id: string;
  ban_reason: string | null;
  appeal_reason: string;
  additional_info: string | null;
  status: AppealStatus;
  staff_notes: string | null;
  last_updated_by: string | null;
  submitted_ip_hash: string | null;
  claimed_by: string | null;
  claimed_at: string | null;
};

export type BanAppealInsert = Omit<
  BanAppealRow,
  | "id"
  | "created_at"
  | "updated_at"
  | "status"
  | "staff_notes"
  | "last_updated_by"
  | "claimed_by"
  | "claimed_at"
> & {
  id?: string;
  status?: AppealStatus;
  staff_notes?: string | null;
  last_updated_by?: string | null;
};

export type BanAppealUpdate = Partial<
  Pick<BanAppealRow, "status" | "staff_notes" | "last_updated_by" | "claimed_by" | "claimed_at">
>;

export type BanAppealListItem = Pick<
  BanAppealRow,
  | "id"
  | "reference_code"
  | "created_at"
  | "discord_username"
  | "discord_user_id"
  | "status"
  | "claimed_by"
>;

export type ReportSubmissionAttemptRow = {
  id: number;
  ip_hash: string;
  created_at: string;
};

export type AppealSubmissionAttemptRow = {
  id: number;
  ip_hash: string;
  created_at: string;
};

export type ActivityEntityType = "application" | "report" | "appeal";
export type ActivityActorType = "staff" | "applicant";

export type ActivityLogRow = {
  id: number;
  entity_type: ActivityEntityType;
  entity_id: string;
  actor_type: ActivityActorType;
  staff_id: string | null;
  detail: string;
  created_at: string;
};

export type ActivityLogInsert = Pick<
  ActivityLogRow,
  "entity_type" | "entity_id" | "actor_type" | "detail"
> & {
  staff_id?: string | null;
};

export type CaseNoteRow = {
  id: number;
  entity_type: ActivityEntityType;
  entity_id: string;
  staff_id: string | null;
  note: string;
  created_at: string;
};

export type CaseNoteInsert = Pick<CaseNoteRow, "entity_type" | "entity_id" | "note"> & {
  staff_id?: string | null;
};

export type AiReportRow = {
  id: number;
  entity_type: "application";
  entity_id: string;
  requested_by: string | null;
  model: string;
  summary: string;
  answer_quality: string;
  strengths: string[];
  concerns: string[];
  consistency_notes: string;
  history_notes: string;
  created_at: string;
};

export type AiReportInsert = Omit<AiReportRow, "id" | "created_at" | "entity_type"> & {
  entity_type?: "application";
};

export type Database = {
  public: {
    Tables: {
      applications: {
        Row: ApplicationRow;
        Insert: ApplicationInsert;
        Update: ApplicationUpdate;
        Relationships: [];
      };
      staff_members: {
        Row: StaffMemberRow;
        Insert: Partial<StaffMemberRow> & Pick<StaffMemberRow, "id" | "email">;
        Update: Partial<StaffMemberRow>;
        Relationships: [];
      };
      application_submission_attempts: {
        Row: ApplicationSubmissionAttemptRow;
        Insert: Pick<ApplicationSubmissionAttemptRow, "ip_hash">;
        Update: Partial<ApplicationSubmissionAttemptRow>;
        Relationships: [];
      };
      reports: {
        Row: ReportRow;
        Insert: ReportInsert;
        Update: ReportUpdate;
        Relationships: [];
      };
      ban_appeals: {
        Row: BanAppealRow;
        Insert: BanAppealInsert;
        Update: BanAppealUpdate;
        Relationships: [];
      };
      report_submission_attempts: {
        Row: ReportSubmissionAttemptRow;
        Insert: Pick<ReportSubmissionAttemptRow, "ip_hash">;
        Update: Partial<ReportSubmissionAttemptRow>;
        Relationships: [];
      };
      appeal_submission_attempts: {
        Row: AppealSubmissionAttemptRow;
        Insert: Pick<AppealSubmissionAttemptRow, "ip_hash">;
        Update: Partial<AppealSubmissionAttemptRow>;
        Relationships: [];
      };
      activity_log: {
        Row: ActivityLogRow;
        Insert: ActivityLogInsert;
        Update: Partial<ActivityLogRow>;
        Relationships: [];
      };
      case_notes: {
        Row: CaseNoteRow;
        Insert: CaseNoteInsert;
        Update: Partial<CaseNoteRow>;
        Relationships: [];
      };
      ai_reports: {
        Row: AiReportRow;
        Insert: AiReportInsert;
        Update: Partial<AiReportRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
