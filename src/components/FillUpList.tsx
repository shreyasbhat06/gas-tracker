import { Trash2 } from 'lucide-react'
import type { FuelLogEntry } from '../types'

interface FillUpListProps {
  entries: FuelLogEntry[]
  onDelete: (id: string) => void
  onEdit: (entry: FuelLogEntry) => void
}

export function FillUpList({ entries, onDelete, onEdit }: FillUpListProps) {
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
        <FillUpRow key={e.id} entry={e} onDelete={onDelete} onEdit={onEdit} />
      ))}
    </div>
  )
}

function FillUpRow({
  entry,
  onDelete,
  onEdit,
}: {
  entry: FuelLogEntry
  onDelete: (id: string) => void
  onEdit: (entry: FuelLogEntry) => void
}) {
  const cost = entry.totalCost ?? entry.gallons * entry.pricePerGallon
  return (
    <div className="flex items-stretch">
      <button
        type="button"
        onClick={() => onEdit(entry)}
        className="flex-1 min-w-0 flex items-center gap-3 px-4 py-3.5 text-left hover:bg-white/[0.02] active:bg-white/[0.04] transition-colors"
        aria-label={`Edit fill-up at ${entry.stationName}`}
      >
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
        <div className="text-right shrink-0">
          <div className="text-sm font-semibold tabular-nums">${cost.toFixed(2)}</div>
        </div>
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          if (confirm('Delete this fill-up?')) onDelete(entry.id)
        }}
        className="px-3 text-neutral-500 hover:text-rose-400 hover:bg-white/5 transition-colors"
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
