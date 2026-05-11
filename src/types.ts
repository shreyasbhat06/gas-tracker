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
  /** Total amount paid at the pump. The user enters this directly (from
   *  the receipt/credit-card statement); gallons is derived as
   *  totalCost / pricePerGallon. Optional for backward compat with
   *  pre-2026-05 entries that only stored gallons. */
  totalCost?: number
  /** Optional metadata — not used in MPG calc, just kept as a note. */
  fuelLevelAfter?: number
}
