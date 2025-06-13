import type { PudgyProfileClaimContent } from '@/types/content'
import { EXPLORER_NAMESPACE } from '@/utils/constants'
import { useCurrentWallet } from '@/utils/use-current-wallet'

interface CreatePudgyClaimContentParams {
  signature: string
  burnAmount: string
  tokenSymbol: string
  tokenMint: string
  tokenDecimals: number
  burnAmountUsd: string
  profileId: string
  username: string
  pudgyTheme: string
  pudgyFrame: boolean
  walletAddress: string
}

export function useCreatePudgyClaimContent() {
  const { mainProfile } = useCurrentWallet()

  const createContentNode = async ({
    signature,
    burnAmount,
    tokenSymbol,
    tokenMint,
    tokenDecimals,
    burnAmountUsd,
    profileId,
    username,
    pudgyTheme,
    pudgyFrame,
    walletAddress,
  }: CreatePudgyClaimContentParams) => {
    try {
      // Fetch wallet profile
      const walletProfiles = await fetch(
        `/api/profiles?walletAddress=${walletAddress}`
      ).then((res) => res.json())

      const walletProfile = walletProfiles.profiles?.find(
        (p: any) => p.namespace.name === EXPLORER_NAMESPACE
      )?.profile

      // Create the content object
      const content: PudgyProfileClaimContent = {
        type: 'pudgy_profile_claim',
        txSignature: signature,
        timestamp: String(Date.now()),

        // Burn details
        burnAmount,
        tokenSymbol,
        tokenMint,
        tokenDecimals: String(tokenDecimals),
        burnAmountUsd,

        // Profile details
        profileId,
        username,
        pudgyTheme,
        pudgyFrame: String(pudgyFrame),

        // Wallet info
        walletAddress,
        walletUsername: walletProfile?.username || '',
        walletImage: walletProfile?.image || '',
      }

      // Convert content object to properties array
      const contentToProperties = (obj: Record<string, any>) => {
        return Object.entries(obj).map(([key, value]) => ({
          key,
          value: String(value),
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
          profileId: profileId,
          properties: contentToProperties(content),
        }),
      })
    } catch (err) {
      console.error('Error creating pudgy claim content node:', err)
    }
  }

  return { createContentNode }
}
