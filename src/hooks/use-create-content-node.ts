import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import type { TransactionContent } from '@/types/content'
import { EXPLORER_NAMESPACE } from '@/utils/constants'

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
  usdcFeeAmount?: string
}

export function useCreateContentNode() {
  const { mainUsername } = useCurrentWallet()

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
    usdcFeeAmount,
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

      // Get main profiles (nemoapp namespace) for both wallets
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

        // Token information
        inputTokenSymbol:
          inputTokenData?.result?.content?.metadata?.symbol || '',
        inputTokenImage: inputTokenData?.result?.content?.links?.image || '',
        inputTokenDecimals: String(
          inputTokenData?.result?.token_info?.decimals || inputDecimals
        ),
        inputTokenName: inputTokenName || '',
        inputTokenDescription:
          inputTokenData?.result?.content?.metadata?.description || '',

        outputTokenSymbol:
          outputTokenData?.result?.content?.metadata?.symbol || '',
        outputTokenImage: outputTokenData?.result?.content?.links?.image || '',
        outputTokenDecimals: String(
          outputTokenData?.result?.token_info?.decimals || 6
        ),
        outputTokenName: outputTokenName || '',
        outputTokenDescription:
          outputTokenData?.result?.content?.metadata?.description || '',
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
          profileId: mainUsername,
          sourceWallet,
          inputTokenName,
          outputTokenName,
          properties: contentToProperties(content),
        }),
      })
    } catch (err) {
      console.error('Error creating content node:', err)
    }
  }

  return { createContentNode }
}
