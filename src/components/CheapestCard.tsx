import { Navigation, TrendingDown } from 'lucide-react'
import type { FuelType, Station } from '../types'
import { getMeta } from '../data/stationMeta'
import { formatPrice, latestPriceFor } from '../utils/prices'

interface CheapestCardProps {
  station: Station
  fuel: FuelType
  /** When the cheapest IS the user's favorite, render a subtler "you're already
   *  at the cheapest" variant. */
  isFavorite?: boolean
}

export function CheapestCard({ station, fuel, isFavorite = false }: CheapestCardProps) {
  const price = latestPriceFor(station, fuel)
  const meta = getMeta(station.id)
  const mapsUrl = `maps://?daddr=${encodeURIComponent(meta.mapsQuery)}`

  if (isFavorite) {
    return (
      <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-300/90">
        <TrendingDown className="w-4 h-4 shrink-0" />
        <div className="text-sm">
          Your station is the cheapest{' '}
          <span className="capitalize">{fuel}</span> right now.
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-neutral-900 border border-neutral-800">
      <div className="w-9 h-9 rounded-full bg-emerald-500/15 text-emerald-400 grid place-items-center shrink-0">
        <TrendingDown className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium">
          Cheapest <span className="capitalize">{fuel}</span>
        </div>
        <div className="text-sm font-medium text-neutral-100 truncate">
          {station.name}
          {meta.neighborhood && (
            <span className="text-neutral-500"> · {meta.neighborhood}</span>
          )}
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-lg font-semibold tabular-nums">{formatPrice(price)}</div>
      </div>
      <a
        href={mapsUrl}
        className="p-2 rounded-full text-neutral-300 hover:bg-white/5 active:bg-white/10"
        aria-label="Directions"
      >
        <Navigation className="w-4 h-4" />
      </a>
    </div>
  )
}
