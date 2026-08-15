import Link from "next/link";

interface Props {
  heading: string;
  message: string;
  reference: string | null;
  followUp: string;
}

export function SubmissionSuccess({ heading, message, reference, followUp }: Props) {
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

        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{heading}</h1>
        <p className="mt-3 text-[var(--color-text-muted)]">{message}</p>

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

        <p className="field-hint mt-6">{followUp}</p>

        <Link href="/" className="btn btn-primary mt-8 w-full sm:w-auto">
          Return Home
        </Link>
      </div>
    </div>
  );
}
