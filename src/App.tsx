import { Fuel } from 'lucide-react'

function App() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <main className="max-w-5xl mx-auto px-6 py-12">
        <header className="flex items-center gap-3 mb-8">
          <Fuel className="w-8 h-8 text-emerald-400" />
          <h1 className="text-3xl font-semibold tracking-tight">Gas Tracker</h1>
        </header>
        <p className="text-neutral-400">
          Scaffold ready. Prices will appear here once the scraper has populated{' '}
          <code className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-200">
            data/prices.json
          </code>
          .
        </p>
      </main>
    </div>
  )
}

export default App
