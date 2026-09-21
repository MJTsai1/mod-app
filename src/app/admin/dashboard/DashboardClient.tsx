"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { applicationStatusValues } from "@/lib/validation/application";
import type { ApplicationListItem, ApplicationStatus } from "@/lib/supabase/types";
import { InlineStatusSelect } from "@/components/admin/InlineStatusSelect";
import { TableSkeletonRows } from "@/components/admin/TableSkeletonRows";
import { ClaimButton } from "@/components/admin/ClaimButton";
import { SortableHeader } from "@/components/admin/SortableHeader";
import { BulkActionsBar } from "@/components/admin/BulkActionsBar";
import { useToast } from "@/components/site/ToastProvider";

const PAGE_SIZE = 20;

type ApplicationListRow = ApplicationListItem & { claimed_by_name: string | null };

export function DashboardClient({ currentStaffId }: { currentStaffId: string }) {
  const t = useTranslations("table");
  const tBulk = useTranslations("bulk");
  const tStatus = useTranslations("status");
  const tCommon = useTranslations("common");
  const { showToast } = useToast();
  const [applications, setApplications] = useState<ApplicationListRow[]>([]);
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
    params.set("sort", sortColumn);
    params.set("order", sortOrder);

    fetch(`/api/admin/applications?${params.toString()}`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load applications.");
        return res.json();
      })
      .then((data) => {
        setApplications(data.applications ?? []);
        setTotal(data.total ?? 0);
        setSelected(new Set());
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setError(t("couldntLoadApplications"));
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [page, status, debouncedSearch, sortColumn, sortOrder, t]);

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
    setSelected((prev) =>
      prev.size === applications.length ? new Set() : new Set(applications.map((a) => a.id))
    );
  }

  async function handleBulkApply(newStatus: ApplicationStatus) {
    setBulkApplying(true);
    try {
      const response = await fetch("/api/admin/applications/bulk-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected), status: newStatus }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        showToast(body?.error ?? tBulk("bulkUpdateFailed"), "error");
        return;
      }
      setApplications((prev) =>
        prev.map((a) => (selected.has(a.id) ? { ...a, status: newStatus } : a))
      );
      showToast(tBulk("updatedApplications", { count: body.updated }));
      setSelected(new Set());
    } catch {
      showToast(tCommon("networkError"), "error");
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
            placeholder={t("searchApplicationsPlaceholder")}
            className="field-input sm:max-w-xs"
            aria-label={t("searchApplicationsAria")}
          />
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="field-input sm:max-w-[180px]"
            aria-label={t("filterByStatusAria")}
          >
            <option value="">{t("allStatuses")}</option>
            {applicationStatusValues.map((s) => (
              <option key={s} value={s}>
                {tStatus(s)}
              </option>
            ))}
          </select>
        </div>
        <a
          href={`/api/admin/applications/export?${exportParams.toString()}`}
          className="btn btn-secondary px-3 py-2 text-sm"
        >
          {t("exportCsv")}
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
        statusValues={applicationStatusValues}
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
                    checked={applications.length > 0 && selected.size === applications.length}
                    onChange={toggleSelectAll}
                    aria-label={t("selectAllAria")}
                  />
                </th>
                <SortableHeader label={t("applicant")} column="discord_username" currentSort={sortColumn} currentOrder={sortOrder} onSort={handleSort} />
                <th className="px-4 py-3">{t("reference")}</th>
                <SortableHeader label={t("status")} column="status" currentSort={sortColumn} currentOrder={sortOrder} onSort={handleSort} />
                <th className="px-4 py-3">{t("claim")}</th>
                <SortableHeader label={t("submitted")} column="created_at" currentSort={sortColumn} currentOrder={sortOrder} onSort={handleSort} />
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading && <TableSkeletonRows columns={7} />}
              {!loading && applications.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[var(--color-text-subtle)]">
                    {t("noApplications")}
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
                      <input
                        type="checkbox"
                        checked={selected.has(application.id)}
                        onChange={() => toggleSelected(application.id)}
                        aria-label={t("selectApplicantAria", { name: application.discord_username })}
                      />
                    </td>
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
                    <td className="px-4 py-3">
                      <ClaimButton
                        endpoint={`/api/admin/applications/${application.id}`}
                        claimedBy={application.claimed_by}
                        claimedByName={application.claimed_by_name}
                        currentStaffId={currentStaffId}
                        onUpdated={(claimedBy, claimedByName) =>
                          setApplications((prev) =>
                            prev.map((a) =>
                              a.id === application.id ? { ...a, claimed_by: claimedBy, claimed_by_name: claimedByName } : a
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
                        {t("review")}
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
          <span>{t("pageOf", { page, totalPages, total })}</span>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-secondary px-3 py-1.5 text-sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              {t("previous")}
            </button>
            <button
              type="button"
              className="btn btn-secondary px-3 py-1.5 text-sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              {t("next")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
