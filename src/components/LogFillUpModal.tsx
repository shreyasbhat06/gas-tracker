import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import type { FuelLogEntry, Station } from '../types'
import { newId } from '../utils/fuelLog'

interface LogFillUpModalProps {
  open: boolean
  stations: Station[]
  onClose: () => void
  onSubmit: (entry: FuelLogEntry) => void
}

const OTHER = '__other__'

export function LogFillUpModal({ open, stations, onClose, onSubmit }: LogFillUpModalProps) {
  const today = new Date().toISOString().slice(0, 10)
  const [date, setDate] = useState(today)
  const [odometer, setOdometer] = useState('')
  const [gallons, setGallons] = useState('')
  const [pricePerGallon, setPricePerGallon] = useState('')
  const [stationId, setStationId] = useState(stations[0]?.id ?? OTHER)
  const [otherName, setOtherName] = useState('')
  const [filledToFull, setFilledToFull] = useState(true)
  const [fuelLevelAfter, setFuelLevelAfter] = useState('100')

  useEffect(() => {
    if (!open) return
    setDate(today)
    setOdometer('')
    setGallons('')
    setPricePerGallon('')
    setStationId(stations[0]?.id ?? OTHER)
    setOtherName('')
    setFilledToFull(true)
    setFuelLevelAfter('100')
  }, [open])

  if (!open) return null

  const stationLabel =
    stationId === OTHER
      ? otherName.trim() || 'Other'
      : stations.find((s) => s.id === stationId)?.name ?? 'Other'

  const valid =
    !!date &&
    Number(odometer) > 0 &&
    Number(gallons) > 0 &&
    Number(pricePerGallon) > 0 &&
    (stationId !== OTHER || otherName.trim().length > 0)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!valid) return
    const lvl = Number(fuelLevelAfter)
    onSubmit({
      id: newId(),
      date,
      odometer: Number(odometer),
      gallons: Number(gallons),
      pricePerGallon: Number(pricePerGallon),
      stationId: stationId === OTHER ? OTHER : stationId,
      stationName: stationLabel,
      filledToFull,
      fuelLevelAfter: Number.isFinite(lvl) ? lvl : undefined,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <form
        onSubmit={submit}
        className="relative w-full max-w-md mx-auto bg-neutral-900 rounded-t-3xl sm:rounded-3xl p-5 pb-[max(env(safe-area-inset-bottom),1.25rem)] shadow-2xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Log fill-up</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 -mr-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/5"
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
              placeholder="32450"
              className={inputCls}
              required
            />
          </Field>
          <Field label="Gallons">
            <input
              type="number"
              inputMode="decimal"
              step="0.001"
              value={gallons}
              onChange={(e) => setGallons(e.target.value)}
              placeholder="14.231"
              className={inputCls}
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

          <Field label="Station" full>
            <select
              value={stationId}
              onChange={(e) => setStationId(e.target.value)}
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

          <div className="col-span-2 mt-1 flex items-start justify-between gap-3 p-3 rounded-xl bg-neutral-800/70 border border-neutral-700/60">
            <div>
              <div className="text-sm font-medium text-neutral-100">Filled to full</div>
              <div className="mt-0.5 text-xs text-neutral-400">
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
          className="mt-5 w-full py-3 rounded-2xl bg-blue-500 hover:bg-blue-400 active:bg-blue-600 disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-semibold transition-colors"
        >
          Save
        </button>
      </form>
    </div>
  )
}

const inputCls =
  'w-full px-3 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-base placeholder-neutral-500 focus:outline-none focus:border-blue-500'

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
      <span className="text-xs uppercase tracking-wider text-neutral-500 font-medium">
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
        (checked ? 'bg-blue-500' : 'bg-neutral-700')
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
