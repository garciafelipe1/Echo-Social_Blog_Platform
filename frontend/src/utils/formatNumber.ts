/**
 * Format large numbers in a compact way (e.g. 1.2K, 3.4M).
 * Returns the raw number as string if below 1000.
 */
export function formatCompact(n: number | string): string {
  const num = typeof n === 'string' ? parseInt(n, 10) : n;
  if (!num || isNaN(num)) return '0';
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return num.toString();
}
