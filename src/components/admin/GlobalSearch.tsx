"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { SearchResult } from "@/app/api/admin/search/route";

const TYPE_LABELS: Record<SearchResult["type"], string> = {
  application: "Application",
  report: "Report",
  appeal: "Ban Appeal",
  support: "Support",
};

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trimmed = query.trim();
    // Starting/aborting a fetch is the "external system" this effect
    // synchronizes with — loading/results state must flip the moment the
    // query changes, same reasoning as DashboardClient's search effect.
    /* eslint-disable react-hooks/set-state-in-effect */
    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      fetch(`/api/admin/search?q=${encodeURIComponent(trimmed)}`, { signal: controller.signal })
        .then((res) => (res.ok ? res.json() : { results: [] }))
        .then((data) => setResults(data.results ?? []))
        .catch((err) => {
          if (err.name !== "AbortError") setResults([]);
        })
        .finally(() => setLoading(false));
    }, 250);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-xs">
      <input
        type="search"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search everything…"
        aria-label="Search applications, reports, appeals, and support requests"
        className="field-input py-1.5 text-sm"
      />

      {open && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-96 overflow-y-auto rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface-solid)] shadow-lg">
          {loading ? (
            <p className="px-4 py-3 text-sm text-[var(--color-text-subtle)]">Searching…</p>
          ) : results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-[var(--color-text-subtle)]">No matches found.</p>
          ) : (
            <ul>
              {results.map((result) => (
                <li key={`${result.type}-${result.id}`}>
                  <Link
                    href={result.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm transition hover:bg-[var(--color-surface-hover)]"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-[var(--color-text)]">
                        {result.title}
                      </span>
                      <span className="block truncate text-xs text-[var(--color-text-subtle)]">
                        {result.subtitle}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="badge bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]">
                        {TYPE_LABELS[result.type]}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
