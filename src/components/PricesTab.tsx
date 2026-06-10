import { useEffect, useState } from 'react'
import type { FuelType, PricesData } from '../types'
import { cheapest, formatLastUpdated, isFresh, latestTimestamp } from '../utils/prices'
import { loadFavoriteId, saveFavoriteId } from '../utils/favorite'
import { SegmentedControl } from './SegmentedControl'
import { HeroCard } from './HeroCard'
import { CheapestCard } from './CheapestCard'
import { PriceBarChart } from './PriceBarChart'
import { PriceTrendChart } from './PriceTrendChart'
import { StationPickerSheet } from './StationPickerSheet'

export function PricesTab({ data }: { data: PricesData }) {
  const [fuel, setFuel] = useState<FuelType>('premium')
  const [favId, setFavId] = useState<string>(() => loadFavoriteId())
  const [pickerOpen, setPickerOpen] = useState(false)

  useEffect(() => {
    saveFavoriteId(favId)
  }, [favId])

  const stations = data.stations
  const fav =
    stations.find((s) => s.id === favId) ?? stations[0] ?? null
  const top = cheapest(stations, fuel)
  const updated = latestTimestamp(stations)
  const favIsCheapest = !!(fav && top && fav.id === top.id)

  return (
    <div className="flex flex-col gap-4">
      {fav && (
        <HeroCard
          station={fav}
          fuel={fuel}
          onChangeStation={() => setPickerOpen(true)}
        />
      )}

      {top && (
        <CheapestCard station={top} fuel={fuel} isFavorite={favIsCheapest} />
      )}

      <SegmentedControl<FuelType>
        value={fuel}
        onChange={setFuel}
        label="Fuel type"
        options={[
          { value: 'premium', label: 'Premium' },
          { value: 'regular', label: 'Regular' },
        ]}
      />

      <PriceBarChart stations={stations} fuel={fuel} favoriteId={fav?.id ?? null} />
      <PriceTrendChart stations={stations} fuel={fuel} favoriteId={fav?.id ?? null} />

      <p className="text-center text-xs text-ink-3 inline-flex items-center justify-center gap-1.5 self-center">
        <LiveDot fresh={isFresh(updated)} />
        Updated {formatLastUpdated(updated)}
      </p>

      <StationPickerSheet
        open={pickerOpen}
        stations={stations}
        selectedId={favId}
        fuel={fuel}
        onClose={() => setPickerOpen(false)}
        onSelect={setFavId}
      />
    </div>
  )
}

function LiveDot({ fresh }: { fresh: boolean }) {
  const color = fresh ? 'bg-emerald-500' : 'bg-ink-3'
  return (
    <span className="relative flex w-1.5 h-1.5">
      {fresh && (
        <span
          aria-hidden
          className={`absolute inset-0 rounded-full ${color} animate-ping opacity-60`}
        />
      )}
      <span className={`relative w-1.5 h-1.5 rounded-full ${color}`} />
    </span>
  )
}
