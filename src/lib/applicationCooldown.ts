import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { siteConfig } from "@/lib/config";

export interface CooldownResult {
  blocked: boolean;
  message?: string;
}

/**
 * Blocks a new application if the applicant's most recent rejected/withdrawn
 * application is still within the configured cooldown window. Either
 * cooldown can be disabled by setting it to null in siteConfig.
 */
export async function checkApplicationCooldown(applicantId: string): Promise<CooldownResult> {
  const { reapplyCooldownDays, withdrawCooldownHours } = siteConfig.applicationRules;
  if (reapplyCooldownDays === null && withdrawCooldownHours === null) {
    return { blocked: false };
  }

  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("applications")
    .select("status, updated_at")
    .eq("applicant_id", applicantId)
    .in("status", ["rejected", "withdrawn"])
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return { blocked: false };

  const updatedAt = new Date(data.updated_at).getTime();
  const now = Date.now();

  if (data.status === "rejected" && reapplyCooldownDays !== null) {
    const availableAt = updatedAt + reapplyCooldownDays * 24 * 60 * 60 * 1000;
    if (now < availableAt) {
      return {
        blocked: true,
        message: `Your last application was rejected. You can apply again on ${new Date(
          availableAt
        ).toLocaleDateString()}.`,
      };
    }
  }

  if (data.status === "withdrawn" && withdrawCooldownHours !== null) {
    const availableAt = updatedAt + withdrawCooldownHours * 60 * 60 * 1000;
    if (now < availableAt) {
      return {
        blocked: true,
        message: `You withdrew your last application recently. You can apply again after ${new Date(
          availableAt
        ).toLocaleString()}.`,
      };
    }
  }

  return { blocked: false };
}
