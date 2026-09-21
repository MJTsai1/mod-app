"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function LoginForm() {
  const t = useTranslations("login");
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
          error.message === "Invalid login credentials" ? t("incorrectCredentials") : error.message
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
      setErrorMessage(t("somethingWrong"));
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
        setErrorMessage(t("noMfaFactor"));
        return;
      }

      const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: totpFactor.id,
        code,
      });

      if (error) {
        setStatus("error");
        setErrorMessage(t("incorrectCode"));
        return;
      }

      proceed();
    } catch {
      setStatus("error");
      setErrorMessage(t("somethingWrong"));
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
          {t("mfaCodeLabel")}
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
        <p className="field-hint">{t("mfaHint")}</p>

        <button type="submit" disabled={status === "loading"} className="btn btn-primary mt-6 w-full">
          {status === "loading" ? t("verifying") : t("verify")}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handlePasswordSubmit} noValidate>
      {authError && alertBanner(t("pleaseSignIn"))}
      {status === "error" && errorMessage && alertBanner(errorMessage)}

      <label htmlFor="email" className="field-label">
        {t("emailLabel")}
      </label>
      <input
        id="email"
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder={t("emailPlaceholder")}
        className="field-input mb-4"
      />

      <label htmlFor="password" className="field-label">
        {t("passwordLabel")}
      </label>
      <input
        id="password"
        type="password"
        required
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder={t("passwordPlaceholder")}
        className="field-input"
      />
      <p className="field-hint">{t("noAccount")}</p>

      <button type="submit" disabled={status === "loading"} className="btn btn-primary mt-6 w-full">
        {status === "loading" ? t("signingIn") : t("signIn")}
      </button>
    </form>
  );
}
