import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { computeMpgHistory } from '../utils/fuelLog'
import { shortDate } from '../utils/prices'
import type { FuelLogEntry } from '../types'

export function MpgTrendChart({ entries }: { entries: FuelLogEntry[] }) {
  const points = computeMpgHistory(entries)

  if (points.length < 1) {
    return (
      <div className="rounded-2xl bg-neutral-900 border border-white/[0.04] p-6 text-center text-sm text-neutral-500">
        Log at least two full fill-ups to see your MPG trend.
      </div>
    )
  }

  const data = points.map((p) => ({
    dateLabel: shortDate(p.date),
    mpg: Number(p.mpg.toFixed(2)),
  }))
  const avg = data.reduce((a, b) => a + b.mpg, 0) / data.length

  return (
    <div className="rounded-2xl bg-neutral-900 border border-white/[0.04] p-4">
      <div className="mb-3 px-2 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-neutral-200">MPG trend</h2>
        <span className="text-xs text-neutral-500 tabular-nums">
          avg {avg.toFixed(1)} mpg
        </span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: -12 }}>
          <defs>
            <linearGradient id="mpgFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.05} />
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
            domain={['dataMin - 2', 'dataMax + 2']}
            tickFormatter={(v: number) => `${v}`}
          />
          <Tooltip
            contentStyle={{
              background: '#171717',
              border: '1px solid #262626',
              borderRadius: 12,
              fontSize: 12,
            }}
            labelStyle={{ color: '#e5e5e5' }}
            formatter={(value: number) => [`${value.toFixed(1)} mpg`, 'MPG']}
          />
          <ReferenceLine
            y={avg}
            stroke="#525252"
            strokeDasharray="3 3"
            label={{
              value: 'avg',
              position: 'insideTopRight',
              fill: '#737373',
              fontSize: 10,
            }}
          />
          <Area
            type="monotone"
            dataKey="mpg"
            stroke="#60a5fa"
            strokeWidth={2}
            fill="url(#mpgFill)"
            dot={{ r: 3, fill: '#60a5fa', stroke: '#0a0a0a', strokeWidth: 2 }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
