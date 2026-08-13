import Link from "next/link";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: `Application Submitted — ${siteConfig.serverName}`,
  robots: { index: false },
};

const REFERENCE_RE = /^[A-Z0-9-]{5,40}$/;

export default async function ApplySuccessPage(props: PageProps<"/apply/success">) {
  const searchParams = await props.searchParams;
  const refParam = searchParams.ref;
  const reference = typeof refParam === "string" && REFERENCE_RE.test(refParam) ? refParam : null;

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16 sm:px-6">
      <div className="card-elevated w-full max-w-lg p-8 text-center sm:p-10">
        <div
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
          style={{ background: "var(--color-success-bg)" }}
          aria-hidden
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-[var(--color-success)]">
            <path
              d="M5 13l4 4L19 7"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Application Submitted</h1>
        <p className="mt-3 text-[var(--color-text-muted)]">
          Thanks for applying! Your application has been successfully received.
        </p>

        {reference && (
          <div className="mt-6 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-[var(--color-text-subtle)]">
              Reference ID
            </p>
            <p className="mt-1 font-mono text-lg font-semibold text-[var(--color-accent-soft)]">
              {reference}
            </p>
          </div>
        )}

        <p className="field-hint mt-6">
          Keep this reference for your records. The staff team will review your application and
          reach out via Discord if needed — no further action is required from you right now.
        </p>

        <Link href="/" className="btn btn-primary mt-8 w-full sm:w-auto">
          Return Home
        </Link>
      </div>
    </div>
  );
}
