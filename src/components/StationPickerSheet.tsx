import { Check, X } from 'lucide-react'
import type { FuelType, Station } from '../types'
import { formatPrice, latestPriceFor } from '../utils/prices'
import { getMeta } from '../data/stationMeta'

interface StationPickerSheetProps {
  open: boolean
  stations: Station[]
  selectedId: string
  fuel: FuelType
  onClose: () => void
  onSelect: (id: string) => void
}

export function StationPickerSheet({
  open,
  stations,
  selectedId,
  fuel,
  onClose,
  onSelect,
}: StationPickerSheetProps) {
  if (!open) return null

  // Sort by price ascending so the cheapest are easy to spot.
  const sorted = [...stations].sort((a, b) => {
    const ap = latestPriceFor(a, fuel) ?? Infinity
    const bp = latestPriceFor(b, fuel) ?? Infinity
    return ap - bp
  })

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <div className="relative w-full max-w-md mx-auto bg-neutral-900 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between p-5 pb-3">
          <h3 className="text-lg font-semibold">Choose home station</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 -mr-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/5"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-[max(env(safe-area-inset-bottom),0.75rem)]">
          {sorted.map((s) => {
            const price = latestPriceFor(s, fuel)
            const meta = getMeta(s.id)
            const active = s.id === selectedId
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  onSelect(s.id)
                  onClose()
                }}
                className={
                  'w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ' +
                  (active ? 'bg-white/5' : 'hover:bg-white/5')
                }
              >
                <div className="flex-1 text-left min-w-0">
                  <div className="text-sm font-medium text-neutral-100 truncate">
                    {s.name}
                  </div>
                  {meta.neighborhood && (
                    <div className="text-xs text-neutral-500 truncate">
                      {meta.neighborhood}
                    </div>
                  )}
                </div>
                <div className="text-sm tabular-nums text-neutral-300 shrink-0">
                  {formatPrice(price)}
                </div>
                <div className="w-5 shrink-0">
                  {active && <Check className="w-4 h-4 text-blue-400" />}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
