"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error in route segment:", error);
  }, [error]);

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-16 sm:px-6">
      <div className="card-elevated w-full max-w-lg p-8 text-center sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-danger)]">
          Something went wrong
        </p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
          An unexpected error occurred
        </h1>
        <p className="mt-3 text-[var(--color-text-muted)]">
          This has been logged. You can try again, or head back to the homepage.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button type="button" onClick={() => reset()} className="btn btn-primary w-full sm:w-auto">
            Try again
          </button>
          <Link href="/" className="btn btn-secondary w-full sm:w-auto">
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
