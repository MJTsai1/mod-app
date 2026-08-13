"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function LoginForm() {
  const searchParams = useSearchParams();
  const authError = searchParams.get("error");
  const next = searchParams.get("next");

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("sending");
    setErrorMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const redirectTo = new URL("/auth/callback", window.location.origin);
      if (next) redirectTo.searchParams.set("next", next);

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo.toString() },
      });

      if (error) {
        setStatus("error");
        setErrorMessage(error.message);
        return;
      }

      setStatus("sent");
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
    }
  }

  if (status === "sent") {
    return (
      <div className="text-center">
        <p className="text-[var(--color-text)]">
          Check <strong>{email}</strong> for a sign-in link.
        </p>
        <p className="field-hint mt-2">
          The link will sign you in and redirect you to the dashboard. You can close this tab.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {authError && (
        <div
          className="mb-4 rounded-xl border px-4 py-3 text-sm"
          style={{ borderColor: "var(--color-danger)", background: "var(--color-danger-bg)", color: "var(--color-danger)" }}
          role="alert"
        >
          Sign-in link was invalid or expired. Please request a new one.
        </div>
      )}
      {status === "error" && errorMessage && (
        <div
          className="mb-4 rounded-xl border px-4 py-3 text-sm"
          style={{ borderColor: "var(--color-danger)", background: "var(--color-danger-bg)", color: "var(--color-danger)" }}
          role="alert"
        >
          {errorMessage}
        </div>
      )}

      <label htmlFor="email" className="field-label">
        Staff email address
      </label>
      <input
        id="email"
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
        className="field-input"
      />
      <p className="field-hint">
        Only accounts added by an administrator to the staff list can access the dashboard.
      </p>

      <button type="submit" disabled={status === "sending"} className="btn btn-primary mt-6 w-full">
        {status === "sending" ? "Sending link…" : "Send sign-in link"}
      </button>
    </form>
  );
}
