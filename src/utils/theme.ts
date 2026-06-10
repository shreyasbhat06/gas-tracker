import { useSyncExternalStore } from 'react'

// Theme preference: 'system' follows the OS appearance live; 'light'/'dark'
// are explicit overrides persisted in localStorage. The inline script in
// index.html applies the same logic before first paint so there is never a
// flash of the wrong theme — this module takes over once React boots.

export type ThemePref = 'system' | 'light' | 'dark'
export type ResolvedTheme = 'light' | 'dark'

const KEY = 'gas-tracker-theme'
// Must match --bg in index.css; mirrored in the index.html pre-paint script.
const META_COLOR: Record<ResolvedTheme, string> = {
  dark: '#0a0a0a',
  light: '#f2f2f7',
}

const media = window.matchMedia('(prefers-color-scheme: dark)')
const listeners = new Set<() => void>()

let pref: ThemePref = readPref()

function readPref(): ThemePref {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'light' || v === 'dark' ? v : 'system'
  } catch {
    return 'system'
  }
}

function resolved(): ResolvedTheme {
  if (pref === 'system') return media.matches ? 'dark' : 'light'
  return pref
}

function apply() {
  const mode = resolved()
  document.documentElement.classList.toggle('dark', mode === 'dark')
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', META_COLOR[mode])
  listeners.forEach((l) => l())
}

export function setThemePref(next: ThemePref) {
  pref = next
  try {
    if (next === 'system') localStorage.removeItem(KEY)
    else localStorage.setItem(KEY, next)
  } catch {
    // Private mode etc. — theme still applies for this session.
  }
  apply()
}

media.addEventListener('change', () => {
  if (pref === 'system') apply()
})

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

/** Current preference + resolved mode; re-renders on toggle and on OS
 *  appearance changes (charts use `resolved` to re-read CSS variables). */
export function useTheme() {
  const prefValue = useSyncExternalStore(subscribe, () => pref)
  const resolvedValue = useSyncExternalStore(subscribe, resolved)
  return { pref: prefValue, setPref: setThemePref, resolved: resolvedValue }
}
