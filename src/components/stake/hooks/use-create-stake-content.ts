import { useTokenInfo } from '@/components/token/hooks/use-token-info'
import { EXPLORER_NAMESPACE, SSE_TOKEN_MINT } from '@/utils/constants'
import isFungibleToken from '@/utils/helper'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { getAuthToken } from '@dynamic-labs/sdk-react-core'

interface CreateStakeContentParams {
  signature: string
  stakeAmount: string // SSE amount being staked
  walletAddress?: string
  route?: 'stake' | 'home' // Where the stake was executed from
}

export function useCreateStakeContentNode() {
  const { mainProfile } = useCurrentWallet()
  const { data: tokenInfo } = useTokenInfo(SSE_TOKEN_MINT)

  // Get SSE price from token info
  const ssePrice =
    tokenInfo && isFungibleToken(tokenInfo)
      ? tokenInfo.result.token_info.price_info?.price_per_token
      : undefined

  const createContentNode = async ({
    signature,
    stakeAmount,
    walletAddress,
    route,
  }: CreateStakeContentParams) => {
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

      // Calculate USDC value of the stake
      const usdcValue = ssePrice
        ? (Number(stakeAmount) * ssePrice).toFixed(6)
        : '0'

      // Create the content object for staking
      const content = {
        type: 'stake' as const,
        transactionType: 'stake',
        stakeAmount,
        usdcFeeAmount: usdcValue, // Using usdcFeeAmount field for consistency with data tracking
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
        action: 'stake', // 'stake' or 'unstake' for future use
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

      console.log('Stake content node created:', {
        signature,
        stakeAmount,
        usdcValue,
        ssePrice,
      })
    } catch (err) {
      console.error('Error creating stake content node:', err)
    }
  }

  return { createContentNode }
}
