import { Swap } from '@/components/trading/swap'
import type { Metadata } from 'next'

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
  return (
    <Swap />
  )
}
