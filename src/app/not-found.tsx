import Link from "next/link";
import { siteConfig } from "@/lib/config";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-16 sm:px-6">
      <div className="card-elevated w-full max-w-lg p-8 text-center sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-accent-soft)]">
          404
        </p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Page not found</h1>
        <p className="mt-3 text-[var(--color-text-muted)]">
          That page doesn&apos;t exist on {siteConfig.serverName}&apos;s site — it may have moved
          or the link might be wrong.
        </p>
        <Link href="/" className="btn btn-primary mt-8 w-full sm:w-auto">
          Return Home
        </Link>
      </div>
    </div>
  );
}
