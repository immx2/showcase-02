/**
 * `precision` controls TiB decimal places; values < 1024 GiB always render as whole GiB.
 */
export function formatGib(gib: number, precision = 1): string {
  return gib >= 1024 ? `${(gib / 1024).toFixed(precision)} TiB` : `${gib} GiB`
}

export function formatPercent(v: number, decimals = 1): string {
  return `${v.toFixed(decimals)}%`
}

/** K / M abbreviation for counts and plain numbers. */
export function formatNumber(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`
  return Math.round(v).toString()
}

export function formatThroughput(v: number, unit: string): string {
  return `${v.toFixed(2)} ${unit}`
}
