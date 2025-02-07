import { notFound } from 'next/navigation'
import type { Transaction } from '@/utils/helius/types'
import dynamic from 'next/dynamic'
import type { Metadata } from 'next'
import { contentServer } from '@/lib/content-server'
import type { ContentResponse } from '@/lib/content-server'

// Client wrapper for SwapTransactionView
const ClientSwapView = dynamic(() => import('./client-swap-view'))

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
  return {
    title: `Trade ${resolvedParams.id}`,
  }
}

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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-green-500 mb-2">
            Trade Details
          </h1>
          <p className="text-green-400/80">View and copy this trade</p>
        </div>

        {/* Trade Card */}
        <div className="bg-black/40 border border-green-800/40 rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column - Trade Info */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-green-500 mb-4">
                Trade Information
              </h2>

              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 border-b border-green-900/30">
                  <span className="text-green-400">Timestamp</span>
                  <span className="text-green-100">
                    {new Date(Number(properties.timestamp)).toLocaleString()}
                  </span>
                </div>

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
                  <span className="text-green-400">Slippage</span>
                  <span className="text-green-100">
                    {(Number(properties.slippageBps) / 100).toFixed(1)}%
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-green-900/30">
                  <span className="text-green-400">Source Wallet</span>
                  <span className="text-green-100 font-mono text-sm">
                    {properties.sourceWallet ? (
                      <a
                        href={`https://solscan.io/account/${properties.sourceWallet}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-green-400 transition-colors"
                      >
                        {`${properties.sourceWallet.slice(
                          0,
                          4,
                        )}...${properties.sourceWallet.slice(-4)}`}
                      </a>
                    ) : (
                      'Unknown'
                    )}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-green-900/30">
                  <span className="text-green-400">Transaction</span>
                  <span className="text-green-100 font-mono text-sm">
                    <a
                      href={`https://solscan.io/tx/${
                        properties.txSignature ||
                        contentResponse.result?.id ||
                        resolvedParams.id
                      }`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-green-400 transition-colors"
                    >
                      {`${(
                        properties.txSignature ||
                        contentResponse.result?.id ||
                        resolvedParams.id
                      ).slice(0, 4)}...${(
                        properties.txSignature ||
                        contentResponse.result?.id ||
                        resolvedParams.id
                      ).slice(-4)}`}
                    </a>
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column - Swap Interface */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-green-500 mb-4">
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
