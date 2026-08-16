export function TableSkeletonRows({ rows = 5, columns }: { rows?: number; columns: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="border-b border-[var(--color-border)] last:border-0">
          {Array.from({ length: columns }).map((__, colIndex) => (
            <td key={colIndex} className="px-4 py-3">
              <div className="h-4 w-3/4 animate-pulse rounded bg-[var(--color-surface-hover)]" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
