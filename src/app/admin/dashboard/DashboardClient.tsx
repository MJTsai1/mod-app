"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { applicationStatusValues } from "@/lib/validation/application";
import type { ApplicationListItem, ApplicationStatus } from "@/lib/supabase/types";
import { InlineStatusSelect } from "@/components/admin/InlineStatusSelect";
import { TableSkeletonRows } from "@/components/admin/TableSkeletonRows";

const PAGE_SIZE = 20;

export function DashboardClient() {
  const [applications, setApplications] = useState<ApplicationListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reset to page 1 whenever the filters change. Adjusted during render
  // (React's documented pattern for this) rather than in an effect, so it
  // takes effect in the same render pass instead of causing an extra one.
  const [appliedFilters, setAppliedFilters] = useState({ status, debouncedSearch });
  if (appliedFilters.status !== status || appliedFilters.debouncedSearch !== debouncedSearch) {
    setAppliedFilters({ status, debouncedSearch });
    setPage(1);
  }

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();
    // Starting a fetch is the "external system" this effect synchronizes
    // with — loading/error state must flip the moment the request starts.
    /* eslint-disable react-hooks/set-state-in-effect */
    setLoading(true);
    setError(null);
    /* eslint-enable react-hooks/set-state-in-effect */

    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", String(PAGE_SIZE));
    if (status) params.set("status", status);
    if (debouncedSearch) params.set("q", debouncedSearch);

    fetch(`/api/admin/applications?${params.toString()}`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load applications.");
        return res.json();
      })
      .then((data) => {
        setApplications(data.applications ?? []);
        setTotal(data.total ?? 0);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setError("Couldn't load applications. Please refresh the page.");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [page, status, debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const exportParams = new URLSearchParams();
  if (status) exportParams.set("status", status);
  if (debouncedSearch) exportParams.set("q", debouncedSearch);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by username, Discord ID, or reference..."
            className="field-input sm:max-w-xs"
            aria-label="Search applications"
          />
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="field-input sm:max-w-[180px]"
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            {applicationStatusValues.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <a
          href={`/api/admin/applications/export?${exportParams.toString()}`}
          className="btn btn-secondary px-3 py-2 text-sm"
        >
          Export CSV
        </a>
      </div>

      {error && (
        <div
          className="mb-4 rounded-xl border px-4 py-3 text-sm"
          style={{ borderColor: "var(--color-danger)", background: "var(--color-danger-bg)", color: "var(--color-danger)" }}
        >
          {error}
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--color-border)] text-xs uppercase tracking-wide text-[var(--color-text-subtle)]">
              <tr>
                <th className="px-4 py-3">Applicant</th>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading && <TableSkeletonRows columns={5} />}
              {!loading && applications.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[var(--color-text-subtle)]">
                    No applications found.
                  </td>
                </tr>
              )}
              {!loading &&
                applications.map((application) => (
                  <tr
                    key={application.id}
                    className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-hover)]"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-[var(--color-text)]">
                        {application.discord_username}
                      </div>
                      <div className="text-xs text-[var(--color-text-subtle)]">
                        {application.discord_user_id} · Age {application.age} · {application.country}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--color-text-muted)]">
                      {application.reference_code}
                    </td>
                    <td className="px-4 py-3">
                      <InlineStatusSelect
                        status={application.status}
                        statusValues={applicationStatusValues}
                        endpoint={`/api/admin/applications/${application.id}`}
                        onUpdated={(newStatus) =>
                          setApplications((prev) =>
                            prev.map((a) =>
                              a.id === application.id ? { ...a, status: newStatus as ApplicationStatus } : a
                            )
                          )
                        }
                      />
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-muted)]">
                      {new Date(application.created_at).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/dashboard/${application.id}`}
                        className="text-sm font-medium text-[var(--color-accent-soft)] hover:underline"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-[var(--color-text-muted)]">
          <span>
            Page {page} of {totalPages} &middot; {total} total
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-secondary px-3 py-1.5 text-sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            <button
              type="button"
              className="btn btn-secondary px-3 py-1.5 text-sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
