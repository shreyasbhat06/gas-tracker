import { useEffect, useRef, useState } from 'react'
import {
  CalendarDays,
  DollarSign,
  Download,
  Gauge,
  Plus,
  Route,
  Trophy,
  Upload,
  Zap,
} from 'lucide-react'
import type { FuelLogEntry, Station } from '../types'
import {
  computeStats,
  deleteEntry,
  downloadJson,
  loadFuelLog,
  parseImport,
  saveFuelLog,
  upsertEntry,
} from '../utils/fuelLog'
import { LogFillUpModal } from './LogFillUpModal'
import { StatCard } from './StatCard'
import { FillUpList } from './FillUpList'
import { MpgTrendChart } from './MpgTrendChart'

export function FuelLogTab({ stations }: { stations: Station[] }) {
  const [entries, setEntries] = useState<FuelLogEntry[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<FuelLogEntry | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setEntries(loadFuelLog())
  }, [])

  const stats = computeStats(entries)
  // Most recent odometer reading; used as placeholder hint for new entries.
  const lastOdometer =
    entries.length > 0
      ? Math.max(...entries.map((e) => e.odometer))
      : null

  function openForCreate() {
    setEditing(null)
    setOpen(true)
  }

  function openForEdit(entry: FuelLogEntry) {
    setEditing(entry)
    setOpen(true)
  }

  function handleClose() {
    setOpen(false)
    // Defer clearing `editing` so the modal's exit doesn't flicker between
    // edit/create chrome on the way out.
    setTimeout(() => setEditing(null), 200)
  }

  function handleSubmit(entry: FuelLogEntry) {
    setEntries(upsertEntry(entry))
    handleClose()
  }

  function handleDelete(id: string) {
    setEntries(deleteEntry(id))
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    file.text().then((text) => {
      try {
        const imported = parseImport(text)
        if (!confirm(`Import ${imported.length} fill-ups? This replaces the current log.`)) return
        saveFuelLog(imported)
        setEntries(imported)
      } catch (err) {
        alert(`Import failed: ${err}`)
      }
    })
    e.target.value = ''
  }

  return (
    <div className="flex flex-col gap-5">
      <button
        type="button"
        onClick={openForCreate}
        className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-accent hover:bg-accent-hover active:bg-accent-press active:scale-[0.98] motion-reduce:transform-none text-white font-semibold shadow-lg shadow-accent/10 transition"
      >
        <Plus className="w-5 h-5" />
        Log fill-up
      </button>

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={Zap}
          label="Last MPG"
          value={stats.lastMpg != null ? stats.lastMpg.toFixed(1) : '—'}
        />
        <StatCard
          icon={Gauge}
          label="30-day avg MPG"
          value={stats.avgMpg30d != null ? stats.avgMpg30d.toFixed(1) : '—'}
        />
        <StatCard
          icon={CalendarDays}
          label="Lifetime MPG"
          value={stats.lifetimeMpg != null ? stats.lifetimeMpg.toFixed(1) : '—'}
        />
        <StatCard
          icon={Trophy}
          label="Best MPG"
          value={stats.bestMpg != null ? stats.bestMpg.toFixed(1) : '—'}
        />
        <StatCard
          icon={DollarSign}
          label="Spent this month"
          value={`$${stats.spentThisMonth.toFixed(2)}`}
        />
        <StatCard
          icon={Route}
          label="Miles this month"
          value={stats.milesThisMonth.toLocaleString()}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <h2 className="text-sm font-semibold text-ink">Recent fill-ups</h2>
          <div className="flex gap-1">
            <IconButton
              onClick={() => downloadJson(entries)}
              disabled={!entries.length}
              ariaLabel="Export JSON"
            >
              <Download className="w-4 h-4" />
            </IconButton>
            <IconButton onClick={() => fileRef.current?.click()} ariaLabel="Import JSON">
              <Upload className="w-4 h-4" />
            </IconButton>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={handleImport}
            />
          </div>
        </div>
        <FillUpList entries={entries} onDelete={handleDelete} onEdit={openForEdit} />
      </div>

      <MpgTrendChart entries={entries} />

      <LogFillUpModal
        open={open}
        stations={stations}
        entry={editing}
        lastOdometer={lastOdometer}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

function IconButton({
  onClick,
  disabled,
  ariaLabel,
  children,
}: {
  onClick: () => void
  disabled?: boolean
  ariaLabel: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className="p-2 rounded-lg text-ink-2 hover:text-ink hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-ink-2"
    >
      {children}
    </button>
  )
}
