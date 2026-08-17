"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { reportStatusValues } from "@/lib/validation/report";
import { reportCategoryLabels } from "@/lib/config";
import type { ReportListItem, ReportStatus } from "@/lib/supabase/types";
import { InlineStatusSelect } from "@/components/admin/InlineStatusSelect";
import { TableSkeletonRows } from "@/components/admin/TableSkeletonRows";
import { ClaimButton } from "@/components/admin/ClaimButton";
import { SortableHeader } from "@/components/admin/SortableHeader";
import { BulkActionsBar } from "@/components/admin/BulkActionsBar";
import { useToast } from "@/components/site/ToastProvider";

const PAGE_SIZE = 20;

type ReportListRow = ReportListItem & { claimed_by_name: string | null };

export function ReportsClient({ currentStaffId }: { currentStaffId: string }) {
  const { showToast } = useToast();
  const [reports, setReports] = useState<ReportListRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortColumn, setSortColumn] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkApplying, setBulkApplying] = useState(false);

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
    /* eslint-disable react-hooks/set-state-in-effect */
    setLoading(true);
    setError(null);
    /* eslint-enable react-hooks/set-state-in-effect */

    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", String(PAGE_SIZE));
    if (status) params.set("status", status);
    if (debouncedSearch) params.set("q", debouncedSearch);
    params.set("sort", sortColumn);
    params.set("order", sortOrder);

    fetch(`/api/admin/reports?${params.toString()}`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load reports.");
        return res.json();
      })
      .then((data) => {
        setReports(data.reports ?? []);
        setTotal(data.total ?? 0);
        setSelected(new Set());
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setError("Couldn't load reports. Please refresh the page.");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [page, status, debouncedSearch, sortColumn, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const exportParams = new URLSearchParams();
  if (status) exportParams.set("status", status);
  if (debouncedSearch) exportParams.set("q", debouncedSearch);

  function handleSort(column: string) {
    if (column === sortColumn) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortOrder("desc");
    }
  }

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelected((prev) => (prev.size === reports.length ? new Set() : new Set(reports.map((r) => r.id))));
  }

  async function handleBulkApply(newStatus: ReportStatus) {
    setBulkApplying(true);
    try {
      const response = await fetch("/api/admin/reports/bulk-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected), status: newStatus }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        showToast(body?.error ?? "Bulk update failed.", "error");
        return;
      }
      setReports((prev) => prev.map((r) => (selected.has(r.id) ? { ...r, status: newStatus } : r)));
      showToast(`Updated ${body.updated} report${body.updated === 1 ? "" : "s"}.`);
      setSelected(new Set());
    } catch {
      showToast("Network error — please try again.", "error");
    } finally {
      setBulkApplying(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by reporter, reported member, or reference..."
            className="field-input sm:max-w-xs"
            aria-label="Search reports"
          />
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="field-input sm:max-w-[180px]"
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            {reportStatusValues.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <a
          href={`/api/admin/reports/export?${exportParams.toString()}`}
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

      <BulkActionsBar
        count={selected.size}
        statusValues={reportStatusValues}
        onApply={handleBulkApply}
        onClear={() => setSelected(new Set())}
        applying={bulkApplying}
      />

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--color-border)] text-xs uppercase tracking-wide text-[var(--color-text-subtle)]">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={reports.length > 0 && selected.size === reports.length}
                    onChange={toggleSelectAll}
                    aria-label="Select all on this page"
                  />
                </th>
                <th className="px-4 py-3">Reported member</th>
                <SortableHeader label="Category" column="category" currentSort={sortColumn} currentOrder={sortOrder} onSort={handleSort} />
                <th className="px-4 py-3">Reference</th>
                <SortableHeader label="Status" column="status" currentSort={sortColumn} currentOrder={sortOrder} onSort={handleSort} />
                <th className="px-4 py-3">Claim</th>
                <SortableHeader label="Submitted" column="created_at" currentSort={sortColumn} currentOrder={sortOrder} onSort={handleSort} />
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading && <TableSkeletonRows columns={8} />}
              {!loading && reports.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-[var(--color-text-subtle)]">
                    No reports found.
                  </td>
                </tr>
              )}
              {!loading &&
                reports.map((report) => (
                  <tr
                    key={report.id}
                    className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-hover)]"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(report.id)}
                        onChange={() => toggleSelected(report.id)}
                        aria-label={`Select report against ${report.reported_discord_username}`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-[var(--color-text)]">
                        {report.reported_discord_username}
                      </div>
                      <div className="text-xs text-[var(--color-text-subtle)]">
                        Reported by {report.reporter_discord_username}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-muted)]">
                      {reportCategoryLabels[report.category]}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--color-text-muted)]">
                      {report.reference_code}
                    </td>
                    <td className="px-4 py-3">
                      <InlineStatusSelect
                        status={report.status}
                        statusValues={reportStatusValues}
                        endpoint={`/api/admin/reports/${report.id}`}
                        onUpdated={(newStatus) =>
                          setReports((prev) =>
                            prev.map((r) =>
                              r.id === report.id ? { ...r, status: newStatus as ReportStatus } : r
                            )
                          )
                        }
                      />
                    </td>
                    <td className="px-4 py-3">
                      <ClaimButton
                        endpoint={`/api/admin/reports/${report.id}`}
                        claimedBy={report.claimed_by}
                        claimedByName={report.claimed_by_name}
                        currentStaffId={currentStaffId}
                        onUpdated={(claimedBy, claimedByName) =>
                          setReports((prev) =>
                            prev.map((r) =>
                              r.id === report.id ? { ...r, claimed_by: claimedBy, claimed_by_name: claimedByName } : r
                            )
                          )
                        }
                      />
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-muted)]">
                      {new Date(report.created_at).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/reports/${report.id}`}
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
