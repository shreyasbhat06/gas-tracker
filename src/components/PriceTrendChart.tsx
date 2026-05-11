import { useState } from 'react'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { FuelType, Station } from '../types'
import { buildTrendSeries } from '../utils/prices'
import { colorFor } from '../data/stationMeta'

interface PriceTrendChartProps {
  stations: Station[]
  fuel: FuelType
  favoriteId: string | null
}

type Mode = 'range' | 'all'

export function PriceTrendChart({ stations, fuel, favoriteId }: PriceTrendChartProps) {
  const [mode, setMode] = useState<Mode>('range')
  const data = buildTrendSeries(stations, fuel, 30)

  return (
    <div className="rounded-2xl bg-neutral-900 border border-white/[0.04] p-4">
      <div className="mb-3 px-2 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-neutral-200">30-day trend</h2>
        <ModeToggle value={mode} onChange={setMode} />
      </div>

      {data.length === 0 ? (
        <div className="px-2 py-8 text-center text-sm text-neutral-500">
          No history yet — run the scraper a few times to fill this in.
        </div>
      ) : mode === 'range' ? (
        <RangeChart stations={stations} favoriteId={favoriteId} data={data} />
      ) : (
        <AllChart stations={stations} data={data} />
      )}
    </div>
  )
}

function ModeToggle({ value, onChange }: { value: Mode; onChange: (v: Mode) => void }) {
  return (
    <div className="flex gap-0.5 p-0.5 bg-neutral-800 rounded-lg text-[11px]">
      {(['range', 'all'] as const).map((m) => {
        const active = m === value
        return (
          <button
            key={m}
            type="button"
            onClick={() => onChange(m)}
            className={
              'px-2.5 py-1 rounded-md font-medium capitalize transition-colors ' +
              (active ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-neutral-200')
            }
          >
            {m === 'range' ? 'Range' : 'All'}
          </button>
        )
      })}
    </div>
  )
}

// --- Range mode: min/max envelope + favorite line on top ---

interface RangeChartProps {
  stations: Station[]
  favoriteId: string | null
  data: Array<Record<string, string | number>>
}

function RangeChart({ stations, favoriteId, data }: RangeChartProps) {
  const ids = stations.map((s) => s.id)
  const fav = stations.find((s) => s.id === favoriteId) ?? null

  const enriched = data.map((row) => {
    const prices = ids
      .map((id) => row[id])
      .filter((v): v is number => typeof v === 'number')
    const min = prices.length ? Math.min(...prices) : null
    const max = prices.length ? Math.max(...prices) : null
    return {
      ...row,
      // Recharts Area accepts a tuple dataKey for ranges (low, high).
      range: min != null && max != null ? [min, max] : undefined,
      min,
      max,
    }
  })

  return (
    <>
      <div className="px-2 pb-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-neutral-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-1 rounded-full bg-blue-500 inline-block" />
          {fav ? fav.name : 'Your station'}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-2 rounded-sm bg-neutral-600/50 inline-block" />
          Range across all stations
        </span>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={enriched} margin={{ top: 4, right: 12, bottom: 4, left: -12 }}>
          <defs>
            <linearGradient id="trendRangeFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#737373" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#737373" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#262626" />
          <XAxis
            dataKey="dateLabel"
            stroke="#525252"
            tick={{ fill: '#a3a3a3', fontSize: 11 }}
            minTickGap={20}
          />
          <YAxis
            stroke="#525252"
            tick={{ fill: '#a3a3a3', fontSize: 11 }}
            tickFormatter={(v: number) => `$${v.toFixed(2)}`}
            domain={['dataMin - 0.05', 'dataMax + 0.05']}
          />
          <Tooltip
            contentStyle={{
              background: '#171717',
              border: '1px solid #262626',
              borderRadius: 12,
              fontSize: 12,
            }}
            labelStyle={{ color: '#e5e5e5' }}
            formatter={(value: unknown, name: string) => {
              if (Array.isArray(value)) {
                const [lo, hi] = value as [number, number]
                return [`$${lo.toFixed(3)} – $${hi.toFixed(3)}`, 'Range']
              }
              if (typeof value === 'number') {
                return [`$${value.toFixed(3)}`, name]
              }
              return [String(value), name]
            }}
          />
          <Area
            type="monotone"
            dataKey="range"
            stroke="none"
            fill="url(#trendRangeFill)"
            isAnimationActive={false}
            connectNulls
          />
          {fav && (
            <Line
              dataKey={fav.id}
              name={fav.name}
              type="monotone"
              stroke="#60a5fa"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#60a5fa', stroke: '#0a0a0a', strokeWidth: 2 }}
              activeDot={{ r: 5 }}
              connectNulls
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </>
  )
}

// --- All mode: one line per station, dimmed (legend toggles visibility) ---

function AllChart({
  stations,
  data,
}: {
  stations: Station[]
  data: Array<Record<string, string | number>>
}) {
  const [hidden, setHidden] = useState<Set<string>>(new Set())
  const toggle = (id: string) => {
    const next = new Set(hidden)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setHidden(next)
  }

  return (
    <>
      <div className="flex flex-wrap gap-x-3 gap-y-1.5 px-2 pb-3 text-[11px]">
        {stations.map((s, i) => {
          const off = hidden.has(s.id)
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => toggle(s.id)}
              className={
                'inline-flex items-center gap-1.5 transition-opacity hover:opacity-100 ' +
                (off ? 'opacity-40' : 'opacity-100')
              }
              title={off ? 'Tap to show' : 'Tap to hide'}
            >
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ background: colorFor(i) }}
              />
              <span className={off ? 'text-neutral-500 line-through' : 'text-neutral-400'}>
                {s.name}
              </span>
            </button>
          )
        })}
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 4, right: 12, bottom: 4, left: -12 }}>
          <CartesianGrid stroke="#262626" />
          <XAxis
            dataKey="dateLabel"
            stroke="#525252"
            tick={{ fill: '#a3a3a3', fontSize: 11 }}
            minTickGap={20}
          />
          <YAxis
            stroke="#525252"
            tick={{ fill: '#a3a3a3', fontSize: 11 }}
            tickFormatter={(v: number) => `$${v.toFixed(2)}`}
            domain={['dataMin - 0.05', 'dataMax + 0.05']}
          />
          <Tooltip
            contentStyle={{
              background: '#171717',
              border: '1px solid #262626',
              borderRadius: 12,
              fontSize: 12,
            }}
            labelStyle={{ color: '#e5e5e5' }}
            formatter={(value: number) => `$${value.toFixed(3)}`}
          />
          {stations.map((s, i) => {
            if (hidden.has(s.id)) return null
            return (
              <Line
                key={s.id}
                dataKey={s.id}
                name={s.name}
                type="monotone"
                stroke={colorFor(i)}
                strokeWidth={2}
                dot={false}
                connectNulls
              />
            )
          })}
        </LineChart>
      </ResponsiveContainer>
    </>
  )
}
