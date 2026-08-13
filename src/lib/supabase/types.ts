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
};

export type ApplicationInsert = Omit<
  ApplicationRow,
  "id" | "created_at" | "updated_at" | "status" | "staff_notes" | "last_updated_by"
> & {
  id?: string;
  status?: ApplicationStatus;
  staff_notes?: string | null;
  last_updated_by?: string | null;
};

export type ApplicationUpdate = Partial<
  Pick<ApplicationRow, "status" | "staff_notes" | "last_updated_by">
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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
