import { useEffect, useState } from 'react'
import type { FuelType, PricesData } from '../types'
import { cheapest, formatLastUpdated, latestTimestamp } from '../utils/prices'
import { loadFavoriteId, saveFavoriteId } from '../utils/favorite'
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

      <FuelToggle value={fuel} onChange={setFuel} />

      <PriceBarChart stations={stations} fuel={fuel} />
      <PriceTrendChart stations={stations} fuel={fuel} />

      <p className="text-center text-xs text-neutral-500">
        Last updated {formatLastUpdated(updated)}
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

function FuelToggle({ value, onChange }: { value: FuelType; onChange: (v: FuelType) => void }) {
  return (
    <div className="flex gap-1 p-1 bg-neutral-900 rounded-2xl">
      {(['premium', 'regular'] as const).map((opt) => {
        const active = opt === value
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={
              'flex-1 py-2 px-4 rounded-xl text-sm font-medium capitalize transition-colors ' +
              (active
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200')
            }
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}
