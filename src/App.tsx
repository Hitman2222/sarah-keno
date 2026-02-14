import { useEffect, useMemo, useState } from 'react'
import {
  areCardsValid,
  countHits,
  createCards,
  generateDrawNumbers,
  getCardWin,
  togglePick,
  type Card,
} from './game/keno'
import { PAYOUT_PRESETS, type PayoutPresetName } from './payouts/presets'

type RoundHistory = {
  id: number
  drawnNumbers: number[]
  totalWin: number
}

type CardResult = {
  cardId: number
  hits: number
  win: number
}

const CARD_COUNTS = [1, 2, 3, 4, 5, 6, 7, 8]
const BET_OPTIONS = [1, 2, 5, 10]
const NUMBER_OPTIONS = Array.from({ length: 80 }, (_, index) => index + 1)
const STORAGE_KEY = 'keno-state-v1'

function App() {
  const [bankroll, setBankroll] = useState(1000)
  const [cardCount, setCardCount] = useState(1)
  const [betPerCard, setBetPerCard] = useState(1)
  const [presetName, setPresetName] = useState<PayoutPresetName>('Fun')
  const [cards, setCards] = useState<Card[]>(createCards(1))
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([])
  const [history, setHistory] = useState<RoundHistory[]>([])
  const [cardResults, setCardResults] = useState<CardResult[]>([])
  const [lastRoundCards, setLastRoundCards] = useState<Card[] | null>(null)

  const totalBet = useMemo(() => cardCount * betPerCard, [cardCount, betPerCard])
  const canDraw = bankroll >= totalBet && areCardsValid(cards)
  const drawnSet = useMemo(() => new Set(drawnNumbers), [drawnNumbers])

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)

    if (!saved) {
      return
    }

    try {
      const parsed = JSON.parse(saved) as {
        bankroll: number
        cardCount: number
        betPerCard: number
        cards: Card[]
        presetName: PayoutPresetName
      }

      setBankroll(parsed.bankroll ?? 1000)
      setCardCount(parsed.cardCount ?? 1)
      setBetPerCard(parsed.betPerCard ?? 1)
      setPresetName(parsed.presetName ?? 'Fun')
      setCards(parsed.cards?.length ? parsed.cards : createCards(parsed.cardCount ?? 1))
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        bankroll,
        cardCount,
        betPerCard,
        cards,
        presetName,
      }),
    )
  }, [bankroll, cardCount, betPerCard, cards, presetName])

  useEffect(() => {
    setCards((currentCards) => {
      if (currentCards.length === cardCount) {
        return currentCards
      }

      if (currentCards.length > cardCount) {
        return currentCards.slice(0, cardCount)
      }

      const nextCards = [...currentCards]
      for (let i = currentCards.length + 1; i <= cardCount; i += 1) {
        nextCards.push({ id: i, picks: [] })
      }
      return nextCards
    })
  }, [cardCount])

  const handlePickNumber = (cardId: number, number: number) => {
    setCards((currentCards) =>
      currentCards.map((card) => (card.id === cardId ? togglePick(card, number) : card)),
    )
  }

  const handleDraw = () => {
    if (!canDraw) {
      return
    }

    const nextDrawnNumbers = generateDrawNumbers()
    const nextDrawnSet = new Set(nextDrawnNumbers)
    const payouts = PAYOUT_PRESETS[presetName]

    const results = cards.map((card) => {
      const hits = countHits(card.picks, nextDrawnSet)
      const win = getCardWin(card.picks.length, hits, betPerCard, payouts)

      return {
        cardId: card.id,
        hits,
        win,
      }
    })

    const totalWin = results.reduce((sum, result) => sum + result.win, 0)

    setBankroll((current) => current - totalBet + totalWin)
    setDrawnNumbers(nextDrawnNumbers)
    setCardResults(results)
    setLastRoundCards(cards)
    setHistory((current) => [{ id: Date.now(), drawnNumbers: nextDrawnNumbers, totalWin }, ...current].slice(0, 20))
  }

  const handleQuickPickAll = () => {
    setCards((currentCards) =>
      currentCards.map((card) => ({
        ...card,
        picks: generateDrawNumbers(10, 80),
      })),
    )
  }

  const handleClearAll = () => {
    setCards((currentCards) => currentCards.map((card) => ({ ...card, picks: [] })))
  }

  const handleRepeatLastRound = () => {
    if (!lastRoundCards) {
      return
    }

    setCards(lastRoundCards.map((card) => ({ ...card, picks: [...card.picks] })))
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 p-4 md:p-6">
      <header className="rounded-xl border border-slate-800 bg-slate-900 p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-emerald-400">Multi-Card Keno</h1>
          <div className="rounded-lg bg-slate-800 px-4 py-2 text-sm">
            Bankroll: <span className="font-semibold text-emerald-300">${bankroll.toFixed(2)}</span>
          </div>
        </div>
      </header>

      <section className="rounded-xl border border-slate-800 bg-slate-900 p-4 md:p-5">
        <h2 className="mb-4 text-lg font-semibold">Controls</h2>

        <div className="grid gap-4 md:grid-cols-4">
          <label className="flex flex-col gap-2 text-sm">
            Number of cards
            <select
              value={cardCount}
              onChange={(event) => setCardCount(Number(event.target.value))}
              className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2"
            >
              {CARD_COUNTS.map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm">
            Bet per card
            <select
              value={betPerCard}
              onChange={(event) => setBetPerCard(Number(event.target.value))}
              className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2"
            >
              {BET_OPTIONS.map((bet) => (
                <option key={bet} value={bet}>
                  ${bet}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm">
            Payout preset
            <select
              value={presetName}
              onChange={(event) => setPresetName(event.target.value as PayoutPresetName)}
              className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2"
            >
              {Object.keys(PAYOUT_PRESETS).map((preset) => (
                <option key={preset} value={preset}>
                  {preset}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-end">
            <button
              type="button"
              disabled={!canDraw}
              onClick={handleDraw}
              className="w-full rounded-md bg-emerald-500 px-4 py-2 font-semibold text-slate-950 transition enabled:hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
            >
              Draw (${totalBet.toFixed(2)})
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleQuickPickAll}
            className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm hover:border-emerald-400"
          >
            Quick Pick All
          </button>
          <button
            type="button"
            onClick={handleClearAll}
            className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm hover:border-emerald-400"
          >
            Clear All
          </button>
          <button
            type="button"
            onClick={handleRepeatLastRound}
            disabled={!lastRoundCards}
            className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm hover:border-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Repeat Last Round
          </button>
        </div>

        {!canDraw && (
          <p className="mt-3 text-sm text-amber-300">
            Every card must have 1–10 picks, and bankroll must cover total bet.
          </p>
        )}
      </section>

      <main className="grid flex-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <section className="rounded-xl border border-slate-800 bg-slate-900 p-4 md:p-5">
          <h2 className="mb-4 text-lg font-semibold">Cards Grid</h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {cards.map((card) => {
              const result = cardResults.find((item) => item.cardId === card.id)
              return (
                <article key={card.id} className="rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm">
                  <h3 className="font-semibold text-slate-100">Card {card.id}</h3>
                  <p className="mt-1 text-slate-300">Spots: {card.picks.length}/10</p>
                  <p className="text-slate-400">
                    Picks: {card.picks.length ? card.picks.join(', ') : 'No picks yet'}
                  </p>
                  {result && (
                    <p className="mt-2 text-emerald-300">
                      Hits: {result.hits} · Win: ${result.win.toFixed(2)}
                    </p>
                  )}
                </article>
              )
            })}
          </div>

          <div className="mt-5 space-y-4">
            {cards.map((card) => (
              <div key={`picker-${card.id}`}>
                <h3 className="mb-2 text-sm font-semibold">Card {card.id} Number Picker (1–80)</h3>
                <div className="grid max-h-44 grid-cols-8 gap-2 overflow-y-auto rounded-lg border border-slate-700 bg-slate-950 p-3 sm:grid-cols-10">
                  {NUMBER_OPTIONS.map((number) => {
                    const isSelected = card.picks.includes(number)
                    const isDrawn = drawnSet.has(number)
                    const isHit = isSelected && isDrawn

                    return (
                      <button
                        key={`${card.id}-${number}`}
                        type="button"
                        onClick={() => handlePickNumber(card.id, number)}
                        className={`rounded border px-2 py-1 text-xs transition ${
                          isHit
                            ? 'border-emerald-300 bg-emerald-400 text-slate-950'
                            : isSelected
                              ? 'border-cyan-300 bg-cyan-500/20 text-cyan-200'
                              : isDrawn
                                ? 'border-yellow-400 bg-yellow-500/20 text-yellow-200'
                                : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-emerald-400 hover:text-emerald-300'
                        }`}
                      >
                        {number}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="flex flex-col gap-6">
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-4 md:p-5">
            <h2 className="mb-3 text-lg font-semibold">Drawn Numbers</h2>
            {drawnNumbers.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-700 bg-slate-950 p-4 text-sm text-slate-400">
                No draw yet. Press Draw to see winning numbers.
              </p>
            ) : (
              <div className="grid grid-cols-5 gap-2">
                {drawnNumbers.map((number) => (
                  <span
                    key={`draw-${number}`}
                    className="rounded-md border border-yellow-400 bg-yellow-500/20 px-2 py-1 text-center text-sm text-yellow-200"
                  >
                    {number}
                  </span>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-xl border border-slate-800 bg-slate-900 p-4 md:p-5">
            <h2 className="mb-3 text-lg font-semibold">History (Last 20)</h2>
            {history.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-700 bg-slate-950 p-4 text-sm text-slate-400">
                Your recent rounds will appear here.
              </p>
            ) : (
              <ul className="space-y-2 text-sm">
                {history.map((round) => (
                  <li key={round.id} className="rounded-md border border-slate-700 bg-slate-950 p-2 text-slate-300">
                    <p>Total Win: ${round.totalWin.toFixed(2)}</p>
                    <p className="text-xs text-slate-400">Draw: {round.drawnNumbers.join(', ')}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </main>
    </div>
  )
}

export default App
