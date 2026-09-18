export const SECTIONS = ["applications", "reports", "appeals", "support"] as const;
export type Section = (typeof SECTIONS)[number];

export const SECTION_LABELS: Record<Section, string> = {
  applications: "Applications",
  reports: "Reports",
  appeals: "Ban Appeals",
  support: "Support",
};

/** Admins implicitly have access to every section; staff are limited to their assigned ones. */
export function hasSection(staff: { role: string; sections?: string[] | null }, section: Section): boolean {
  if (staff.role === "admin") return true;
  return (staff.sections ?? []).includes(section);
}
