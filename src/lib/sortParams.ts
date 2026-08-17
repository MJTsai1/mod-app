/** Parses ?sort=&order= query params against a whitelist, since column names can't be user-supplied directly. */
export function parseSortParams<T extends string>(
  url: URL,
  allowedColumns: readonly T[],
  defaultColumn: T
): { column: T; ascending: boolean } {
  const sortParam = url.searchParams.get("sort");
  const column = (allowedColumns as readonly string[]).includes(sortParam ?? "")
    ? (sortParam as T)
    : defaultColumn;
  const ascending = url.searchParams.get("order") === "asc";
  return { column, ascending };
}
