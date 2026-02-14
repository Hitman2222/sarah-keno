import { useMemo, useState } from 'react'

const CARD_COUNTS = [1, 2, 3, 4, 5, 6, 7, 8]
const BET_OPTIONS = [1, 2, 5, 10]
const NUMBER_OPTIONS = Array.from({ length: 80 }, (_, index) => index + 1)

function App() {
  const [cardCount, setCardCount] = useState(1)
  const [betPerCard, setBetPerCard] = useState(1)

  const bankroll = 1000
  const totalBet = useMemo(() => cardCount * betPerCard, [cardCount, betPerCard])
  const canDraw = totalBet > 0 && totalBet <= bankroll

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 p-4 md:p-6">
      <header className="rounded-xl border border-slate-800 bg-slate-900 p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-emerald-400">Multi-Card Keno</h1>
          <p className="rounded-lg bg-slate-800 px-4 py-2 text-sm">
            Bankroll: <span className="font-semibold text-emerald-300">${bankroll.toFixed(2)}</span>
          </p>
        </div>
      </header>

      <section className="rounded-xl border border-slate-800 bg-slate-900 p-4 md:p-5">
        <h2 className="mb-4 text-lg font-semibold">Controls</h2>

        <div className="grid gap-4 md:grid-cols-3">
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

          <div className="flex items-end">
            <button
              type="button"
              disabled={!canDraw}
              className="w-full rounded-md bg-emerald-500 px-4 py-2 font-semibold text-slate-950 transition enabled:hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
            >
              Draw (${totalBet.toFixed(2)})
            </button>
          </div>
        </div>

        {!canDraw && (
          <p className="mt-3 text-sm text-amber-300">
            Total bet must be greater than $0 and no more than your bankroll.
          </p>
        )}
      </section>

      <main className="grid flex-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <section className="rounded-xl border border-slate-800 bg-slate-900 p-4 md:p-5">
          <h2 className="mb-4 text-lg font-semibold">Cards Grid</h2>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: cardCount }, (_, index) => index + 1).map((cardNumber) => (
              <article
                key={cardNumber}
                className="rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-slate-300"
              >
                <h3 className="mb-2 font-semibold text-slate-100">Card {cardNumber}</h3>
                <p className="text-slate-400">Placeholder: Pick 10 numbers for this card.</p>
              </article>
            ))}
          </div>

          <div className="mt-5">
            <h3 className="mb-2 text-sm font-semibold">Number Picker (1–80)</h3>
            <div className="grid max-h-60 grid-cols-8 gap-2 overflow-y-auto rounded-lg border border-slate-700 bg-slate-950 p-3 sm:grid-cols-10">
              {NUMBER_OPTIONS.map((number) => (
                <button
                  key={number}
                  type="button"
                  className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-300 hover:border-emerald-400 hover:text-emerald-300"
                >
                  {number}
                </button>
              ))}
            </div>
          </div>
        </section>

        <aside className="flex flex-col gap-6">
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-4 md:p-5">
            <h2 className="mb-3 text-lg font-semibold">Drawn Numbers</h2>
            <p className="rounded-lg border border-dashed border-slate-700 bg-slate-950 p-4 text-sm text-slate-400">
              No draw yet. Press Draw to see winning numbers.
            </p>
          </section>

          <section className="rounded-xl border border-slate-800 bg-slate-900 p-4 md:p-5">
            <h2 className="mb-3 text-lg font-semibold">History</h2>
            <p className="rounded-lg border border-dashed border-slate-700 bg-slate-950 p-4 text-sm text-slate-400">
              Your recent rounds will appear here.
            </p>
          </section>
        </aside>
      </main>
    </div>
  )
}

export default App
