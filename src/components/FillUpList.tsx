import { Trash2 } from 'lucide-react'
import type { FuelLogEntry } from '../types'

interface FillUpListProps {
  entries: FuelLogEntry[]
  onDelete: (id: string) => void
}

export function FillUpList({ entries, onDelete }: FillUpListProps) {
  if (!entries.length) {
    return (
      <div className="rounded-2xl bg-neutral-900 border border-white/[0.04] p-6 text-center text-sm text-neutral-400">
        No fill-ups yet. Tap “Log fill-up” to add your first one.
      </div>
    )
  }

  // Show newest first.
  const reversed = [...entries].reverse()

  return (
    <div className="rounded-2xl bg-neutral-900 border border-white/[0.04] overflow-hidden divide-y divide-neutral-800">
      {reversed.map((e) => (
        <FillUpRow key={e.id} entry={e} onDelete={onDelete} />
      ))}
    </div>
  )
}

function FillUpRow({ entry, onDelete }: { entry: FuelLogEntry; onDelete: (id: string) => void }) {
  const cost = entry.gallons * entry.pricePerGallon
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium text-neutral-100 truncate">
            {entry.stationName}
          </span>
          <span className="text-xs text-neutral-500 shrink-0">
            {formatDate(entry.date)}
          </span>
        </div>
        <div className="mt-0.5 text-xs text-neutral-400 tabular-nums">
          {entry.gallons.toFixed(2)} gal · ${entry.pricePerGallon.toFixed(3)}/gal ·{' '}
          {entry.odometer.toLocaleString()} mi
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-semibold tabular-nums">${cost.toFixed(2)}</div>
      </div>
      <button
        type="button"
        onClick={() => {
          if (confirm('Delete this fill-up?')) onDelete(entry.id)
        }}
        className="p-2 -mr-2 rounded-full text-neutral-500 hover:text-rose-400 hover:bg-white/5"
        aria-label="Delete fill-up"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}

function formatDate(iso: string): string {
  // Parse YYYY-MM-DD as a local date so it doesn't shift to the previous day in
  // negative-UTC offsets.
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, (m || 1) - 1, d || 1)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
