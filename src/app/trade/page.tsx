import { Swap } from '@/components/trading/swap'
import type { Metadata } from 'next'

// Define dynamic metadata based on the mode
export async function generateMetadata({
  searchParams,
}: {
  searchParams: { mode?: string }
}): Promise<Metadata> {
  const mode = searchParams.mode || 'swap'

  // Create mode-specific titles
  const titles = {
    swap: 'Token Swap | Fast & Efficient Trading',
    stake: 'Token Staking | Earn Rewards',
    unstake: 'Unstake Tokens | Manage Your Position',
    claim: 'Claim Rewards | Access Your Earnings',
  }

  // Get the title based on the mode, defaulting to swap if not found
  const title = titles[mode as keyof typeof titles] || titles.swap

  const description =
    'Swap tokens instantly with the best rates using Jupiter aggregator. Access deep liquidity, minimal slippage, and lightning-fast transactions on Solana.'

  return {
    title,
    description,
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://sse.gg'),
    openGraph: {
      title,
      description,
      type: 'website',

      siteName: 'Explorer',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default function SwapPage({
  searchParams,
}: {
  searchParams: { mode?: string }
}) {
  return <Swap />
}
