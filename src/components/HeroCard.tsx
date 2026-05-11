import { ChevronDown, MapPin, Navigation, Star } from 'lucide-react'
import type { FuelType, Station } from '../types'
import { getMeta } from '../data/stationMeta'
import { formatPrice, latestPriceFor } from '../utils/prices'

interface HeroCardProps {
  station: Station
  fuel: FuelType
  /** Open the station picker sheet. */
  onChangeStation: () => void
}

export function HeroCard({ station, fuel, onChangeStation }: HeroCardProps) {
  const price = latestPriceFor(station, fuel)
  const meta = getMeta(station.id)
  const mapsUrl = `maps://?daddr=${encodeURIComponent(meta.mapsQuery)}`

  return (
    <div className="relative overflow-hidden rounded-3xl bg-neutral-900 shadow-lg">
      {/* Subtle BMW M-style blue→purple wash. */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-90 pointer-events-none"
        style={{
          background:
            'radial-gradient(120% 80% at 0% 0%, rgba(59,130,246,0.22), transparent 60%), radial-gradient(120% 80% at 100% 100%, rgba(139,92,246,0.22), transparent 60%)',
        }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, rgba(96,165,250,0.0), rgba(96,165,250,0.6), rgba(167,139,250,0.6), rgba(167,139,250,0.0))',
        }}
      />

      <div className="relative p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-blue-300/80 font-medium">
            <Star className="w-3.5 h-3.5 fill-blue-300/80 text-blue-300/80" />
            <span>Home station — {fuel}</span>
          </div>
          <button
            type="button"
            onClick={onChangeStation}
            className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-white px-2 py-1 rounded-lg hover:bg-white/5"
          >
            Change
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-5xl font-semibold tabular-nums tracking-tight">
            {formatPrice(price)}
          </span>
          <span className="text-neutral-400 text-sm">/ gal</span>
        </div>

        <div className="mt-3 text-lg font-medium text-neutral-100">{station.name}</div>
        {meta.neighborhood && (
          <div className="mt-0.5 flex items-center gap-1 text-sm text-neutral-400">
            <MapPin className="w-3.5 h-3.5" />
            <span>in {meta.neighborhood}</span>
          </div>
        )}

        <a
          href={mapsUrl}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 active:bg-white/20 transition-colors text-sm font-medium text-white backdrop-blur-sm"
        >
          <Navigation className="w-4 h-4" />
          Directions
        </a>
      </div>
    </div>
  )
}
