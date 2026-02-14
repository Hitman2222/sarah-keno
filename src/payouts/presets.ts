export type PayoutTable = Record<number, Record<number, number>>

export const FUN_PRESET: PayoutTable = {
  1: { 1: 3 },
  2: { 2: 10 },
  3: { 2: 2, 3: 20 },
  4: { 2: 1, 3: 5, 4: 50 },
  5: { 3: 2, 4: 15, 5: 100 },
  6: { 3: 1, 4: 5, 5: 25, 6: 200 },
  7: { 3: 1, 4: 3, 5: 10, 6: 50, 7: 400 },
  8: { 4: 2, 5: 8, 6: 30, 7: 100, 8: 700 },
  9: { 4: 1, 5: 5, 6: 15, 7: 60, 8: 200, 9: 1000 },
  10: { 5: 2, 6: 8, 7: 25, 8: 100, 9: 400, 10: 1500 },
}

export const CASINO_ISH_PRESET: PayoutTable = {
  1: { 1: 2 },
  2: { 2: 8 },
  3: { 2: 1, 3: 16 },
  4: { 3: 4, 4: 30 },
  5: { 3: 1, 4: 8, 5: 60 },
  6: { 4: 4, 5: 15, 6: 120 },
  7: { 4: 2, 5: 8, 6: 30, 7: 250 },
  8: { 5: 5, 6: 20, 7: 80, 8: 500 },
  9: { 5: 3, 6: 10, 7: 40, 8: 150, 9: 800 },
  10: { 5: 2, 6: 8, 7: 25, 8: 100, 9: 250, 10: 1000 },
}

export const PAYOUT_PRESETS = {
  Fun: FUN_PRESET,
  'Casino-ish': CASINO_ISH_PRESET,
} as const

export type PayoutPresetName = keyof typeof PAYOUT_PRESETS
