/** "needs_info" -> "Needs info" for status dropdown labels. */
export function formatStatusLabel(status: string): string {
  const spaced = status.replace(/_/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}
