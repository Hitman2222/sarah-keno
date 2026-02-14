import { describe, expect, it } from 'vitest'
import { countHits, generateDrawNumbers, getCardWin } from '../game/keno'
import { FUN_PRESET } from '../payouts/presets'

describe('generateDrawNumbers', () => {
  it('returns 20 unique numbers in the 1..80 range', () => {
    const numbers = generateDrawNumbers()

    expect(numbers).toHaveLength(20)
    expect(new Set(numbers).size).toBe(20)
    expect(Math.min(...numbers)).toBeGreaterThanOrEqual(1)
    expect(Math.max(...numbers)).toBeLessThanOrEqual(80)
  })
})

describe('payout calculation', () => {
  it('calculates hits and payout multiplier correctly', () => {
    const picks = [1, 2, 3, 4, 5]
    const drawnSet = new Set([2, 5, 10, 11, 12])
    const hits = countHits(picks, drawnSet)
    const win = getCardWin(picks.length, hits, 2, FUN_PRESET)

    expect(hits).toBe(2)
    expect(win).toBe(0)
  })

  it('pays when payout table has a matching entry', () => {
    const picks = [1, 2, 3, 4]
    const drawnSet = new Set([1, 2, 3, 20, 21])
    const hits = countHits(picks, drawnSet)
    const win = getCardWin(picks.length, hits, 5, FUN_PRESET)

    expect(hits).toBe(3)
    expect(win).toBe(25)
  })
})
