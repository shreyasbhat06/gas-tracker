interface TabsProps<T extends string> {
  value: T
  onChange: (next: T) => void
  options: { value: T; label: string }[]
}

export function Tabs<T extends string>({ value, onChange, options }: TabsProps<T>) {
  return (
    <div className="flex gap-1 p-1 bg-neutral-900 rounded-2xl">
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={
              'flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ' +
              (active
                ? 'bg-neutral-800 text-white shadow-sm ring-1 ring-white/5'
                : 'text-neutral-400 hover:text-neutral-200')
            }
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
