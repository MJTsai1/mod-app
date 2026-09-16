/** Formats a view count compactly, e.g. 8, 1.2K, 3.4M. Safe for client components. */
export function formatViewCount(count: number): string {
  if (count < 1000) return `${count}`;
  if (count < 1_000_000) return `${(count / 1000).toFixed(count < 10_000 ? 1 : 0)}K`;
  return `${(count / 1_000_000).toFixed(1)}M`;
}
