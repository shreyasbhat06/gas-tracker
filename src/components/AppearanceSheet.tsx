import { X } from 'lucide-react'
import { SKINS, useTheme, type ThemePref } from '../utils/theme'
import { SegmentedControl } from './SegmentedControl'

interface AppearanceSheetProps {
  open: boolean
  onClose: () => void
}

/** Bottom sheet for mode (Auto/Light/Dark) + skin selection. Same sheet
 *  pattern as StationPickerSheet. */
export function AppearanceSheet({ open, onClose }: AppearanceSheetProps) {
  const { pref, setPref, skin, setSkin } = useTheme()

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm animate-modal-backdrop">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <div className="relative w-full max-w-md mx-auto bg-surface rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 pb-[max(env(safe-area-inset-bottom),1.25rem)] animate-modal-sheet">
        <div
          aria-hidden
          className="sm:hidden mx-auto mb-3 w-10 h-1.5 rounded-full bg-line-strong"
        />
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Appearance</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 -mr-2 rounded-full text-ink-2 hover:text-ink hover:bg-black/5 dark:hover:bg-white/5"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-xs uppercase tracking-wider text-ink-3 font-medium mb-2">
          Mode
        </div>
        <SegmentedControl<ThemePref>
          value={pref}
          onChange={setPref}
          label="Color mode"
          options={[
            { value: 'system', label: 'Auto' },
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
          ]}
        />

        <div className="mt-5 text-xs uppercase tracking-wider text-ink-3 font-medium mb-2">
          Theme
        </div>
        <div className="flex gap-2" role="radiogroup" aria-label="Theme skin">
          {SKINS.map((s) => {
            const active = s.id === skin
            return (
              <button
                key={s.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setSkin(s.id)}
                className={
                  'flex-1 flex flex-col items-center gap-2 p-3 rounded-2xl border transition active:scale-[0.97] motion-reduce:transform-none ' +
                  (active
                    ? 'border-accent bg-black/[0.03] dark:bg-white/[0.04]'
                    : 'border-line hover:bg-black/[0.02] dark:hover:bg-white/[0.03]')
                }
              >
                <span
                  aria-hidden
                  className="w-9 h-9 rounded-full ring-1 ring-black/10 dark:ring-white/10"
                  style={{
                    background: `linear-gradient(135deg, ${s.swatch[0]}, ${s.swatch[1]})`,
                  }}
                />
                <span
                  className={
                    'text-xs font-medium ' + (active ? 'text-ink' : 'text-ink-2')
                  }
                >
                  {s.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
