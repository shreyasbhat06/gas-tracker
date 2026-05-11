const KEY = 'favStation'
const DEFAULT_ID = 'morena' // per CLAUDE.md — owner's primary station

export function loadFavoriteId(): string {
  try {
    return localStorage.getItem(KEY) || DEFAULT_ID
  } catch {
    return DEFAULT_ID
  }
}

export function saveFavoriteId(id: string): void {
  try {
    localStorage.setItem(KEY, id)
  } catch {
    /* private mode / quota; ignore */
  }
}
