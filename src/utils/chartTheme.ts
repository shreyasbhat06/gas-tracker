import { useMemo, type CSSProperties } from 'react'
import { useTheme } from './theme'

// Recharts takes literal color values, not CSS variables (it draws into SVG
// attributes), so charts read the computed token values here. Keyed off the
// resolved theme: toggling light/dark re-renders every chart with the new
// palette.

export type ChartTheme = ReturnType<typeof useChartTheme>

export function useChartTheme() {
  const { resolved } = useTheme()
  return useMemo(() => {
    const css = getComputedStyle(document.documentElement)
    const v = (name: string) => css.getPropertyValue(name).trim()

    const tooltipStyle: CSSProperties = {
      background: v('--chart-tooltip-bg'),
      border: `1px solid ${v('--chart-tooltip-border')}`,
      borderRadius: 12,
      fontSize: 12,
      boxShadow:
        resolved === 'dark'
          ? '0 8px 24px rgba(0, 0, 0, 0.4)'
          : '0 8px 24px rgba(0, 0, 0, 0.12)',
    }

    return {
      resolved,
      grid: v('--chart-grid'),
      axisText: v('--chart-axis-text'),
      label: v('--chart-label'),
      barNeutral: v('--chart-bar-neutral'),
      accent: v('--accent'),
      /** Accent tuned for thin chart lines (brighter than --accent in dark). */
      lineAccent: v('--chart-line-accent'),
      /** Page background — used as the "punch-out" ring around line dots. */
      bg: v('--bg'),
      tick: { fill: v('--chart-axis-text'), fontSize: 11 },
      tooltipStyle,
      tooltipText: { color: v('--chart-label') },
    }
  }, [resolved])
}
