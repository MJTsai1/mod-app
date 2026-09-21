"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

interface Factor {
  id: string;
  friendlyName: string | null;
  status: string;
}

export function SecurityClient() {
  const t = useTranslations("securityPage");
  const tLogin = useTranslations("login");
  const [factors, setFactors] = useState<Factor[] | null>(null);
  const [enrolling, setEnrolling] = useState<{ factorId: string; qrCode: string; secret: string } | null>(
    null
  );
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function refreshFactors() {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.auth.mfa.listFactors();
    setFactors((data?.totp ?? []).map((f) => ({ id: f.id, friendlyName: f.friendly_name ?? null, status: f.status })));
  }

  useEffect(() => {
    // Synchronizing with an external system (Supabase Auth's enrolled
    // factors) on mount, not deriving state from props/state.
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    refreshFactors();
  }, []);

  async function startEnroll() {
    setStatus("loading");
    setErrorMessage(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });
      if (error || !data) {
        setStatus("error");
        setErrorMessage(error?.message ?? t("enrollFailed"));
        return;
      }
      setEnrolling({ factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret });
      setStatus("idle");
    } catch {
      setStatus("error");
      setErrorMessage(tLogin("somethingWrong"));
    }
  }

  async function confirmEnroll(event: React.FormEvent) {
    event.preventDefault();
    if (!enrolling) return;
    setStatus("loading");
    setErrorMessage(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: enrolling.factorId,
        code,
      });
      if (error) {
        setStatus("error");
        setErrorMessage(tLogin("incorrectCode"));
        return;
      }
      setEnrolling(null);
      setCode("");
      setStatus("idle");
      await refreshFactors();
    } catch {
      setStatus("error");
      setErrorMessage(tLogin("somethingWrong"));
    }
  }

  async function removeFactor(factorId: string) {
    setStatus("loading");
    setErrorMessage(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      if (error) {
        setStatus("error");
        setErrorMessage(error.message);
        return;
      }
      setStatus("idle");
      await refreshFactors();
    } catch {
      setStatus("error");
      setErrorMessage(tLogin("somethingWrong"));
    }
  }

  const verifiedFactors = factors?.filter((f) => f.status === "verified") ?? [];

  return (
    <div className="card p-6">
      {errorMessage && (
        <div
          className="mb-4 rounded-xl border px-4 py-3 text-sm"
          style={{ borderColor: "var(--color-danger)", background: "var(--color-danger-bg)", color: "var(--color-danger)" }}
          role="alert"
        >
          {errorMessage}
        </div>
      )}

      {factors === null ? (
        <p className="text-sm text-[var(--color-text-subtle)]">{t("loading")}</p>
      ) : enrolling ? (
        <form onSubmit={confirmEnroll}>
          <p className="mb-3 text-sm text-[var(--color-text)]">{t("scanQr")}</p>
          {/* eslint-disable-next-line @next/next/no-img-element -- data-URI SVG from Supabase, not a static asset next/image can optimize */}
          <img src={enrolling.qrCode} alt={t("qrAlt")} className="mb-3 h-48 w-48 rounded-lg bg-white p-2" />
          <p className="field-hint mb-4 break-all">{t("manualEntry", { secret: enrolling.secret })}</p>

          <label htmlFor="enroll-code" className="field-label">
            {t("codeLabel")}
          </label>
          <input
            id="enroll-code"
            type="text"
            inputMode="numeric"
            required
            autoFocus
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="123456"
            className="field-input"
          />

          <div className="mt-4 flex gap-2">
            <button type="submit" disabled={status === "loading"} className="btn btn-primary">
              {status === "loading" ? tLogin("verifying") : t("activate")}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setEnrolling(null);
                setCode("");
              }}
            >
              {t("cancel")}
            </button>
          </div>
        </form>
      ) : verifiedFactors.length > 0 ? (
        <div>
          <p className="mb-3 text-sm text-[var(--color-text)]">{t("enabled")}</p>
          <ul className="space-y-2">
            {verifiedFactors.map((factor) => (
              <li key={factor.id} className="flex items-center justify-between gap-4">
                <span className="text-sm text-[var(--color-text-subtle)]">
                  {t("authenticatorApp", { name: factor.friendlyName ? `(${factor.friendlyName})` : "" })}
                </span>
                <button
                  type="button"
                  disabled={status === "loading"}
                  className="btn btn-ghost px-3 py-1.5 text-sm"
                  style={{ color: "var(--color-danger)" }}
                  onClick={() => removeFactor(factor.id)}
                >
                  {t("remove")}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div>
          <p className="mb-4 text-sm text-[var(--color-text-subtle)]">{t("notEnabled")}</p>
          <button type="button" disabled={status === "loading"} className="btn btn-primary" onClick={startEnroll}>
            {status === "loading" ? t("starting") : t("enable")}
          </button>
        </div>
      )}
    </div>
  );
}
