import type { FuelLogEntry } from '../types'

const KEY = 'fuelLog'

export function loadFuelLog(): FuelLogEntry[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const data = JSON.parse(raw)
    if (!Array.isArray(data)) return []
    // Back-compat: assume legacy entries were full fills.
    return data.map((e) => ({ ...e, filledToFull: e.filledToFull ?? true }))
  } catch {
    return []
  }
}

export function saveFuelLog(entries: FuelLogEntry[]): void {
  localStorage.setItem(KEY, JSON.stringify(entries))
}

export function addEntry(entry: FuelLogEntry): FuelLogEntry[] {
  const list = [...loadFuelLog(), entry].sort(byDateAsc)
  saveFuelLog(list)
  return list
}

export function deleteEntry(id: string): FuelLogEntry[] {
  const list = loadFuelLog().filter((e) => e.id !== id)
  saveFuelLog(list)
  return list
}

function byDateAsc(a: FuelLogEntry, b: FuelLogEntry): number {
  const c = a.date.localeCompare(b.date)
  return c !== 0 ? c : a.odometer - b.odometer
}

// --- MPG calc (Fuelly-style) -----------------------------------------------
// MPG is only computed at "full" fills. Gallons from any partial fills in
// between accumulate, so a stretch of (full → partial → partial → full) yields
// one MPG datapoint at the second full fill, over the whole accumulated gallons.

export interface MpgPoint {
  date: string
  mpg: number
  stationName: string
  entryId: string
}

export function computeMpgHistory(entries: FuelLogEntry[]): MpgPoint[] {
  const sorted = [...entries].sort(byDateAsc)
  const out: MpgPoint[] = []
  let lastFullIdx = -1

  for (let i = 0; i < sorted.length; i++) {
    if (!sorted[i].filledToFull) continue
    if (lastFullIdx === -1) {
      lastFullIdx = i
      continue
    }
    const prev = sorted[lastFullIdx]
    const cur = sorted[i]
    const miles = cur.odometer - prev.odometer
    let gallons = 0
    for (let j = lastFullIdx + 1; j <= i; j++) gallons += sorted[j].gallons
    if (miles > 0 && gallons > 0) {
      out.push({
        date: cur.date,
        mpg: miles / gallons,
        stationName: cur.stationName,
        entryId: cur.id,
      })
    }
    lastFullIdx = i
  }
  return out
}

export interface DerivedStats {
  lastMpg: number | null
  avgMpg30d: number | null
  lifetimeMpg: number | null
  bestMpg: number | null
  spentThisMonth: number
  milesThisMonth: number
  totalSpent: number
}

export function computeStats(entries: FuelLogEntry[]): DerivedStats {
  const sorted = [...entries].sort(byDateAsc)
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const cutoff30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  let spentThisMonth = 0
  let milesThisMonth = 0
  let totalSpent = 0

  for (let i = 0; i < sorted.length; i++) {
    const cur = sorted[i]
    totalSpent += cur.gallons * cur.pricePerGallon
    if (i === 0) continue
    const prev = sorted[i - 1]
    const miles = cur.odometer - prev.odometer
    if (miles <= 0) continue
    const cost = cur.gallons * cur.pricePerGallon
    const curDate = new Date(cur.date)
    if (curDate >= monthStart) {
      milesThisMonth += miles
      spentThisMonth += cost
    }
  }

  const mpgs = computeMpgHistory(sorted)
  const lastMpg = mpgs.length ? mpgs[mpgs.length - 1].mpg : null
  const bestMpg = mpgs.length ? Math.max(...mpgs.map((p) => p.mpg)) : null

  const recent = mpgs.filter((p) => new Date(p.date) >= cutoff30)
  const avgMpg30d = average(recent.map((p) => p.mpg))
  const lifetimeMpg = average(mpgs.map((p) => p.mpg))

  return {
    lastMpg,
    avgMpg30d,
    lifetimeMpg,
    bestMpg,
    spentThisMonth,
    milesThisMonth,
    totalSpent,
  }
}

function average(nums: number[]): number | null {
  if (!nums.length) return null
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

export function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function downloadJson(entries: FuelLogEntry[]): void {
  const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `fuel-log-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function parseImport(text: string): FuelLogEntry[] {
  const data = JSON.parse(text)
  if (!Array.isArray(data)) throw new Error('Imported file is not an array')
  return data.filter(isEntry).map((e) => ({ ...e, filledToFull: e.filledToFull ?? true }))
}

function isEntry(x: unknown): x is FuelLogEntry {
  if (typeof x !== 'object' || x === null) return false
  const e = x as Record<string, unknown>
  return (
    typeof e.id === 'string' &&
    typeof e.date === 'string' &&
    typeof e.odometer === 'number' &&
    typeof e.gallons === 'number' &&
    typeof e.pricePerGallon === 'number'
  )
}
