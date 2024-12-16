import { getTransactionHistory } from '@/utils/helius'
import { getTokens } from '@/utils/tokens'
import Link from 'next/link'
import PortfolioTabs from './PortfolioTabs'

interface PageProps {
  params: {
    address: string
  }
}

export default async function PortfolioPage({ params }: PageProps) {
  const [tokens, initialTransactions] = await Promise.all([
    getTokens(params.address),
    getTransactionHistory(params.address),
  ])

  const fungibleTokens = tokens.filter(
    (token) =>
      token.interface === 'FungibleToken' ||
      token.interface === 'FungibleAsset',
  )
  const nonfungibleTokens = tokens.filter(
    (token) =>
      token.interface !== 'FungibleToken' &&
      token.interface !== 'FungibleAsset',
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/"
          className="inline-block mb-8 text-purple-600 hover:text-purple-700 transition-colors"
        >
          <h1 className="text-3xl font-bold">Solana Portfolio Viewer</h1>
        </Link>
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Portfolio</h2>
          <p className="text-gray-600 break-all">{params.address}</p>
        </div>

        <PortfolioTabs
          address={params.address}
          fungibleTokens={fungibleTokens}
          nonfungibleTokens={nonfungibleTokens}
          initialTransactions={initialTransactions}
        />
      </div>
    </div>
  )
}
