'use client'

import { useGetProfiles } from '@/components/tapestry/hooks/use-get-profiles'
import { FullPageSpinner } from '@/components/ui'
import { EXPLORER_NAMESPACE } from '@/utils/constants'
import { useMemo } from 'react'
import { ProfileContent } from './profile-content'

interface Props {
  walletAddress: string
}

export function ProfileWithWallet({ walletAddress }: Props) {
  const { profiles, loading } = useGetProfiles({
    walletAddress,
  })

  const profileInfo = useMemo(() => {
    return (
      profiles?.profiles.find(
        (profile) => profile.namespace?.name === EXPLORER_NAMESPACE
      ) || profiles?.profiles?.[0]
    )
  }, [profiles])

  if (loading) {
    return <FullPageSpinner />
  }

  return (
    <ProfileContent
      profileInfo={
        profileInfo?.wallet?.address
          ? {
              ...profileInfo,
              walletAddress: profileInfo.wallet.address,
            }
          : null
      }
      walletAddress={walletAddress}
    />
  )
}
