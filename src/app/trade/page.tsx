import { LeaderboardTable } from '@/components/leaderboards/leaderboard-table'
import { JupiterSwapForm } from '@/components/transactions/jupiter-swap-form'
import type { Metadata } from 'next'
import { useTranslations } from 'next-intl'

export const metadata: Metadata = {
  title: 'Token Swap | Fast & Efficient Trading',
  description:
    'Swap tokens instantly with the best rates using Jupiter aggregator. Access deep liquidity, minimal slippage, and lightning-fast transactions on Solana.',
  openGraph: {
    title: 'Token Swap | Fast & Efficient Trading',
    description:
      'Swap tokens instantly with the best rates using Jupiter aggregator. Access deep liquidity, minimal slippage, and lightning-fast transactions on Solana.',
    type: 'website',
    images: [
      {
        url: '/og-swap.png',
        width: 1200,
        height: 630,
        alt: 'Token Swap Interface',
      },
    ],
    siteName: 'Explorer',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Token Swap | Fast & Efficient Trading',
    description:
      'Swap tokens instantly with the best rates using Jupiter aggregator. Access deep liquidity, minimal slippage, and lightning-fast transactions on Solana.',
    images: ['/og-swap.png'],
  },
}

export default function SwapPage() {
  const t = useTranslations()
  return (
    <div className="md:px-1 py-8 min-h-screen">
      <div className="mx-auto h-full">
        <div className="flex flex-col lg:flex-row gap-8 h-full">
          <div className="w-full lg:w-2/3">
            <h1 className="text-2xl font-bold mb-4 text-violet-100">
              {t('trade.swap_tokens')}
            </h1>
            <div className="bg-black/50 backdrop-blur-sm rounded-xl shadow-xl border border-green-500/20">
              <div className="p-6">
                <JupiterSwapForm hideWhenGlobalSearch />
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/3">
            <h2 className="text-2xl font-bold mb-4 text-violet-100">
              {t('top_traders.title')}
            </h2>
            <div className="bg-black/50 backdrop-blur-sm rounded-xl shadow-xl border border-violet-500/20 overflow-auto ">
              <LeaderboardTable />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
