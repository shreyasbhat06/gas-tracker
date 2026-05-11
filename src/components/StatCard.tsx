import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: ReactNode
  hint?: string
  icon?: LucideIcon
}

export function StatCard({ label, value, hint, icon: Icon }: StatCardProps) {
  return (
    <div className="rounded-2xl bg-neutral-900 border border-white/[0.04] p-4">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-neutral-500 font-medium">
        {Icon && <Icon className="w-3.5 h-3.5" strokeWidth={2.25} />}
        <span>{label}</span>
      </div>
      <div className="mt-1.5 text-2xl font-semibold tabular-nums tracking-tight">
        {value}
      </div>
      {hint && <div className="mt-0.5 text-xs text-neutral-500">{hint}</div>}
    </div>
  )
}
