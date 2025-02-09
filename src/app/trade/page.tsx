import { JupiterSwapForm } from '@/components/transactions/jupiter-swap-form'

export const metadata = {
  title: 'Swap Tokens',
  description: 'Swap your tokens using Jupiter aggregator',
}

export default function SwapPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-green-400 mb-6">Swap Tokens</h1>
        <div className="bg-black/50 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-green-500/20">
          <JupiterSwapForm />
        </div>
      </div>
    </div>
  )
}
