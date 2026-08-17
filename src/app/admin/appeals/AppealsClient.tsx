"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { appealStatusValues } from "@/lib/validation/appeal";
import type { BanAppealListItem, AppealStatus } from "@/lib/supabase/types";
import { InlineStatusSelect } from "@/components/admin/InlineStatusSelect";
import { TableSkeletonRows } from "@/components/admin/TableSkeletonRows";
import { ClaimButton } from "@/components/admin/ClaimButton";
import { SortableHeader } from "@/components/admin/SortableHeader";
import { BulkActionsBar } from "@/components/admin/BulkActionsBar";
import { useToast } from "@/components/site/ToastProvider";

const PAGE_SIZE = 20;

type BanAppealListRow = BanAppealListItem & { claimed_by_name: string | null };

export function AppealsClient({ currentStaffId }: { currentStaffId: string }) {
  const { showToast } = useToast();
  const [appeals, setAppeals] = useState<BanAppealListRow[]>([]);
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

    fetch(`/api/admin/appeals?${params.toString()}`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load appeals.");
        return res.json();
      })
      .then((data) => {
        setAppeals(data.appeals ?? []);
        setTotal(data.total ?? 0);
        setSelected(new Set());
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setError("Couldn't load ban appeals. Please refresh the page.");
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
    setSelected((prev) => (prev.size === appeals.length ? new Set() : new Set(appeals.map((a) => a.id))));
  }

  async function handleBulkApply(newStatus: AppealStatus) {
    setBulkApplying(true);
    try {
      const response = await fetch("/api/admin/appeals/bulk-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected), status: newStatus }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        showToast(body?.error ?? "Bulk update failed.", "error");
        return;
      }
      setAppeals((prev) => prev.map((a) => (selected.has(a.id) ? { ...a, status: newStatus } : a)));
      showToast(`Updated ${body.updated} appeal${body.updated === 1 ? "" : "s"}.`);
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
            placeholder="Search by username, Discord ID, or reference..."
            className="field-input sm:max-w-xs"
            aria-label="Search ban appeals"
          />
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="field-input sm:max-w-[180px]"
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            {appealStatusValues.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <a
          href={`/api/admin/appeals/export?${exportParams.toString()}`}
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
        statusValues={appealStatusValues}
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
                    checked={appeals.length > 0 && selected.size === appeals.length}
                    onChange={toggleSelectAll}
                    aria-label="Select all on this page"
                  />
                </th>
                <SortableHeader label="Applicant" column="discord_username" currentSort={sortColumn} currentOrder={sortOrder} onSort={handleSort} />
                <th className="px-4 py-3">Reference</th>
                <SortableHeader label="Status" column="status" currentSort={sortColumn} currentOrder={sortOrder} onSort={handleSort} />
                <th className="px-4 py-3">Claim</th>
                <SortableHeader label="Submitted" column="created_at" currentSort={sortColumn} currentOrder={sortOrder} onSort={handleSort} />
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading && <TableSkeletonRows columns={7} />}
              {!loading && appeals.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[var(--color-text-subtle)]">
                    No ban appeals found.
                  </td>
                </tr>
              )}
              {!loading &&
                appeals.map((appeal) => (
                  <tr
                    key={appeal.id}
                    className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-hover)]"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(appeal.id)}
                        onChange={() => toggleSelected(appeal.id)}
                        aria-label={`Select ${appeal.discord_username}`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-[var(--color-text)]">
                        {appeal.discord_username}
                      </div>
                      <div className="text-xs text-[var(--color-text-subtle)]">
                        {appeal.discord_user_id}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--color-text-muted)]">
                      {appeal.reference_code}
                    </td>
                    <td className="px-4 py-3">
                      <InlineStatusSelect
                        status={appeal.status}
                        statusValues={appealStatusValues}
                        endpoint={`/api/admin/appeals/${appeal.id}`}
                        onUpdated={(newStatus) =>
                          setAppeals((prev) =>
                            prev.map((a) =>
                              a.id === appeal.id ? { ...a, status: newStatus as AppealStatus } : a
                            )
                          )
                        }
                      />
                    </td>
                    <td className="px-4 py-3">
                      <ClaimButton
                        endpoint={`/api/admin/appeals/${appeal.id}`}
                        claimedBy={appeal.claimed_by}
                        claimedByName={appeal.claimed_by_name}
                        currentStaffId={currentStaffId}
                        onUpdated={(claimedBy, claimedByName) =>
                          setAppeals((prev) =>
                            prev.map((a) =>
                              a.id === appeal.id ? { ...a, claimed_by: claimedBy, claimed_by_name: claimedByName } : a
                            )
                          )
                        }
                      />
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-muted)]">
                      {new Date(appeal.created_at).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/appeals/${appeal.id}`}
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
