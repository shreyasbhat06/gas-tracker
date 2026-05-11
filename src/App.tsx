import { useEffect, useState } from 'react'
import { Fuel } from 'lucide-react'
import { Tabs } from './components/Tabs'
import { PricesTab } from './components/PricesTab'
import { FuelLogTab } from './components/FuelLogTab'
import { loadPrices } from './utils/prices'
import type { PricesData } from './types'

type TabKey = 'prices' | 'fuel'

const BASE = import.meta.env.BASE_URL // '/gas-tracker/'

function App() {
  const [tab, setTab] = useState<TabKey>('prices')
  const [data, setData] = useState<PricesData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    loadPrices(BASE)
      .then((d) => !cancelled && setData(d))
      .catch((e) => !cancelled && setError(String(e)))
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="max-w-xl mx-auto px-4 pt-[max(env(safe-area-inset-top),1rem)] pb-6 safe-bottom">
        <header className="flex items-center gap-2.5 mb-5">
          <Fuel className="w-6 h-6 text-neutral-300" />
          <h1 className="text-xl font-semibold tracking-tight">Gas Tracker</h1>
        </header>

        <Tabs<TabKey>
          value={tab}
          onChange={setTab}
          options={[
            { value: 'prices', label: 'Prices' },
            { value: 'fuel', label: 'Fuel Log' },
          ]}
        />

        <main className="mt-5">
          {tab === 'prices' &&
            (error ? (
              <ErrorBlock message={error} />
            ) : !data ? (
              <LoadingBlock />
            ) : (
              <PricesTab data={data} />
            ))}
          {tab === 'fuel' && <FuelLogTab stations={data?.stations ?? []} />}
        </main>
      </div>
    </div>
  )
}

function LoadingBlock() {
  return (
    <div className="rounded-2xl bg-neutral-900 p-6 text-neutral-400 text-sm">
      Loading prices…
    </div>
  )
}

function ErrorBlock({ message }: { message: string }) {
  return (
    <div className="rounded-2xl bg-neutral-900 p-6">
      <p className="text-rose-400 text-sm font-medium mb-1">Failed to load prices</p>
      <p className="text-neutral-400 text-xs break-words">{message}</p>
    </div>
  )
}

export default App
