import { notFound } from 'next/navigation'
import type { Transaction } from '@/utils/helius/types'
import dynamic from 'next/dynamic'
import type { Metadata } from 'next'
import { contentServer } from '@/lib/content-server'
import type { ContentResponse } from '@/lib/content-server'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ExternalLink, Share2 } from 'lucide-react'
import ShareButton from '@/components/share-button'

// Client wrapper for SwapTransactionView
const ClientSwapView = dynamic(() => import('./client-swap-view'))

const formatAddress = (address: string) =>
  `${address.slice(0, 4)}...${address.slice(-4)}`

async function getTradeContent(id: string): Promise<ContentResponse | null> {
  console.log(`[Page] Attempting to fetch trade content for id: ${id}`)
  try {
    const content = await contentServer.getContentById(id)
    if (!content) {
      console.error(`[Page] No content returned for id: ${id}`)
      return null
    }

    // Log the content structure to help debug type mismatches
    console.log(`[Page] Content structure for id: ${id}:`, {
      hasResult: !!content.result,
      resultType: content.result?.properties?.find((p: any) => p.key === 'type')
        ?.value,
      propertiesCount: content.result?.properties?.length,
    })

    console.log({ result: content })

    return content
  } catch (error) {
    console.error(`[Page] Error fetching trade content for id: ${id}:`, error)
    console.error(
      `[Page] Error stack:`,
      error instanceof Error ? error.stack : 'No stack trace',
    )
    return null
  }
}

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params
  const content = await getTradeContent(resolvedParams.id)

  if (!content || (!content.result?.properties && !content.content)) {
    return {
      title: 'Trade Details',
    }
  }

  const properties =
    content.content ||
    content.result?.properties?.reduce((acc: any, prop: any) => {
      acc[prop.key] = prop.value
      return acc
    }, {})

  const copierName = properties.walletUsername
    ? `@${properties.walletUsername}`
    : formatAddress(properties.walletAddress || '')
  const sourceName = properties.sourceWalletUsername
    ? `@${properties.sourceWalletUsername}`
    : formatAddress(properties.sourceWallet || '')

  const description = `${copierName} copied ${sourceName}'s trade: ${properties.inputAmount} ${properties.inputTokenSymbol} ➔ ${properties.expectedOutput} ${properties.outputTokenSymbol}`
  const title = `Copied Trade: ${copierName} × ${sourceName}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      images: [
        {
          url: properties.sourceWalletImage || '',
          width: 1200,
          height: 630,
          alt: `${copierName} copied ${sourceName}'s trade`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: properties.sourceWalletUsername
        ? `@${properties.sourceWalletUsername}`
        : undefined,
      images: [properties.sourceWalletImage || ''],
    },
  }
}

// Client component for share functionality

export default async function TradePage({ params }: Props) {
  const resolvedParams = await params
  console.log(`[Page] Rendering trade page for id: ${resolvedParams.id}`)
  const contentResponse = await getTradeContent(resolvedParams.id)

  if (!contentResponse) {
    console.error(
      `[Page] Content response invalid for id: ${resolvedParams.id}. Content:`,
      contentResponse,
    )
    notFound()
  }

  // Handle both old and new content formats
  let properties: Record<string, any> = {}

  if (contentResponse.result?.properties) {
    // Old format with properties array
    properties = contentResponse.result.properties.reduce(
      (acc: any, prop: any) => {
        acc[prop.key] = prop.value
        return acc
      },
      {},
    )
  } else if (contentResponse.content) {
    // New format with direct content object
    properties = contentResponse.content
  } else {
    console.error(
      `[Page] Invalid content structure for id: ${resolvedParams.id}`,
    )
    notFound()
  }

  // Create a transaction object that matches what SwapTransactionView expects
  const transaction: Transaction = {
    description: `wallet swapped ${properties.inputAmount} ${properties.inputTokenSymbol} for ${properties.expectedOutput} ${properties.outputTokenSymbol}`,
    type: 'SWAP',
    source: 'jupiter',
    fee: 0,
    feePayer: properties.sourceWallet || '',
    signature:
      properties.txSignature || contentResponse.result?.id || resolvedParams.id,
    slot: 0,
    timestamp: Number(properties.timestamp),
    sourceWallet: properties.sourceWallet,
    nativeTransfers: [],
    tokenTransfers: [],
    accountData: [],
    balanceChanges: {},
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with Both Users */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-green-500 mb-2">
            Trade Details
          </h1>
          <p className="text-green-400/80 mb-6">
            {properties.walletUsername ? (
              <Link
                href={`/${properties.walletUsername}`}
                className="text-green-400 hover:text-green-300 transition-colors"
              >
                @{properties.walletUsername}
              </Link>
            ) : (
              formatAddress(properties.walletAddress || '')
            )}{' '}
            copied this trade from{' '}
            {properties.sourceWalletUsername ? (
              <Link
                href={`/${properties.sourceWalletUsername}`}
                className="text-green-400 hover:text-green-300 transition-colors"
              >
                @{properties.sourceWalletUsername}
              </Link>
            ) : (
              formatAddress(properties.sourceWallet || '')
            )}
          </p>

          {/* Users Involved Card */}
          <div className="bg-black/40 border border-green-800/40 rounded-xl p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Source User (Original Trader) */}
              <div className="flex-1">
                <div className="flex items-center gap-4 justify-center md:justify-start">
                  {properties.sourceWalletImage ? (
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-green-500">
                      <Image
                        src={properties.sourceWalletImage}
                        alt={
                          properties.sourceWalletUsername || 'Original Trader'
                        }
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-green-500 bg-green-900/30 flex items-center justify-center">
                      <span className="text-2xl text-green-500">
                        {(
                          properties.sourceWalletUsername ||
                          properties.sourceWallet?.slice(0, 2)
                        )?.toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <div className="text-sm text-green-400">
                      Original Trade by
                    </div>
                    {properties.sourceWalletUsername ? (
                      <Link
                        href={`/${properties.sourceWalletUsername}`}
                        className="text-xl font-semibold text-green-100 hover:text-green-400 transition-colors"
                      >
                        @{properties.sourceWalletUsername}
                      </Link>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <span className="text-xl font-mono text-green-100">
                          {formatAddress(properties.sourceWallet || '')}
                        </span>
                        <Link
                          href={`https://solscan.io/account/${properties.sourceWallet}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-green-500 hover:text-green-400 transition-colors flex items-center gap-1"
                        >
                          View on Solscan
                          <ExternalLink size={12} />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Trade Arrow */}
              <div className="flex items-center">
                <div className="flex flex-col items-center gap-1">
                  <ArrowRight
                    className="text-green-500 rotate-0 md:rotate-0"
                    size={32}
                  />
                  <span className="text-xs text-green-400/60">copied by</span>
                </div>
              </div>

              {/* Target User (Copier) */}
              <div className="flex-1">
                <div className="flex items-center gap-4 justify-center md:justify-end">
                  <div className="text-right">
                    <div className="text-sm text-green-400">
                      Copied and executed by
                    </div>
                    {properties.walletUsername ? (
                      <Link
                        href={`/${properties.walletUsername}`}
                        className="text-xl font-semibold text-green-100 hover:text-green-400 transition-colors"
                      >
                        @{properties.walletUsername}
                      </Link>
                    ) : (
                      <div className="flex flex-col gap-1 items-end">
                        <span className="text-xl font-mono text-green-100">
                          {formatAddress(properties.walletAddress || '')}
                        </span>
                        <Link
                          href={`https://solscan.io/account/${properties.walletAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-green-500 hover:text-green-400 transition-colors flex items-center gap-1"
                        >
                          View on Solscan
                          <ExternalLink size={12} />
                        </Link>
                      </div>
                    )}
                  </div>
                  {properties.walletImage ? (
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-green-500">
                      <Image
                        src={properties.walletImage}
                        alt={properties.walletUsername || 'Trader'}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-green-500 bg-green-900/30 flex items-center justify-center">
                      <span className="text-2xl text-green-500">
                        {(
                          properties.walletUsername ||
                          properties.walletAddress?.slice(0, 2)
                        )?.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Share Section */}
        <div className="mt-4 flex items-center justify-end gap-4">
          <ShareButton
            title={`Check out this copied trade on Nemo!`}
            text={`${
              properties.walletUsername ||
              formatAddress(properties.walletAddress || '')
            } copied ${
              properties.sourceWalletUsername
                ? `@${properties.sourceWalletUsername}'s`
                : `${formatAddress(properties.sourceWallet || '')}'s`
            } trade: ${properties.inputAmount} ${
              properties.inputTokenSymbol
            } ➔ ${properties.expectedOutput} ${properties.outputTokenSymbol}`}
            className="flex items-center gap-2 bg-green-900/20 px-4 py-2 rounded-lg hover:bg-green-900/30 transition-colors text-green-400"
          >
            <Share2 size={16} />
            Share Trade
          </ShareButton>
        </div>

        {/* Main Trade Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Trade Details */}
          <div className="space-y-8">
            {/* Token Swap Card */}
            <div className="bg-black/40 border border-green-800/40 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-green-500 mb-6">
                Swap Details
              </h2>

              {/* From Token */}
              <div className="bg-green-900/20 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-4 mb-2">
                  {properties.inputTokenImage && (
                    <div className="relative w-8 h-8 rounded-full overflow-hidden">
                      <Image
                        src={properties.inputTokenImage}
                        alt={properties.inputTokenSymbol}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <div className="text-sm text-green-400">From</div>
                    <div className="font-semibold text-green-100">
                      {properties.inputAmount} {properties.inputTokenSymbol}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-green-400/60 mt-2">
                  {properties.inputTokenName}
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center my-4">
                <ArrowRight className="text-green-500" size={24} />
              </div>

              {/* To Token */}
              <div className="bg-green-900/20 rounded-lg p-4">
                <div className="flex items-center gap-4 mb-2">
                  {properties.outputTokenImage && (
                    <div className="relative w-8 h-8 rounded-full overflow-hidden">
                      <Image
                        src={properties.outputTokenImage}
                        alt={properties.outputTokenSymbol}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <div className="text-sm text-green-400">To</div>
                    <div className="font-semibold text-green-100">
                      {properties.expectedOutput} {properties.outputTokenSymbol}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-green-400/60 mt-2">
                  {properties.outputTokenName}
                </div>
              </div>
            </div>

            {/* Transaction Details Card */}
            <div className="bg-black/40 border border-green-800/40 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-green-500 mb-6">
                Transaction Details
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-green-900/30">
                  <span className="text-green-400">Price Impact</span>
                  <span
                    className={`${
                      Number(properties.priceImpact) > 1
                        ? 'text-red-400'
                        : 'text-green-100'
                    }`}
                  >
                    {Number(properties.priceImpact).toFixed(2)}%
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-green-900/30">
                  <span className="text-green-400">Slippage Tolerance</span>
                  <span className="text-green-100">
                    {(Number(properties.slippageBps) / 100).toFixed(1)}%
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-green-900/30">
                  <span className="text-green-400">Priority Fee</span>
                  <span className="text-green-100">
                    {properties.priorityFee} µ◎
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-green-900/30">
                  <span className="text-green-400">Priority Level</span>
                  <span className="text-green-100 capitalize">
                    {properties.priorityLevel}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-green-900/30">
                  <span className="text-green-400">Timestamp</span>
                  <span className="text-green-100">
                    {new Date(Number(properties.timestamp)).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-green-900/30">
                  <span className="text-green-400">Source Wallet</span>
                  <Link
                    href={`https://solscan.io/account/${properties.sourceWallet}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-green-100 font-mono text-sm hover:text-green-400 transition-colors group"
                  >
                    {formatAddress(properties.sourceWallet)}
                    <ExternalLink
                      size={14}
                      className="opacity-50 group-hover:opacity-100"
                    />
                  </Link>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-green-900/30">
                  <span className="text-green-400">Transaction</span>
                  <Link
                    href={`https://solscan.io/tx/${
                      properties.txSignature ||
                      contentResponse.result?.id ||
                      resolvedParams.id
                    }`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-green-100 font-mono text-sm hover:text-green-400 transition-colors group"
                  >
                    {formatAddress(
                      properties.txSignature ||
                        contentResponse.result?.id ||
                        resolvedParams.id,
                    )}
                    <ExternalLink
                      size={14}
                      className="opacity-50 group-hover:opacity-100"
                    />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Copy Trade Interface */}
          <div className="space-y-4">
            <div className="bg-black/40 border border-green-800/40 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-green-500 mb-6">
                Copy Trade
              </h2>
              <ClientSwapView
                tx={transaction}
                sourceWallet={properties.sourceWallet}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
