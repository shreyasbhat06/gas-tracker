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
import { useChartTheme } from '../utils/chartTheme'
import { shortDate } from '../utils/prices'
import type { FuelLogEntry } from '../types'

export function MpgTrendChart({ entries }: { entries: FuelLogEntry[] }) {
  const t = useChartTheme()
  const points = computeMpgHistory(entries)

  if (points.length < 1) {
    return (
      <div className="card p-6 text-center text-sm text-ink-3">
        Log at least two full fill-ups to see your MPG trend.
      </div>
    )
  }

  const data = points.map((p) => ({
    dateLabel: shortDate(p.date),
    mpg: Number(p.mpg.toFixed(2)),
  }))
  const avg = data.reduce((a, b) => a + b.mpg, 0) / data.length
  const stroke = t.lineAccent

  return (
    <div className="card p-4">
      <div className="mb-3 px-2 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-ink">MPG trend</h2>
        <span className="text-xs text-ink-3 tabular-nums">
          avg {avg.toFixed(1)} mpg
        </span>
      </div>
      <div className="h-[220px] lg:h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: -12 }}>
            <defs>
              <linearGradient id="mpgFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={stroke} stopOpacity={0.35} />
                <stop offset="100%" stopColor={stroke} stopOpacity={0.04} />
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
              domain={['dataMin - 2', 'dataMax + 2']}
              tickFormatter={(v: number) => `${v}`}
            />
            <Tooltip
              contentStyle={t.tooltipStyle}
              labelStyle={t.tooltipText}
              itemStyle={t.tooltipText}
              formatter={(value: number) => [`${value.toFixed(1)} mpg`, 'MPG']}
            />
            <ReferenceLine
              y={avg}
              stroke={t.barNeutral}
              strokeDasharray="3 3"
              label={{
                value: 'avg',
                position: 'insideTopRight',
                fill: t.axisText,
                fontSize: 10,
              }}
            />
            <Area
              type="monotone"
              dataKey="mpg"
              stroke={stroke}
              strokeWidth={2}
              fill="url(#mpgFill)"
              dot={{ r: 3, fill: stroke, stroke: t.bg, strokeWidth: 2 }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
