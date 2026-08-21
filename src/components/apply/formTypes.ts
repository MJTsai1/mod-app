export interface ApplicationFormValues {
  age: string;
  country: string;
  timezone: string;
  timeInServer: string;
  activityLevel: string;
  onlineTimes: string;
  weeklyHours: string;
  hasModeratedBefore: boolean;
  previousExperience: string;
  botsToolsUsed: string;
  previousStaffPositions: string;
  scenarioUnawareRules: string;
  scenarioToxicConflict: string;
  scenarioFriendBreaksRule: string;
  scenarioStaffAbuse: string;
  scenarioBiasedReport: string;
  motivationWhy: string;
  motivationSuitable: string;
  motivationGoodModerator: string;
  motivationImproveServer: string;
  additionalInfo: string;
  confirmedAccurate: boolean;
}

export const emptyApplicationFormValues: ApplicationFormValues = {
  age: "",
  country: "",
  timezone: "",
  timeInServer: "",
  activityLevel: "",
  onlineTimes: "",
  weeklyHours: "",
  hasModeratedBefore: false,
  previousExperience: "",
  botsToolsUsed: "",
  previousStaffPositions: "",
  scenarioUnawareRules: "",
  scenarioToxicConflict: "",
  scenarioFriendBreaksRule: "",
  scenarioStaffAbuse: "",
  scenarioBiasedReport: "",
  motivationWhy: "",
  motivationSuitable: "",
  motivationGoodModerator: "",
  motivationImproveServer: "",
  additionalInfo: "",
  confirmedAccurate: false,
};

export type FormErrors = Partial<Record<keyof ApplicationFormValues, string>>;

export const DRAFT_STORAGE_KEY = "mod-app-application-draft-v2";

/** The joke "nobody lives here" UTC-12 entry in the timezone dropdown — not a selectable answer. */
export const UNINHABITED_TIMEZONE = "Etc/GMT+12";
