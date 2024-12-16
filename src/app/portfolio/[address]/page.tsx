import { FungibleToken, Transaction } from '@/utils/helius'
import Link from 'next/link'
import PortfolioTabs from './PortfolioTabs'

interface PageProps {
  params: {
    address: string
  }
}

interface Token {
  id: string
  interface: string
  content: {
    metadata?: {
      name?: string
      symbol?: string
    }
    links?: {
      image?: string
    }
  }
  token_info?: {
    balance: string
    decimals: number
    price_info?: {
      price_per_token?: number
      total_price?: number
      currency?: string
    }
  }
}

async function fetchTokens(address: string): Promise<Token[]> {
  const response = await fetch(`${process.env.RPC_URL}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 'my-id',
      method: 'searchAssets',
      params: {
        ownerAddress: address,
        tokenType: 'all',
        displayOptions: {
          showCollectionMetadata: true,
        },
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data = await response.json()
  return data.result?.items || []
}

async function fetchTransactions(address: string): Promise<Transaction[]> {
  // Extract API key from the RPC URL string
  const apiKey = process.env.RPC_URL?.split('api-key=')[1]
  if (!apiKey) {
    throw new Error('API key not found in RPC URL')
  }

  const response = await fetch(
    `https://api.helius.xyz/v0/addresses/${address}/transactions?api-key=${apiKey}&limit=10`,
  )

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data = await response.json()
  return data
}

function transformToFungibleToken(token: Token): FungibleToken {
  return {
    id: token.id,
    name: token.content?.metadata?.name || 'Unknown Token',
    symbol: token.content?.metadata?.symbol || '',
    imageUrl: token.content?.links?.image || null,
    balance:
      Number(token.token_info?.balance || 0) /
      Math.pow(10, token.token_info?.decimals || 0),
    price: token.token_info?.price_info?.price_per_token || 0,
    currency: token.token_info?.price_info?.currency || 'USDC',
  }
}

export default async function PortfolioPage({ params }: PageProps) {
  const [tokens, initialTransactions] = await Promise.all([
    fetchTokens(params.address),
    fetchTransactions(params.address),
  ])

  const fungibleTokens = tokens
    .filter(
      (token: Token) =>
        token.interface === 'FungibleToken' ||
        token.interface === 'FungibleAsset',
    )
    .map(transformToFungibleToken)

  const nonfungibleTokens = tokens.filter(
    (token: Token) =>
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
