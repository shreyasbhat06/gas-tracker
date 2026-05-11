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
  const d = new Date(iso)
  return d.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
