/**
 * Converts an ISO 3166-1 alpha-2 country code (e.g. from Vercel's
 * `x-vercel-ip-country` request header) into a human-readable country name.
 */
export function countryNameFromCode(code: string | null | undefined): string | undefined {
  if (!code) return undefined;
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code.toUpperCase());
  } catch {
    return undefined;
  }
}
