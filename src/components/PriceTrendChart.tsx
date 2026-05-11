import {
  CartesianGrid,
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
}

export function PriceTrendChart({ stations, fuel }: PriceTrendChartProps) {
  const data = buildTrendSeries(stations, fuel, 30)

  return (
    <div className="rounded-2xl bg-neutral-900 p-4">
      <div className="mb-3 px-2 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-neutral-200">30-day trend</h2>
        <span className="text-xs text-neutral-500 capitalize">{fuel}</span>
      </div>

      {data.length === 0 ? (
        <div className="px-2 py-8 text-center text-sm text-neutral-500">
          No history yet — run the scraper a few times to fill this in.
        </div>
      ) : (
        <>
          {/* Custom legend above the chart so it can wrap freely without
              eating into the y-axis. Recharts' built-in Legend reserves a
              fixed height block that overlaps with axis labels when the
              legend wraps to multiple rows. */}
          <div className="flex flex-wrap gap-x-3 gap-y-1.5 px-2 pb-3 text-[11px] text-neutral-400">
            {stations.map((s, i) => (
              <span key={s.id} className="inline-flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ background: colorFor(i) }}
                />
                {s.name}
              </span>
            ))}
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
              {stations.map((s, i) => (
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
              ))}
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  )
}
