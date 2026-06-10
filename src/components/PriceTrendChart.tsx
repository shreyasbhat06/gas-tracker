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
import { useChartTheme, type ChartTheme } from '../utils/chartTheme'
import { colorFor } from '../data/stationMeta'
import { SegmentedControl } from './SegmentedControl'

interface PriceTrendChartProps {
  stations: Station[]
  fuel: FuelType
  favoriteId: string | null
}

type Mode = 'range' | 'all'

export function PriceTrendChart({ stations, fuel, favoriteId }: PriceTrendChartProps) {
  const [mode, setMode] = useState<Mode>('range')
  const t = useChartTheme()
  const data = buildTrendSeries(stations, fuel, 30)

  return (
    <div className="card p-4">
      <div className="mb-3 px-2 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-ink">30-day trend</h2>
        <SegmentedControl<Mode>
          value={mode}
          onChange={setMode}
          label="Trend chart mode"
          size="sm"
          options={[
            { value: 'range', label: 'Range' },
            { value: 'all', label: 'All' },
          ]}
        />
      </div>

      {data.length === 0 ? (
        <div className="px-2 py-8 text-center text-sm text-ink-3">
          No history yet — run the scraper a few times to fill this in.
        </div>
      ) : mode === 'range' ? (
        <RangeChart stations={stations} favoriteId={favoriteId} data={data} t={t} />
      ) : (
        <AllChart stations={stations} data={data} t={t} />
      )}
    </div>
  )
}

// --- Range mode: min/max envelope + favorite line on top ---

interface RangeChartProps {
  stations: Station[]
  favoriteId: string | null
  data: Array<Record<string, string | number>>
  t: ChartTheme
}

function RangeChart({ stations, favoriteId, data, t }: RangeChartProps) {
  const ids = stations.map((s) => s.id)
  const fav = stations.find((s) => s.id === favoriteId) ?? null
  const favStroke = t.resolved === 'dark' ? '#60a5fa' : '#2563eb'

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
      <div className="px-2 pb-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-ink-2">
        <span className="inline-flex items-center gap-1.5">
          <span
            className="w-3 h-1 rounded-full inline-block"
            style={{ background: favStroke }}
          />
          {fav ? fav.name : 'Your station'}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="w-3 h-2 rounded-sm inline-block opacity-50"
            style={{ background: t.barNeutral }}
          />
          Range across all stations
        </span>
      </div>
      <div className="h-[240px] lg:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={enriched} margin={{ top: 4, right: 12, bottom: 4, left: -12 }}>
            <defs>
              <linearGradient id="trendRangeFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={t.barNeutral} stopOpacity={0.35} />
                <stop offset="100%" stopColor={t.barNeutral} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={t.grid} strokeDasharray="3 3" />
            <XAxis
              dataKey="dateLabel"
              axisLine={false}
              tickLine={false}
              tick={t.tick}
              minTickGap={20}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={t.tick}
              tickFormatter={(v: number) => `$${v.toFixed(2)}`}
              domain={['dataMin - 0.05', 'dataMax + 0.05']}
            />
            <Tooltip
              contentStyle={t.tooltipStyle}
              labelStyle={t.tooltipText}
              itemStyle={t.tooltipText}
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
                stroke={favStroke}
                strokeWidth={2.5}
                dot={{ r: 3, fill: favStroke, stroke: t.bg, strokeWidth: 2 }}
                activeDot={{ r: 5 }}
                connectNulls
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </>
  )
}

// --- All mode: one line per station, dimmed (legend toggles visibility) ---

function AllChart({
  stations,
  data,
  t,
}: {
  stations: Station[]
  data: Array<Record<string, string | number>>
  t: ChartTheme
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
              <span className={off ? 'text-ink-3 line-through' : 'text-ink-2'}>
                {s.name}
              </span>
            </button>
          )
        })}
      </div>
      <div className="h-[260px] lg:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 12, bottom: 4, left: -12 }}>
            <CartesianGrid stroke={t.grid} strokeDasharray="3 3" />
            <XAxis
              dataKey="dateLabel"
              axisLine={false}
              tickLine={false}
              tick={t.tick}
              minTickGap={20}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={t.tick}
              tickFormatter={(v: number) => `$${v.toFixed(2)}`}
              domain={['dataMin - 0.05', 'dataMax + 0.05']}
            />
            <Tooltip
              contentStyle={t.tooltipStyle}
              labelStyle={t.tooltipText}
              itemStyle={t.tooltipText}
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
      </div>
    </>
  )
}
