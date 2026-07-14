/**
 * Truncate to the last complete word within `maxChars`, appending an
 * ellipsis. Returns the input unchanged if it already fits.
 */
export function truncateToWord(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  const slice = text.slice(0, maxChars);
  const lastSpace = slice.lastIndexOf(' ');
  const safe = lastSpace > 0 ? slice.slice(0, lastSpace) : slice;
  return `${safe.trimEnd()}…`;
}
