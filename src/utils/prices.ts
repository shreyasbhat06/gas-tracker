import type { FuelType, PricesData, Station } from '../types'

export async function loadPrices(basePath: string): Promise<PricesData> {
  const url = `${basePath}data/prices.json`
  const res = await fetch(url, { cache: 'no-cache' })
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`)
  return res.json()
}

export function latestPriceFor(station: Station, fuel: FuelType): number | null {
  for (let i = station.history.length - 1; i >= 0; i--) {
    const v = station.history[i][fuel]
    if (typeof v === 'number') return v
  }
  return null
}

export function latestTimestamp(stations: Station[]): string | null {
  let latest: string | null = null
  for (const s of stations) {
    const last = s.history[s.history.length - 1]?.timestamp
    if (last && (!latest || last > latest)) latest = last
  }
  return latest
}

export interface PriceChange {
  current: number
  previous: number
  delta: number
}

/**
 * Latest price vs. the price ~`daysAgo` ago, choosing the closest history
 * entry within `toleranceDays`. Returns null if either endpoint is missing.
 * Positive `delta` = price went up; negative = went down (what we want).
 */
export function priceChangeVs(
  station: Station,
  fuel: FuelType,
  daysAgo = 7,
  toleranceDays = 3,
): PriceChange | null {
  const current = latestPriceFor(station, fuel)
  if (current == null) return null

  const targetMs = Date.now() - daysAgo * 24 * 60 * 60 * 1000
  const toleranceMs = toleranceDays * 24 * 60 * 60 * 1000

  let best: { gap: number; price: number } | null = null
  for (const h of station.history) {
    const v = h[fuel]
    if (typeof v !== 'number') continue
    const gap = Math.abs(new Date(h.timestamp).getTime() - targetMs)
    if (gap > toleranceMs) continue
    if (!best || gap < best.gap) best = { gap, price: v }
  }
  if (!best) return null
  return { current, previous: best.price, delta: current - best.price }
}

export function cheapest(stations: Station[], fuel: FuelType): Station | null {
  let best: { station: Station; price: number } | null = null
  for (const s of stations) {
    const p = latestPriceFor(s, fuel)
    if (p == null) continue
    if (!best || p < best.price) best = { station: s, price: p }
  }
  return best?.station ?? null
}

export function formatPrice(value: number | null | undefined): string {
  if (value == null) return '—'
  return `$${value.toFixed(3)}`
}

// Pivot history to a flat array suitable for Recharts:
// [{ ts, dateLabel, [stationId]: price, ... }, ...] for the last `days` days.
export function buildTrendSeries(
  stations: Station[],
  fuel: FuelType,
  days = 30,
): Array<Record<string, string | number>> {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
  const tsSet = new Set<string>()
  for (const s of stations) {
    for (const h of s.history) {
      if (new Date(h.timestamp).getTime() >= cutoff) tsSet.add(h.timestamp)
    }
  }
  const sorted = [...tsSet].sort()
  return sorted.map((ts) => {
    const row: Record<string, string | number> = { ts, dateLabel: shortDate(ts) }
    for (const s of stations) {
      const hit = s.history.find((h) => h.timestamp === ts)
      if (hit && typeof hit[fuel] === 'number') row[s.id] = hit[fuel] as number
    }
    return row
  })
}

export function shortDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function formatLastUpdated(iso: string | null): string {
  if (!iso) return 'never'
  const diffMs = Date.now() - new Date(iso).getTime()
  if (diffMs < 60_000) return 'just now'
  const mins = Math.floor(diffMs / 60_000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/** True if the timestamp is recent enough that we can call the data "live". */
export function isFresh(iso: string | null, withinHours = 14): boolean {
  if (!iso) return false
  return Date.now() - new Date(iso).getTime() < withinHours * 60 * 60 * 1000
}
