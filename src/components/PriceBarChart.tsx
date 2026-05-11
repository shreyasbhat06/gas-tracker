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
import { latestPriceFor, priceChangeVs, type PriceChange } from '../utils/prices'

interface PriceBarChartProps {
  stations: Station[]
  fuel: FuelType
  favoriteId: string | null
}

interface Row {
  name: string
  id: string
  price: number
  change: PriceChange | null
}

/**
 * "All stations" horizontal bar chart (Recharts).
 *   - Cheapest        → emerald bar
 *   - Favorite        → blue bar (matches hero); cheapest wins if both
 *   - Others          → neutral gray
 *   - Small ↑/↓ arrow inline with the price label, colored green-down
 *     (price dropped = good) / red-up (price rose = bad). Renders nothing
 *     when there's no comparable 7-day-ago datapoint yet.
 */
export function PriceBarChart({ stations, fuel, favoriteId }: PriceBarChartProps) {
  const rows: Row[] = stations
    .map((s) => {
      const price = latestPriceFor(s, fuel)
      if (price == null) return null
      return {
        id: s.id,
        name: s.name,
        price,
        change: priceChangeVs(s, fuel, 7),
      }
    })
    .filter((r): r is Row => r !== null)
    .sort((a, b) => a.price - b.price)

  if (!rows.length) {
    return (
      <div className="rounded-2xl bg-neutral-900 border border-white/[0.04] p-6 text-neutral-400 text-sm">
        No prices yet.
      </div>
    )
  }

  const min = rows[0].price
  const max = rows[rows.length - 1].price
  // Pad the domain a little so the cheapest bar isn't a 1px sliver, and so the
  // longest bar leaves room for its inline price + arrow.
  const xMin = Math.max(0, min - 0.05)
  const xMax = max + 0.02
  const height = Math.max(220, rows.length * 30 + 32)

  const cheapestId = rows[0].id

  return (
    <div className="rounded-2xl bg-neutral-900 border border-white/[0.04] p-4">
      <div className="mb-3 px-2 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-neutral-200">All stations</h2>
        <span className="text-[11px] text-neutral-500">vs 7d</span>
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={rows}
          layout="vertical"
          margin={{ top: 4, right: 56, bottom: 4, left: 0 }}
        >
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
            formatter={(value: number, _name, item) => {
              const change = (item.payload as Row).change
              if (!change || Math.abs(change.delta) < 0.005) {
                return [`$${value.toFixed(3)}`, 'Price']
              }
              const sign = change.delta > 0 ? '+' : '−'
              return [
                `$${value.toFixed(3)}  (${sign}$${Math.abs(change.delta).toFixed(3)} vs 7d)`,
                'Price',
              ]
            }}
          />
          <Bar dataKey="price" radius={[0, 6, 6, 0]} barSize={16}>
            {rows.map((r) => (
              <Cell
                key={r.id}
                fill={
                  r.id === cheapestId
                    ? '#34d399' // emerald — cheapest
                    : r.id === favoriteId
                      ? '#3b82f6' // blue — favorite (matches hero)
                      : '#525252' // neutral
                }
              />
            ))}
            <LabelList dataKey="price" position="right" content={PriceWithArrow} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// Custom inline label: "$5.999 ↓" with the arrow colored.
function PriceWithArrow(props: unknown) {
  const p = props as {
    x?: number
    y?: number
    width?: number
    height?: number
    value?: number
    payload?: Row
  }
  const x = (p.x ?? 0) + (p.width ?? 0) + 8
  const y = (p.y ?? 0) + (p.height ?? 0) / 2
  const price = typeof p.value === 'number' ? p.value : null
  if (price == null) return null

  const change = p.payload?.change
  const meaningful = change && Math.abs(change.delta) >= 0.005
  const arrow = meaningful ? (change.delta > 0 ? '▲' : '▼') : null
  const arrowColor =
    meaningful && change.delta > 0 ? '#fb7185' /* rose */ : '#34d399' /* emerald */

  return (
    <g>
      <text
        x={x}
        y={y}
        fill="#e5e5e5"
        fontSize={11}
        dominantBaseline="middle"
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        ${price.toFixed(3)}
      </text>
      {arrow && (
        <text
          x={x + 38}
          y={y}
          fill={arrowColor}
          fontSize={9}
          dominantBaseline="middle"
        >
          {arrow}
        </text>
      )}
    </g>
  )
}
