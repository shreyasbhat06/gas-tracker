import { ChevronDown, MapPin, Navigation, Star } from 'lucide-react'
import type { FuelType, Station } from '../types'
import { getMeta } from '../data/stationMeta'
import { directionsUrl } from '../utils/maps'
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
  const mapsUrl = directionsUrl(meta.mapsQuery)

  return (
    // The one branded surface in the app. All colors flow from --hero-*
    // tokens so the card renders natively in light mode (soft pastel wash on
    // white) and dark mode (deep glow), and skins can retint it from CSS.
    <div
      className="relative overflow-hidden rounded-3xl border border-line"
      style={{ background: 'var(--hero-bg)', boxShadow: 'var(--hero-shadow)' }}
    >
      {/* Subtle BMW M-style wash (skin-tinted). */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-90 pointer-events-none"
        style={{
          background:
            'radial-gradient(120% 80% at 0% 0%, var(--hero-glow-1), transparent 60%), radial-gradient(120% 80% at 100% 100%, var(--hero-glow-2), transparent 60%)',
        }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, var(--hero-line-1), var(--hero-line-2), transparent)',
        }}
      />

      <div className="relative p-6">
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-1.5 text-xs uppercase tracking-wider font-medium"
            style={{ color: 'var(--hero-label)' }}
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>Home station — {fuel}</span>
          </div>
          <button
            type="button"
            onClick={onChangeStation}
            className="inline-flex items-center gap-1 text-xs text-ink-2 hover:text-ink px-2.5 py-1.5 rounded-lg bg-black/[0.04] hover:bg-black/[0.07] active:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 dark:active:bg-white/15 active:scale-[0.97] motion-reduce:transform-none transition"
          >
            Change
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-[3.25rem] font-semibold tabular-nums tracking-tighter leading-none text-ink">
            {formatPrice(price)}
          </span>
          <span className="text-ink-2 text-sm">/ gal</span>
        </div>

        <div className="mt-3 text-lg font-medium text-ink">{station.name}</div>
        {meta.neighborhood && (
          <div className="mt-0.5 flex items-center gap-1 text-sm text-ink-2">
            <MapPin className="w-3.5 h-3.5" />
            <span>in {meta.neighborhood}</span>
          </div>
        )}

        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black/[0.05] hover:bg-black/[0.08] active:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15 dark:active:bg-white/20 active:scale-[0.97] motion-reduce:transform-none transition text-sm font-medium text-ink"
        >
          <Navigation className="w-4 h-4" />
          Directions
        </a>
      </div>
    </div>
  )
}
