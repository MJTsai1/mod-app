import { z } from "zod";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function bulkStatusSchema<T extends readonly [string, ...string[]]>(statusValues: T) {
  return z.object({
    ids: z.array(z.string().regex(UUID_RE)).min(1, "Select at least one item.").max(200),
    status: z.enum(statusValues),
  });
}
