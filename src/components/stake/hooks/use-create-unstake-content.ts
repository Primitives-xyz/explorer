import { useTokenInfo } from '@/components/token/hooks/use-token-info'
import { EXPLORER_NAMESPACE, SSE_TOKEN_MINT } from '@/utils/constants'
import isFungibleToken from '@/utils/helper'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { getAuthToken } from '@dynamic-labs/sdk-react-core'

interface CreateUnstakeContentParams {
  signature: string
  unstakeAmount: string // SSE amount being unstaked
  walletAddress?: string
  route?: 'stake' | 'home' // Where the unstake was executed from
}

export function useCreateUnstakeContentNode() {
  const { mainProfile } = useCurrentWallet()
  const { data: tokenInfo } = useTokenInfo(SSE_TOKEN_MINT)

  // Get SSE price from token info
  const ssePrice =
    tokenInfo && isFungibleToken(tokenInfo)
      ? tokenInfo.result.token_info.price_info?.price_per_token
      : undefined

  const createContentNode = async ({
    signature,
    unstakeAmount,
    walletAddress,
    route,
  }: CreateUnstakeContentParams) => {
    try {
      // Fetch profile for the wallet
      const walletProfiles = walletAddress
        ? await fetch(`/api/profiles?walletAddress=${walletAddress}`).then(
            (res) => res.json()
          )
        : { profiles: [] }

      const walletProfile = walletProfiles.profiles?.find(
        (p: any) => p.namespace.name === EXPLORER_NAMESPACE
      )?.profile

      // Calculate USDC value of the unstake (negative to indicate outflow)
      const usdcValue = ssePrice
        ? (-Number(unstakeAmount) * ssePrice).toFixed(6)
        : '0'

      // Create the content object for unstaking
      const content = {
        type: 'stake' as const,
        transactionType: 'unstake',
        stakeAmount: unstakeAmount,
        usdcFeeAmount: usdcValue, // Negative value to indicate outflow
        txSignature: signature,
        timestamp: String(Date.now()),
        walletAddress: walletAddress || '',
        walletUsername: walletProfile?.username || '',
        walletImage: walletProfile?.image || '',
        route: route || 'stake',

        // Token information for SSE
        tokenMint: SSE_TOKEN_MINT,
        tokenSymbol: 'SSE',
        tokenDecimals: '6',

        // Additional staking-specific fields
        action: 'unstake',
        ssePrice: ssePrice ? String(ssePrice) : '0',
      }

      // Convert content object to properties array
      const contentToProperties = (obj: Record<string, any>) => {
        return Object.entries(obj).map(([key, value]) => ({
          key,
          value: String(value), // Ensure all values are strings
        }))
      }

      // Post the content to the API
      const authToken = getAuthToken()
      await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { Authorization: `Bearer ${authToken}` }),
        },
        body: JSON.stringify({
          id: signature,
          profileId: mainProfile?.username,
          properties: contentToProperties(content),
        }),
      })

      console.log('Unstake content node created:', {
        signature,
        unstakeAmount,
        usdcValue,
        ssePrice,
      })
    } catch (err) {
      console.error('Error creating unstake content node:', err)
    }
  }

  return { createContentNode }
}
