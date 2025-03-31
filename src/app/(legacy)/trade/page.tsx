import { Swap } from '@/components/trading/swap'
import type { Metadata } from 'next'

// Define dynamic metadata based on the mode
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{
    mode?: string
    inputMint?: string
    outputMint?: string
  }>
}): Promise<Metadata> {
  const params = await searchParams
  const mode = params.mode || 'swap'
  const inputMint = params.inputMint
  const outputMint = params.outputMint

  // Create mode-specific titles
  const titles = {
    swap: 'Trade Tokens | Best Rates Guaranteed',
    stake: 'Stake & Earn | Maximize Rewards',
    unstake: 'Unstake | Manage Positions',
    claim: 'Claim Rewards | Instant Access',
  }

  // Get the title based on the mode, defaulting to swap if not found
  let title = titles[mode as keyof typeof titles] || titles.swap

  // If we have token addresses in the URL, add them to the title
  if (mode === 'swap' && inputMint && outputMint) {
    title = `Swap | ${inputMint.substring(0, 4)}...${inputMint.substring(
      inputMint.length - 4
    )} to ${outputMint.substring(0, 4)}...${outputMint.substring(
      outputMint.length - 4
    )}`
  }

  const description =
    'Trade tokens with the lowest fees on Solana. Smart routing technology finds you the best rates across all DEXs, saving you money on every swap.'

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

export default function SwapPage() {
  return <Swap />
}
