import type { TransactionContent } from '@/types/content'
import { EXPLORER_NAMESPACE } from '@/utils/constants'
import { useCurrentWallet } from '@/utils/use-current-wallet'

interface CreateContentNodeParams {
  signature: string
  inputMint: string
  outputMint: string
  inputAmount: string
  expectedOutput: string
  priceImpact: string
  slippageBps: number
  sourceWallet?: string
  priorityLevel: string
  walletAddress?: string
  inputDecimals: number
  outputDecimals?: number
  usdcFeeAmount?: string
  route?: 'trenches' | 'trade' | 'home'
  // New parameters for USD values from quote
  swapUsdValue?: string
  inputTokenPrice?: number
  outputTokenPrice?: number
  sourceTransactionId?: string // For copy trades
  sseFeeAmount?: string // SSE fee amount if used
}

export function useCreateTradeContentNode() {
  const { mainProfile } = useCurrentWallet()

  const createContentNode = async ({
    signature,
    inputMint,
    outputMint,
    inputAmount,
    expectedOutput,
    priceImpact,
    slippageBps,
    sourceWallet,
    priorityLevel,
    walletAddress,
    inputDecimals,
    outputDecimals = 6,
    usdcFeeAmount,
    route,
    swapUsdValue,
    inputTokenPrice,
    outputTokenPrice,
    sourceTransactionId,
    sseFeeAmount,
  }: CreateContentNodeParams) => {
    try {
      // Fetch profiles for both wallets
      const [sourceWalletProfiles, walletProfiles] = await Promise.all([
        sourceWallet
          ? fetch(`/api/profiles?walletAddress=${sourceWallet}`).then((res) =>
              res.json()
            )
          : Promise.resolve({ profiles: [] }),
        walletAddress
          ? fetch(`/api/profiles?walletAddress=${walletAddress}`).then((res) =>
              res.json()
            )
          : Promise.resolve({ profiles: [] }),
      ])

      const sourceProfile = sourceWalletProfiles.profiles?.find(
        (p: any) => p.namespace.name === EXPLORER_NAMESPACE
      )?.profile
      const walletProfile = walletProfiles.profiles?.find(
        (p: any) => p.namespace.name === EXPLORER_NAMESPACE
      )?.profile

      // Fetch token information
      const [inputTokenResponse, outputTokenResponse] = await Promise.all([
        fetch(`/api/token?mint=${inputMint}`),
        fetch(`/api/token?mint=${outputMint}`),
      ])

      const inputTokenData = await inputTokenResponse.json()
      const outputTokenData = await outputTokenResponse.json()

      const inputTokenName = inputTokenData?.result?.content?.metadata?.name
      const outputTokenName = outputTokenData?.result?.content?.metadata?.name

      // Calculate USD values using provided data or swap USD value
      const inputTokenDecimals =
        inputTokenData?.result?.token_info?.decimals || inputDecimals
      const outputTokenDecimals =
        outputTokenData?.result?.token_info?.decimals || outputDecimals

      let inputAmountUsd = 0
      let outputAmountUsd = 0
      let profitUsd = 0
      let profitPercentage = 0

      if (swapUsdValue) {
        // Use the swap USD value from Jupiter quote
        inputAmountUsd = parseFloat(swapUsdValue)

        // Calculate output USD value based on token amounts and relative value
        const inputAmountNum =
          parseFloat(inputAmount) / Math.pow(10, inputTokenDecimals)
        const outputAmountNum =
          parseFloat(expectedOutput) / Math.pow(10, outputTokenDecimals)

        // If we have token prices, use them for more accurate calculation
        if (inputTokenPrice && outputTokenPrice) {
          outputAmountUsd = outputAmountNum * outputTokenPrice
        } else {
          // Otherwise estimate based on the swap ratio
          const ratio = outputAmountNum / inputAmountNum
          outputAmountUsd =
            inputAmountUsd * ratio * (1 - parseFloat(priceImpact) / 100)
        }

        profitUsd = outputAmountUsd - inputAmountUsd
        profitPercentage =
          inputAmountUsd > 0 ? (profitUsd / inputAmountUsd) * 100 : 0
      }

      // For copy trades, calculate copy delay
      let copyDelay = 0
      let sourceTransactionTimestamp = ''

      if (sourceWallet && sourceTransactionId) {
        // If we have the source transaction ID, we can calculate exact delay
        try {
          const sourceContentResponse = await fetch(
            `/api/content/${sourceTransactionId}`
          )
          const sourceContent = await sourceContentResponse.json()
          if (sourceContent?.content?.timestamp) {
            sourceTransactionTimestamp = sourceContent.content.timestamp
            copyDelay = Date.now() - parseInt(sourceTransactionTimestamp)
          }
        } catch (err) {
          console.error('Error fetching source transaction:', err)
        }
      }

      // Create the base content properties
      const baseContent = {
        type: 'swap' as const,
        inputMint,
        outputMint,
        inputAmount,
        expectedOutput,
        priceImpact,
        slippageBps: String(slippageBps),
        txSignature: signature,
        timestamp: String(Date.now()),
        priorityLevel,
        walletAddress: walletAddress || '',
        walletUsername: walletProfile?.username || '',
        walletImage: walletProfile?.image || '',
        usdcFeeAmount: usdcFeeAmount || '0',
        route: route || '',
        sseFeeAmount: sseFeeAmount || '0',

        // Token information
        inputTokenSymbol:
          inputTokenData?.result?.content?.metadata?.symbol || '',
        inputTokenImage: inputTokenData?.result?.content?.links?.image || '',
        inputTokenDecimals: String(inputTokenDecimals),
        inputTokenName: inputTokenName || '',
        inputTokenDescription:
          inputTokenData?.result?.content?.metadata?.description || '',

        outputTokenSymbol:
          outputTokenData?.result?.content?.metadata?.symbol || '',
        outputTokenImage: outputTokenData?.result?.content?.links?.image || '',
        outputTokenDecimals: String(outputTokenDecimals),
        outputTokenName: outputTokenName || '',
        outputTokenDescription:
          outputTokenData?.result?.content?.metadata?.description || '',

        // Financial metrics for payment tracking
        inputAmountUsd: String(inputAmountUsd.toFixed(2)),
        outputAmountUsd: String(outputAmountUsd.toFixed(2)),
        profitUsd: String(profitUsd.toFixed(2)),
        profitPercentage: String(profitPercentage.toFixed(2)),
        swapUsdValue: swapUsdValue || '0',

        // Payment tracking - default values
        paymentStatus: sourceWallet ? 'pending' : 'not_applicable',
        paymentPercentage: '10', // Default 10% profit share
        paymentAmount:
          sourceWallet && profitUsd > 0
            ? String((profitUsd * 0.1).toFixed(2))
            : '0',

        // Copy trade specific metrics (will be included in properties)
        copyDelay: sourceWallet ? String(copyDelay) : '0',
        sourceTransactionTimestamp: sourceWallet
          ? sourceTransactionTimestamp
          : '',
        sourceTransactionId: sourceTransactionId || '',
      }

      // Create the final content object based on whether it's a copied trade or direct trade
      const content: TransactionContent = sourceWallet
        ? {
            ...baseContent,
            transactionType: 'copied',
            sourceWallet,
            sourceWalletUsername: sourceProfile?.username || '',
            sourceWalletImage: sourceProfile?.image || '',
          }
        : {
            ...baseContent,
            transactionType: 'direct',
            sourceWallet: '',
            sourceWalletUsername: '',
            sourceWalletImage: '',
          }

      // Convert content object to properties array
      const contentToProperties = (obj: Record<string, any>) => {
        return Object.entries(obj).map(([key, value]) => ({
          key,
          value: String(value), // Ensure all values are strings
        }))
      }

      // Post the content to the API
      await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: signature,
          profileId: mainProfile?.username,
          sourceWallet,
          inputTokenName,
          outputTokenName,
          route,
          properties: contentToProperties(content),
        }),
      })
    } catch (err) {
      console.error('Error creating content node:', err)
    }
  }

  return { createContentNode }
}
