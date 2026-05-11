import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { FuelType, Station } from '../types'
import { latestPriceFor } from '../utils/prices'

interface PriceBarChartProps {
  stations: Station[]
  fuel: FuelType
}

export function PriceBarChart({ stations, fuel }: PriceBarChartProps) {
  const rows = stations
    .map((s) => ({ name: s.name, price: latestPriceFor(s, fuel) }))
    .filter((r): r is { name: string; price: number } => r.price != null)
    .sort((a, b) => a.price - b.price)

  if (!rows.length) {
    return (
      <div className="rounded-2xl bg-neutral-900 p-6 text-neutral-400 text-sm">
        No prices yet.
      </div>
    )
  }

  const min = rows[0].price
  const max = rows[rows.length - 1].price
  // Pad the domain a little so the cheapest bar isn't a 1px sliver.
  const xMin = Math.max(0, min - 0.05)
  const xMax = max + 0.02
  const height = Math.max(220, rows.length * 28 + 32)

  return (
    <div className="rounded-2xl bg-neutral-900 p-4">
      <div className="mb-3 px-2 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-neutral-200">All stations</h2>
        <span className="text-xs text-neutral-500">sorted by price</span>
      </div>
      <ResponsiveContainer width="100%" height={height}>
        {/* Extra right margin gives the inline price labels room to render
            outside the bar tip without being clipped. */}
        <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 56, bottom: 4, left: 0 }}>
          <CartesianGrid stroke="#262626" horizontal={false} />
          <XAxis
            type="number"
            domain={[xMin, xMax]}
            tickFormatter={(v) => `$${v.toFixed(2)}`}
            stroke="#525252"
            tick={{ fill: '#a3a3a3', fontSize: 11 }}
          />
          <YAxis
            type="category"
            dataKey="name"
            stroke="#525252"
            tick={{ fill: '#d4d4d4', fontSize: 12 }}
            width={108}
          />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
            contentStyle={{
              background: '#171717',
              border: '1px solid #262626',
              borderRadius: 12,
              fontSize: 12,
            }}
            labelStyle={{ color: '#e5e5e5' }}
            formatter={(value: number) => [`$${value.toFixed(3)}`, 'Price']}
          />
          <Bar dataKey="price" radius={[0, 6, 6, 0]}>
            {rows.map((r, i) => (
              <Cell key={r.name} fill={i === 0 ? '#34d399' : '#525252'} />
            ))}
            <LabelList
              dataKey="price"
              position="right"
              formatter={(value: number | string | undefined) =>
                typeof value === 'number' ? `$${value.toFixed(3)}` : ''
              }
              fill="#d4d4d4"
              fontSize={11}
              style={{ fontVariantNumeric: 'tabular-nums' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
