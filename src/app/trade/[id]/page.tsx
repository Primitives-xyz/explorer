import ShareButton from '@/components/share-button'
import { contentServer } from '@/lib/content-server'
import type { TransactionContent } from '@/types/content'
import { getTransactionDisplayData, isCopiedSwap } from '@/types/content'
import type { Transaction } from '@/utils/helius/types'
import { route } from '@/utils/server-routes'
import { ArrowRight, ExternalLink, Share2 } from 'lucide-react'
import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

// Client wrapper for SwapTransactionView
const ClientSwapView = dynamic(
  () => import('@/components/trade/client-swap-view')
)

const formatAddress = (address: string) =>
  `${address.slice(0, 4)}...${address.slice(-4)}`

interface RawContentResponse {
  content?: {
    type: string
    inputMint: string
    outputMint: string
    inputAmount: string
    expectedOutput: string
    priceImpact: string
    slippageBps: string
    txSignature: string
    timestamp: string
    sourceWallet?: string

    // Token information
    inputTokenSymbol: string
    inputTokenImage: string
    inputTokenDecimals: string
    inputTokenName: string
    outputTokenSymbol: string
    outputTokenImage: string
    outputTokenDecimals: string
    outputTokenName: string

    // Wallet information
    walletAddress: string
    walletUsername?: string
    walletImage?: string
    sourceWalletUsername?: string
    sourceWalletImage?: string
  }
}

async function getTradeContent(
  id: string
): Promise<{ content: TransactionContent } | null> {
  try {
    const response = (await contentServer.getContentById(
      id
    )) as RawContentResponse
    if (!response?.content) {
      console.error(`[Page] No content returned for id: ${id}`)
      return null
    }

    // Transform the raw content into our expected TransactionContent type
    const rawContent = response.content
    const transactionType = rawContent.sourceWallet
      ? ('copied' as const)
      : ('direct' as const)

    // Create the base content that's common to both types
    const baseContent = {
      type: 'swap' as const,
      inputMint: rawContent.inputMint || '',
      outputMint: rawContent.outputMint || '',
      inputAmount: rawContent.inputAmount || '',
      expectedOutput: rawContent.expectedOutput || '',
      priceImpact: rawContent.priceImpact || '',
      slippageBps: rawContent.slippageBps || '',
      priorityLevel: 'default' as const,
      txSignature: rawContent.txSignature || '',
      timestamp: rawContent.timestamp || Date.now().toString(),

      // Token information
      inputTokenSymbol: rawContent.inputTokenSymbol || '',
      inputTokenImage: rawContent.inputTokenImage || '',
      inputTokenDecimals: rawContent.inputTokenDecimals || '',
      inputTokenName: rawContent.inputTokenName || '',
      inputTokenDescription: '',

      outputTokenSymbol: rawContent.outputTokenSymbol || '',
      outputTokenImage: rawContent.outputTokenImage || '',
      outputTokenDecimals: rawContent.outputTokenDecimals || '',
      outputTokenName: rawContent.outputTokenName || '',
      outputTokenDescription: '',

      // Wallet information
      walletAddress: rawContent.walletAddress || '',
      walletUsername: rawContent.walletUsername,
      walletImage: rawContent.walletImage,
    }

    // Create the final content object based on whether it's a copied trade or direct trade
    const content: TransactionContent =
      transactionType === 'copied'
        ? {
            ...baseContent,
            transactionType: 'copied',
            sourceWallet: rawContent.sourceWallet || '',
            sourceWalletUsername: rawContent.sourceWalletUsername,
            sourceWalletImage: rawContent.sourceWalletImage,
          }
        : {
            ...baseContent,
            transactionType: 'direct',
            sourceWallet: '',
            sourceWalletUsername: '',
            sourceWalletImage: '',
          }

    return { content }
  } catch (error) {
    console.error(`[Page] Error fetching trade content for id: ${id}:`, error)
    console.error(
      `[Page] Error stack:`,
      error instanceof Error ? error.stack : 'No stack trace'
    )
    return null
  }
}

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params
  const contentResponse = await getTradeContent(resolvedParams.id)

  if (!contentResponse?.content) {
    return {
      title: 'Trade Details',
    }
  }

  const content = contentResponse.content
  const displayData = getTransactionDisplayData(content)
  const getBestImage = () => {
    // Only use the trader's wallet image if it exists and is not dicebear
    if (content.walletImage && !content.walletImage.includes('dicebear')) {
      return content.walletImage
    }
    return ''
  }

  const description =
    displayData.type === 'copied'
      ? `${displayData.copier} copied ${displayData.sourceUser}'s trade: ${displayData.amount} ➔ ${displayData.output}`
      : `${displayData.trader}'s trade: ${displayData.amount} ➔ ${displayData.output}`

  const title =
    displayData.type === 'copied'
      ? `🔥 ${displayData.copier} copied ${displayData.sourceUser}'s ${content.outputTokenSymbol} trade`
      : `🔥 ${displayData.trader}'s ${content.outputTokenSymbol} trade`

  return {
    title,
    description,
    openGraph: {
      title:
        displayData.type === 'copied'
          ? `${displayData.copier} just copied ${displayData.sourceUser}'s ${content.outputTokenSymbol} move 👀`
          : `${displayData.trader} just made a ${content.outputTokenSymbol} move 👀`,
      description,
      type: 'article',
      images: [
        {
          url: getBestImage(),
          width: 1200,
          height: 630,
          alt:
            displayData.type === 'copied'
              ? `${displayData.copier} copied ${displayData.sourceUser}'s trade`
              : `${displayData.trader}'s trade`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator:
        displayData.type === 'copied' ? displayData.sourceUser : undefined,
      images: [getBestImage()],
    },
  }
}

export default async function TradePage({ params }: Props) {
  const resolvedParams = await params
  console.log(`[Page] Rendering trade page for id: ${resolvedParams.id}`)
  const contentResponse = await getTradeContent(resolvedParams.id)

  if (!contentResponse?.content) {
    console.error(
      `[Page] Content response invalid for id: ${resolvedParams.id}. Content:`,
      contentResponse
    )
    notFound()
  }

  const content = contentResponse.content
  const displayData = getTransactionDisplayData(content)

  // Create a transaction object that matches what SwapTransactionView expects
  const transaction: Transaction = {
    description: `wallet swapped ${content.inputAmount} ${content.inputTokenSymbol} for ${content.expectedOutput} ${content.outputTokenSymbol}`,
    type: 'SWAP',
    source: 'jupiter',
    fee: 0,
    feePayer: content.walletAddress,
    signature: content.txSignature,
    slot: 0,
    timestamp: Number(content.timestamp),
    sourceWallet: content.walletAddress,
    nativeTransfers: [],
    tokenTransfers: [],
    accountData: [],
    balanceChanges: {},
  }

  return (
    <div className="px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with Both Users */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold  mb-2">Trade Details</h1>
          <p className="/80 mb-6">
            {content.walletUsername ? (
              <Link
                href={route('address', { id: content.walletUsername })}
                className=" hover: transition-colors"
              >
                @{content.walletUsername}
              </Link>
            ) : (
              formatAddress(content.walletAddress)
            )}{' '}
            {isCopiedSwap(content) ? (
              <>
                copied this trade from{' '}
                {content.sourceWalletUsername ? (
                  <Link
                    href={route('address', {
                      id: content.sourceWalletUsername,
                    })}
                    className=" hover: transition-colors"
                  >
                    @{content.sourceWalletUsername}
                  </Link>
                ) : (
                  formatAddress(content.sourceWallet)
                )}
              </>
            ) : (
              'made this trade'
            )}
          </p>

          {/* Users Involved Card */}
          <div className="bg-black/40 border border-green-800/40 rounded-xl p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Source User (Original Trader) */}
              <div className="flex-1">
                <div className="flex items-center gap-4 justify-center md:justify-start">
                  {isCopiedSwap(content) ? (
                    content.sourceWalletImage ? (
                      <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-green-500">
                        <Image
                          src={content.sourceWalletImage}
                          alt={
                            content.sourceWalletUsername || 'Original Trader'
                          }
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-green-500 bg-green-900/30 flex items-center justify-center">
                        <span className="text-2xl ">
                          {(
                            content.sourceWalletUsername ||
                            content.sourceWallet.slice(0, 2)
                          ).toUpperCase()}
                        </span>
                      </div>
                    )
                  ) : content.walletImage ? (
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-green-500">
                      <Image
                        src={content.walletImage}
                        alt={content.walletUsername || 'Trader'}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-green-500 bg-green-900/30 flex items-center justify-center">
                      <span className="text-2xl ">
                        {(
                          content.walletUsername ||
                          content.walletAddress.slice(0, 2)
                        ).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <div className="text-sm ">
                      {isCopiedSwap(content) ? 'Original Trade by' : 'Trader'}
                    </div>
                    {isCopiedSwap(content) ? (
                      content.sourceWalletUsername ? (
                        <Link
                          href={route('address', {
                            id: content.sourceWalletUsername,
                          })}
                          className="text-xl font-semibold  hover: transition-colors"
                        >
                          @{content.sourceWalletUsername}
                        </Link>
                      ) : (
                        <div className="flex flex-col gap-1">
                          <span className="text-xl font-mono ">
                            {formatAddress(content.sourceWallet)}
                          </span>
                          <Link
                            href={`https://solscan.io/account/${content.sourceWallet}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs  hover: transition-colors flex items-center gap-1"
                          >
                            View on Solscan
                            <ExternalLink size={12} />
                          </Link>
                        </div>
                      )
                    ) : content.walletUsername ? (
                      <Link
                        href={route('address', { id: content.walletUsername })}
                        className="text-xl font-semibold  hover: transition-colors"
                      >
                        @{content.walletUsername}
                      </Link>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <span className="text-xl font-mono ">
                          {formatAddress(content.walletAddress)}
                        </span>
                        <Link
                          href={`https://solscan.io/account/${content.walletAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs  hover: transition-colors flex items-center gap-1"
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
              {isCopiedSwap(content) && (
                <>
                  <div className="flex items-center">
                    <div className="flex flex-col items-center gap-1">
                      <ArrowRight className=" rotate-0 md:rotate-0" size={32} />
                      <span className="text-xs /60">copied by</span>
                    </div>
                  </div>

                  {/* Target User (Copier) */}
                  <div className="flex-1">
                    <div className="flex items-center gap-4 justify-center md:justify-end">
                      <div className="text-right">
                        <div className="text-sm ">Copied by</div>
                        {content.walletUsername ? (
                          <Link
                            href={route('address', {
                              id: content.walletUsername,
                            })}
                            className="text-xl font-semibold  hover: transition-colors"
                          >
                            @{content.walletUsername}
                          </Link>
                        ) : (
                          <div className="flex flex-col gap-1 items-end">
                            <span className="text-xl font-mono ">
                              {formatAddress(content.walletAddress)}
                            </span>
                            <Link
                              href={`https://solscan.io/account/${content.walletAddress}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs  hover: transition-colors flex items-center gap-1"
                            >
                              View on Solscan
                              <ExternalLink size={12} />
                            </Link>
                          </div>
                        )}
                      </div>
                      {content.walletImage ? (
                        <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-green-500">
                          <Image
                            src={content.walletImage}
                            alt={content.walletUsername || 'Trader'}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-green-500 bg-green-900/30 flex items-center justify-center">
                          <span className="text-2xl ">
                            {(
                              content.walletUsername ||
                              content.walletAddress.slice(0, 2)
                            ).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Share Section */}
        <div className="mt-4 flex items-center justify-end gap-4">
          <ShareButton
            title={`Check out this ${
              isCopiedSwap(content) ? 'copied ' : ''
            }trade on $SSE!`}
            text={
              displayData.type === 'copied'
                ? `${displayData.copier} copied ${displayData.sourceUser}'s trade: ${displayData.amount} ➔ ${displayData.output}`
                : `${displayData.trader}'s trade: ${displayData.amount} ➔ ${displayData.output}`
            }
            className="flex items-center gap-2 bg-green-900/20 px-4 py-2 rounded-lg hover:bg-green-900/30 transition-colors "
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
              <h2 className="text-xl font-semibold  mb-6">Swap Details</h2>

              {/* From Token */}
              <div className="bg-green-900/20 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-4 mb-2">
                  {content.inputTokenImage && (
                    <div className="relative w-8 h-8 rounded-full overflow-hidden">
                      <Image
                        src={content.inputTokenImage}
                        alt={content.inputTokenSymbol}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <div className="text-sm ">From</div>
                    <div className="font-semibold ">{displayData.amount}</div>
                  </div>
                </div>
                <div className="text-sm /60 mt-2">{content.inputTokenName}</div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center my-4">
                <ArrowRight className="" size={24} />
              </div>

              {/* To Token */}
              <div className="bg-green-900/20 rounded-lg p-4">
                <div className="flex items-center gap-4 mb-2">
                  {content.outputTokenImage && (
                    <div className="relative w-8 h-8 rounded-full overflow-hidden">
                      <Image
                        src={content.outputTokenImage}
                        alt={content.outputTokenSymbol}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <div className="text-sm ">To</div>
                    <div className="font-semibold ">{displayData.output}</div>
                  </div>
                </div>
                <div className="text-sm /60 mt-2">
                  {content.outputTokenName}
                </div>
              </div>
            </div>

            {/* Transaction Details Card */}
            <div className="bg-black/40 border border-green-800/40 rounded-xl p-6">
              <h2 className="text-xl font-semibold  mb-6">
                Transaction Details
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-green-900/30">
                  <span className="">Price Impact</span>
                  <span
                    className={`${
                      Number(content.priceImpact) > 1 ? 'text-red-400' : ''
                    }`}
                  >
                    {displayData.priceImpact}%
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-green-900/30">
                  <span className="">Slippage Tolerance</span>
                  <span className="">{displayData.slippage}%</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-green-900/30">
                  <span className="">Priority Level</span>
                  <span className=" capitalize">{content.priorityLevel}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-green-900/30">
                  <span className="">Timestamp</span>
                  <span className="">
                    {displayData.timestamp.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-green-900/30">
                  <span className="">Transaction</span>
                  <Link
                    href={`https://solscan.io/tx/${content.txSignature}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2  font-mono text-sm hover: transition-colors group"
                  >
                    {formatAddress(content.txSignature)}
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
              <h2 className="text-xl font-semibold  mb-6">Copy Trade</h2>
              <ClientSwapView
                tx={transaction}
                sourceWallet={content.walletAddress}
                fromMint={content.inputMint}
                toMint={content.outputMint}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
