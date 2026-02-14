import type { PayoutTable } from '../payouts/presets'

export const TOTAL_NUMBERS = 80
export const DRAW_COUNT = 20

export type Card = {
  id: number
  picks: number[]
}

export function generateDrawNumbers(count = DRAW_COUNT, max = TOTAL_NUMBERS): number[] {
  const pool = Array.from({ length: max }, (_, index) => index + 1)

  for (let i = pool.length - 1; i > 0; i -= 1) {
    const randomValues = new Uint32Array(1)
    crypto.getRandomValues(randomValues)
    const j = randomValues[0] % (i + 1)
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }

  return pool.slice(0, count).sort((a, b) => a - b)
}

export function countHits(picks: number[], drawnSet: Set<number>): number {
  return picks.reduce((total, pick) => (drawnSet.has(pick) ? total + 1 : total), 0)
}

export function getCardWin(spotCount: number, hits: number, betPerCard: number, payouts: PayoutTable): number {
  const multiplier = payouts[spotCount]?.[hits] ?? 0
  return multiplier * betPerCard
}

export function togglePick(card: Card, number: number): Card {
  const hasNumber = card.picks.includes(number)

  if (hasNumber) {
    return {
      ...card,
      picks: card.picks.filter((pick) => pick !== number),
    }
  }

  if (card.picks.length >= 10) {
    return card
  }

  return {
    ...card,
    picks: [...card.picks, number].sort((a, b) => a - b),
  }
}

export function createCards(count: number): Card[] {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    picks: [],
  }))
}

export function areCardsValid(cards: Card[]): boolean {
  return cards.every((card) => card.picks.length >= 1 && card.picks.length <= 10)
}
