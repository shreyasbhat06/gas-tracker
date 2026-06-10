import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import type { FuelLogEntry, Station } from '../types'
import { newId } from '../utils/fuelLog'
import { latestPriceFor } from '../utils/prices'

interface LogFillUpModalProps {
  open: boolean
  stations: Station[]
  /** When provided, the modal is in edit-mode for this entry. */
  entry?: FuelLogEntry | null
  /** Most recent odometer reading — shown as placeholder hint for new entries
   *  so the user remembers to enter total miles, not trip miles. */
  lastOdometer?: number | null
  onClose: () => void
  onSubmit: (entry: FuelLogEntry) => void
}

const OTHER = '__other__'

export function LogFillUpModal({
  open,
  stations,
  entry,
  lastOdometer,
  onClose,
  onSubmit,
}: LogFillUpModalProps) {
  const isEdit = !!entry
  const today = new Date().toISOString().slice(0, 10)

  const [date, setDate] = useState(today)
  const [odometer, setOdometer] = useState('')
  const [totalCost, setTotalCost] = useState('')
  const [pricePerGallon, setPricePerGallon] = useState('')
  const [stationId, setStationId] = useState(stations[0]?.id ?? OTHER)
  const [otherName, setOtherName] = useState('')
  const [filledToFull, setFilledToFull] = useState(true)
  const [fuelLevelAfter, setFuelLevelAfter] = useState('100')

  // Populate state when the modal opens. In edit-mode we use the entry's
  // own price; otherwise we auto-fill from the default station's latest
  // premium price.
  useEffect(() => {
    if (!open) return
    if (entry) {
      setDate(entry.date)
      setOdometer(String(entry.odometer))
      const cost = entry.totalCost ?? entry.gallons * entry.pricePerGallon
      setTotalCost(cost.toFixed(2))
      setPricePerGallon(entry.pricePerGallon.toFixed(3))
      setStationId(entry.stationId)
      setOtherName(entry.stationId === OTHER ? entry.stationName : '')
      setFilledToFull(entry.filledToFull)
      setFuelLevelAfter(
        entry.fuelLevelAfter != null ? String(entry.fuelLevelAfter) : '100',
      )
    } else {
      const defaultStation = stations[0]
      setDate(today)
      setOdometer('')
      setTotalCost('')
      setPricePerGallon(autoFillPrice(defaultStation))
      setStationId(defaultStation?.id ?? OTHER)
      setOtherName('')
      setFilledToFull(true)
      setFuelLevelAfter('100')
    }
    // We deliberately don't want `today` or `stations` in the deps; we only
    // re-populate on open or when switching to a different entry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, entry?.id])

  function handleStationChange(newId: string) {
    setStationId(newId)
    if (newId === OTHER) return
    const station = stations.find((s) => s.id === newId)
    const price = autoFillPrice(station)
    if (price) setPricePerGallon(price)
  }

  if (!open) return null

  const costNum = Number(totalCost)
  const priceNum = Number(pricePerGallon)
  const gallons = costNum > 0 && priceNum > 0 ? costNum / priceNum : null

  const stationLabel =
    stationId === OTHER
      ? otherName.trim() || 'Other'
      : stations.find((s) => s.id === stationId)?.name ?? 'Other'

  const valid =
    !!date &&
    Number(odometer) > 0 &&
    costNum > 0 &&
    priceNum > 0 &&
    (stationId !== OTHER || otherName.trim().length > 0)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!valid || gallons == null) return
    const lvl = Number(fuelLevelAfter)
    onSubmit({
      id: entry?.id ?? newId(),
      date,
      odometer: Number(odometer),
      gallons,
      pricePerGallon: priceNum,
      totalCost: costNum,
      stationId: stationId === OTHER ? OTHER : stationId,
      stationName: stationLabel,
      filledToFull,
      fuelLevelAfter: Number.isFinite(lvl) ? lvl : undefined,
    })
  }

  const odometerPlaceholder =
    lastOdometer != null ? `> ${lastOdometer.toLocaleString()}` : '32450'

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm animate-modal-backdrop">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <form
        onSubmit={submit}
        className="relative w-full max-w-md mx-auto bg-surface rounded-t-3xl sm:rounded-3xl p-5 pb-[max(env(safe-area-inset-bottom),1.25rem)] shadow-2xl animate-modal-sheet"
      >
        <div
          aria-hidden
          className="sm:hidden mx-auto mb-3 w-10 h-1.5 rounded-full bg-line-strong"
        />
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {isEdit ? 'Edit fill-up' : 'Log fill-up'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 -mr-2 rounded-full text-ink-2 hover:text-ink hover:bg-black/5 dark:hover:bg-white/5"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Date">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputCls}
              required
            />
          </Field>
          <Field label="Odometer (mi)">
            <input
              type="number"
              inputMode="decimal"
              value={odometer}
              onChange={(e) => setOdometer(e.target.value)}
              placeholder={odometerPlaceholder}
              className={inputCls}
              required
            />
          </Field>

          {/* Station picker is now BEFORE cost so changing station auto-fills
              $/gal before the user types the cost. */}
          <Field label="Station" full>
            <select
              value={stationId}
              onChange={(e) => handleStationChange(e.target.value)}
              className={inputCls}
            >
              {stations.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
              <option value={OTHER}>Other…</option>
            </select>
          </Field>
          {stationId === OTHER && (
            <Field label="Station name" full>
              <input
                type="text"
                value={otherName}
                onChange={(e) => setOtherName(e.target.value)}
                placeholder="e.g. Shell Mira Mesa"
                className={inputCls}
              />
            </Field>
          )}

          <Field label="Total cost">
            <PrefixedInput
              prefix="$"
              type="number"
              inputMode="decimal"
              step="0.01"
              value={totalCost}
              onChange={(v) => setTotalCost(v)}
              placeholder="86.78"
              required
            />
          </Field>
          <Field label="$/gal">
            <input
              type="number"
              inputMode="decimal"
              step="0.001"
              value={pricePerGallon}
              onChange={(e) => setPricePerGallon(e.target.value)}
              placeholder="6.099"
              className={inputCls}
              required
            />
          </Field>

          {gallons != null && (
            <div className="col-span-2 -mt-1 px-1 text-xs text-ink-2 tabular-nums">
              ≈ {gallons.toFixed(3)} gal at ${priceNum.toFixed(3)}/gal
            </div>
          )}

          <div className="col-span-2 mt-1 flex items-start justify-between gap-3 p-3 rounded-xl bg-surface-2 border border-line">
            <div>
              <div className="text-sm font-medium text-ink">Filled to full</div>
              <div className="mt-0.5 text-xs text-ink-2">
                MPG is computed between full fills. Uncheck for partial fills.
              </div>
            </div>
            <Toggle checked={filledToFull} onChange={setFilledToFull} />
          </div>

          {!filledToFull && (
            <Field label="Fuel level after (%)" full>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={100}
                value={fuelLevelAfter}
                onChange={(e) => setFuelLevelAfter(e.target.value)}
                className={inputCls}
              />
            </Field>
          )}
        </div>

        <button
          type="submit"
          disabled={!valid}
          className="mt-5 w-full py-3 rounded-2xl bg-accent hover:bg-accent-hover active:bg-accent-press active:scale-[0.98] motion-reduce:transform-none disabled:bg-surface-2 disabled:text-ink-3 disabled:active:scale-100 text-white font-semibold transition"
        >
          {isEdit ? 'Save changes' : 'Save'}
        </button>
      </form>
    </div>
  )
}

function autoFillPrice(station: Station | undefined): string {
  if (!station) return ''
  const price = latestPriceFor(station, 'premium')
  return price != null ? price.toFixed(3) : ''
}

// Explicit h-11 (= 44px, Apple HIG minimum tap target) keeps every input
// the same height regardless of type. Without it, iOS Safari sizes date,
// select, and text inputs slightly differently and the grid drifts.
const inputCls =
  'block w-full h-11 px-3 rounded-xl bg-surface-2 border border-line-strong text-ink text-base placeholder-ink-3 focus:outline-none focus:border-accent transition-colors'

interface PrefixedInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  prefix: string
  value: string
  onChange: (next: string) => void
}

function PrefixedInput({ prefix, value, onChange, ...rest }: PrefixedInputProps) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-2 text-base pointer-events-none select-none">
        {prefix}
      </span>
      <input
        {...rest}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        // pl-6 puts typed text ~4px past the $ sign — tight but never overlapping.
        className={inputCls + ' pl-6'}
      />
    </div>
  )
}

function Field({
  label,
  full,
  children,
}: {
  label: string
  full?: boolean
  children: React.ReactNode
}) {
  return (
    <label className={'flex flex-col gap-1.5 ' + (full ? 'col-span-2' : '')}>
      <span className="text-xs uppercase tracking-wider text-ink-3 font-medium">
        {label}
      </span>
      {children}
    </label>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (next: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={
        'relative shrink-0 w-11 h-6 rounded-full transition-colors ' +
        (checked ? 'bg-accent' : 'bg-line-strong')
      }
    >
      <span
        className={
          'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ' +
          (checked ? 'translate-x-5' : 'translate-x-0')
        }
      />
    </button>
  )
}
