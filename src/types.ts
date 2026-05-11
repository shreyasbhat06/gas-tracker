export type FuelType = 'regular' | 'premium'

export interface PriceRecord {
  timestamp: string
  regular: number | null
  premium: number | null
}

export interface Station {
  id: string
  name: string
  source: string
  url?: string
  history: PriceRecord[]
}

export interface PricesData {
  stations: Station[]
}

export interface FuelLogEntry {
  id: string
  date: string
  odometer: number
  gallons: number
  pricePerGallon: number
  stationId: string
  stationName: string
  /** Standard Fuelly-style model: MPG is only computed at full fills,
   *  with partial-fill gallons accumulating into the next full fill. */
  filledToFull: boolean
  /** Optional metadata — not used in MPG calc, just kept as a note. */
  fuelLevelAfter?: number
}
