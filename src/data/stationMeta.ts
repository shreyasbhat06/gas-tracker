// Display-only metadata for each station. Kept in the frontend rather than
// stations.json because the scraper has no use for it — easy to migrate
// later if a scraping source starts providing neighborhood/coords.

export interface StationMeta {
  neighborhood: string
  mapsQuery: string
}

export const stationMeta: Record<string, StationMeta> = {
  morena:            { neighborhood: 'Bay Park',         mapsQuery: 'Costco Morena Blvd San Diego' },
  'mission-valley':  { neighborhood: 'Mission Valley',   mapsQuery: 'Costco Mission Valley San Diego' },
  'carmel-mountain': { neighborhood: 'Carmel Mountain',  mapsQuery: 'Costco Carmel Mountain San Diego' },
  'se-san-diego':    { neighborhood: 'Logan Heights',    mapsQuery: 'Costco SE San Diego' },
  'la-mesa':         { neighborhood: 'La Mesa',          mapsQuery: 'Costco La Mesa CA' },
  poway:             { neighborhood: 'Poway',            mapsQuery: 'Costco Poway CA' },
  santee:            { neighborhood: 'Santee',           mapsQuery: 'Costco Santee CA' },
  'rancho-del-rey':  { neighborhood: 'Rancho del Rey',   mapsQuery: 'Costco Rancho Del Rey Chula Vista' },
  'chula-vista':     { neighborhood: 'Chula Vista',      mapsQuery: 'Costco Chula Vista CA' },
  'san-marcos':      { neighborhood: 'San Marcos',       mapsQuery: 'Costco San Marcos CA' },
  carlsbad:          { neighborhood: 'Carlsbad',         mapsQuery: 'Costco Carlsbad CA' },
  vista:             { neighborhood: 'Vista',            mapsQuery: 'Costco Vista CA' },
}

export function getMeta(id: string): StationMeta {
  return stationMeta[id] ?? { neighborhood: '', mapsQuery: id }
}

// 12-color palette for the trend chart, hand-picked for dark backgrounds.
export const stationColors = [
  '#60a5fa', // blue
  '#a78bfa', // violet
  '#f472b6', // pink
  '#34d399', // emerald
  '#fbbf24', // amber
  '#fb7185', // rose
  '#22d3ee', // cyan
  '#a3e635', // lime
  '#f97316', // orange
  '#818cf8', // indigo
  '#2dd4bf', // teal
  '#facc15', // yellow
]

export function colorFor(idx: number): string {
  return stationColors[idx % stationColors.length]
}
