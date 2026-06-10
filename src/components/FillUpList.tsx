import { ChevronRight, Trash2 } from 'lucide-react'
import type { FuelLogEntry } from '../types'

interface FillUpListProps {
  entries: FuelLogEntry[]
  onDelete: (id: string) => void
  onEdit: (entry: FuelLogEntry) => void
}

export function FillUpList({ entries, onDelete, onEdit }: FillUpListProps) {
  if (!entries.length) {
    return (
      <div className="card p-6 text-center text-sm text-ink-2">
        No fill-ups yet. Tap “Log fill-up” to add your first one.
      </div>
    )
  }

  // Show newest first.
  const reversed = [...entries].reverse()

  return (
    <div className="card overflow-hidden divide-y divide-line">
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
        className="group flex-1 min-w-0 flex items-center gap-2 px-4 py-3.5 text-left hover:bg-black/[0.02] dark:hover:bg-white/[0.02] active:bg-black/[0.04] dark:active:bg-white/[0.04] transition-colors"
        aria-label={`Edit fill-up at ${entry.stationName}`}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-medium text-ink truncate">
              {entry.stationName}
            </span>
            <span className="text-xs text-ink-3 shrink-0">
              {formatDate(entry.date)}
            </span>
          </div>
          <div className="mt-0.5 text-xs text-ink-2 tabular-nums">
            {entry.gallons.toFixed(2)} gal · ${entry.pricePerGallon.toFixed(3)}/gal ·{' '}
            {entry.odometer.toLocaleString()} mi
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-sm font-semibold tabular-nums">${cost.toFixed(2)}</div>
        </div>
        {/* Quiet edit affordance — rows look tappable, not just informational. */}
        <ChevronRight className="w-4 h-4 shrink-0 text-ink-3/60 group-hover:text-ink-2 transition-colors" />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          if (confirm('Delete this fill-up?')) onDelete(entry.id)
        }}
        className="w-11 grid place-items-center text-ink-3 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
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
