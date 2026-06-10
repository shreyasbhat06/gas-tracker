import { useEffect, useState } from 'react'
import { Fuel, Moon, MonitorSmartphone, Sun } from 'lucide-react'
import { SegmentedControl } from './components/SegmentedControl'
import { PricesTab } from './components/PricesTab'
import { FuelLogTab } from './components/FuelLogTab'
import { loadPrices } from './utils/prices'
import { useTheme, type ThemePref } from './utils/theme'
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
    <div className="min-h-screen bg-app text-ink">
      <div className="max-w-xl lg:max-w-5xl mx-auto px-4 lg:px-8 pt-[max(env(safe-area-inset-top),1rem)] pb-6 safe-bottom">
        <header className="flex items-center gap-2.5 mb-5">
          <Fuel className="w-6 h-6 text-ink-2" />
          <h1 className="text-xl font-semibold tracking-tight">Gas Tracker</h1>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>

        <div className="lg:w-[360px]">
          <SegmentedControl<TabKey>
            value={tab}
            onChange={setTab}
            label="Section"
            options={[
              { value: 'prices', label: 'Prices' },
              { value: 'fuel', label: 'Fuel Log' },
            ]}
          />
        </div>

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

// Cycles System → Light → Dark. One quiet icon button, not a settings page —
// the default (system) is right for almost everyone.
const THEME_CYCLE: Record<ThemePref, ThemePref> = {
  system: 'light',
  light: 'dark',
  dark: 'system',
}

function ThemeToggle() {
  const { pref, setPref } = useTheme()
  const Icon =
    pref === 'system' ? MonitorSmartphone : pref === 'light' ? Sun : Moon
  const labels: Record<ThemePref, string> = {
    system: 'Theme: automatic',
    light: 'Theme: light',
    dark: 'Theme: dark',
  }
  return (
    <button
      type="button"
      onClick={() => setPref(THEME_CYCLE[pref])}
      aria-label={`${labels[pref]} — tap to change`}
      title={labels[pref]}
      className="p-2.5 -mr-2 rounded-full text-ink-2 hover:text-ink hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 motion-reduce:transform-none transition"
    >
      <Icon className="w-5 h-5" />
    </button>
  )
}

function LoadingBlock() {
  return (
    <div className="flex flex-col gap-4 animate-pulse lg:grid lg:grid-cols-[minmax(320px,380px)_1fr] lg:items-start lg:gap-6">
      <div className="contents lg:flex lg:flex-col lg:gap-4">
        <div className="h-44 rounded-3xl bg-surface" />
        <div className="h-16 rounded-2xl bg-surface" />
        <div className="h-11 rounded-2xl bg-surface" />
      </div>
      <div className="contents lg:flex lg:flex-col lg:gap-4">
        <div className="h-72 rounded-2xl bg-surface" />
        <div className="hidden lg:block h-72 rounded-2xl bg-surface" />
      </div>
    </div>
  )
}

function ErrorBlock({ message }: { message: string }) {
  return (
    <div className="card p-6">
      <p className="text-rose-600 dark:text-rose-400 text-sm font-medium mb-1">
        Failed to load prices
      </p>
      <p className="text-ink-2 text-xs break-words">{message}</p>
    </div>
  )
}

export default App
