import "server-only";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

interface TurnstileVerifyResponse {
  success: boolean;
  "error-codes"?: string[];
}

/**
 * Verifies a Cloudflare Turnstile token server-side. If TURNSTILE_SECRET_KEY
 * is not configured, verification is skipped (treated as passing) so the
 * form works out of the box before you've set up Turnstile — see
 * .env.example. Set the secret to enforce the CAPTCHA in production.
 */
export async function verifyTurnstileToken(
  token: string | undefined,
  remoteIp: string
): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) return true;
  if (!token) return false;

  try {
    const response = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
        remoteip: remoteIp,
      }),
    });

    const data = (await response.json()) as TurnstileVerifyResponse;
    return data.success === true;
  } catch (error) {
    console.error("Turnstile verification request failed:", error);
    return false;
  }
}
