import "server-only";
import crypto from "node:crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { siteConfig } from "@/lib/config";

/** Hashes an IP address with a server-only pepper. Never store or log raw IPs. */
export function hashIp(ip: string): string {
  const pepper = process.env.IP_HASH_SECRET;
  if (!pepper) {
    throw new Error("Missing IP_HASH_SECRET environment variable.");
  }
  return crypto.createHmac("sha256", pepper).update(ip).digest("hex");
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterMinutes?: number;
}

/**
 * Database-backed sliding-window rate limit, safe across multiple serverless
 * instances (unlike an in-memory counter). Window and limit are configured
 * centrally in src/lib/config.ts.
 */
export async function checkAndRecordSubmissionAttempt(
  ipHash: string
): Promise<RateLimitResult> {
  const supabase = createSupabaseAdminClient();
  const windowStart = new Date(
    Date.now() - siteConfig.rateLimit.windowMinutes * 60 * 1000
  ).toISOString();

  const { count, error } = await supabase
    .from("application_submission_attempts")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", windowStart);

  if (error) {
    console.error("Rate limit lookup failed:", error.message);
  } else if ((count ?? 0) >= siteConfig.rateLimit.maxSubmissionsPerWindow) {
    return { allowed: false, retryAfterMinutes: siteConfig.rateLimit.windowMinutes };
  }

  const { error: insertError } = await supabase
    .from("application_submission_attempts")
    .insert({ ip_hash: ipHash });

  if (insertError) {
    console.error("Failed to record submission attempt:", insertError.message);
  }

  return { allowed: true };
}
