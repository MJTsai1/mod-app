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
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
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

      // Full navigation (not router.push) so the server picks up the fresh
      // session cookie immediately on the next request.
      window.location.href = next && next.startsWith("/admin") ? next : "/admin/dashboard";
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {authError && (
        <div
          className="mb-4 rounded-xl border px-4 py-3 text-sm"
          style={{ borderColor: "var(--color-danger)", background: "var(--color-danger-bg)", color: "var(--color-danger)" }}
          role="alert"
        >
          Please sign in to continue.
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
