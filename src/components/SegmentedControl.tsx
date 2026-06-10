import { useRef } from 'react'

interface SegmentedControlProps<T extends string> {
  value: T
  onChange: (next: T) => void
  options: { value: T; label: string }[]
  /** Accessible name for the group, e.g. "Fuel type". */
  label: string
  /** md = 44px primary control (tabs, fuel type); sm = compact (chart modes). */
  size?: 'md' | 'sm'
}

/**
 * Single segmented control used for the main tabs, the fuel toggle, and the
 * chart mode switch. The selected "thumb" is one element that slides between
 * segments instead of each button swapping its own background — this is what
 * makes it feel like a physical control rather than two buttons.
 * Radiogroup semantics with roving tabindex: arrow keys move the selection.
 */
export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  label,
  size = 'md',
}: SegmentedControlProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const n = options.length
  const idx = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  )

  function onKeyDown(e: React.KeyboardEvent) {
    let next: number | null = null
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (idx + 1) % n
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (idx - 1 + n) % n
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = n - 1
    if (next == null) return
    e.preventDefault()
    onChange(options[next].value)
    refs.current[next]?.focus()
  }

  const md = size === 'md'
  const pad = md ? '0.25rem' : '0.125rem'

  return (
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={
        'relative grid auto-cols-fr grid-flow-col bg-seg-track ' +
        (md ? 'p-1 rounded-2xl' : 'p-0.5 rounded-lg')
      }
    >
      <span
        aria-hidden
        className={
          'absolute bg-seg-thumb shadow-sm ring-1 ring-black/5 dark:ring-white/5 ' +
          'transition-transform duration-200 ease-out motion-reduce:transition-none ' +
          (md ? 'inset-y-1 rounded-xl' : 'inset-y-0.5 rounded-md')
        }
        style={{
          left: pad,
          width: `calc((100% - ${pad} - ${pad}) / ${n})`,
          transform: `translateX(${idx * 100}%)`,
        }}
      />
      {options.map((opt, i) => {
        const active = i === idx
        return (
          <button
            key={opt.value}
            ref={(el) => {
              refs.current[i] = el
            }}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(opt.value)}
            className={
              'relative z-10 font-medium transition-colors ' +
              (md
                ? 'py-2.5 px-4 rounded-xl text-sm'
                : 'py-1 px-2.5 rounded-md text-[11px]') +
              (active ? ' text-ink' : ' text-ink-2 hover:text-ink')
            }
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
