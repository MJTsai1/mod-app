"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function LoginForm() {
  const searchParams = useSearchParams();
  const authError = searchParams.get("error");
  const next = searchParams.get("next");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"password" | "mfa">("password");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function proceed() {
    // Full navigation (not router.push) so the server picks up the fresh
    // session cookie immediately on the next request.
    window.location.href = next && next.startsWith("/admin") ? next : "/admin/dashboard";
  }

  async function handlePasswordSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setStatus("error");
        setErrorMessage(
          error.message === "Invalid login credentials"
            ? "Incorrect email or password."
            : error.message
        );
        return;
      }

      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal && aal.nextLevel === "aal2" && aal.currentLevel !== "aal2") {
        setStatus("idle");
        setStep("mfa");
        return;
      }

      proceed();
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
    }
  }

  async function handleMfaSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
      const totpFactor = factors?.totp?.[0];

      if (factorsError || !totpFactor) {
        setStatus("error");
        setErrorMessage("No two-factor method found on this account. Contact an admin.");
        return;
      }

      const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: totpFactor.id,
        code,
      });

      if (error) {
        setStatus("error");
        setErrorMessage("Incorrect code. Please try again.");
        return;
      }

      proceed();
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
    }
  }

  const alertBanner = (message: string) => (
    <div
      className="mb-4 rounded-xl border px-4 py-3 text-sm"
      style={{ borderColor: "var(--color-danger)", background: "var(--color-danger-bg)", color: "var(--color-danger)" }}
      role="alert"
    >
      {message}
    </div>
  );

  if (step === "mfa") {
    return (
      <form onSubmit={handleMfaSubmit} noValidate>
        {status === "error" && errorMessage && alertBanner(errorMessage)}

        <label htmlFor="code" className="field-label">
          Two-factor code
        </label>
        <input
          id="code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          required
          autoFocus
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="123456"
          className="field-input"
        />
        <p className="field-hint">Enter the 6-digit code from your authenticator app.</p>

        <button type="submit" disabled={status === "loading"} className="btn btn-primary mt-6 w-full">
          {status === "loading" ? "Verifying…" : "Verify"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handlePasswordSubmit} noValidate>
      {authError && alertBanner("Please sign in to continue.")}
      {status === "error" && errorMessage && alertBanner(errorMessage)}

      <label htmlFor="email" className="field-label">
        Email
      </label>
      <input
        id="email"
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
        className="field-input mb-4"
      />

      <label htmlFor="password" className="field-label">
        Password
      </label>
      <input
        id="password"
        type="password"
        required
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="••••••••"
        className="field-input"
      />
      <p className="field-hint">
        Don&apos;t have an account? Ask an admin to create one for you.
      </p>

      <button type="submit" disabled={status === "loading"} className="btn btn-primary mt-6 w-full">
        {status === "loading" ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
