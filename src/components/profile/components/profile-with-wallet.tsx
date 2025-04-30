'use client'

import { useGetProfiles } from '@/components/tapestry/hooks/use-get-profiles'
import { FullPageSpinner } from '@/components/ui'
import { EXPLORER_NAMESPACE } from '@/utils/constants'
import { useIsMobile } from '@/utils/use-is-mobile'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo } from 'react'
import { ProfileContent } from './profile-content'

interface Props {
  walletAddress: string
}

export function ProfileWithWallet({ walletAddress }: Props) {
  const { profiles, loading } = useGetProfiles({
    walletAddress,
  })
  const { isMobile } = useIsMobile()
  const { push } = useRouter()

  useEffect(() => {
    if (isMobile) {
      push('/trade')
    }
  }, [isMobile, push])

  const profileInfo = useMemo(() => {
    return (
      profiles?.profiles.find(
        (profile) => profile.namespace?.name === EXPLORER_NAMESPACE
      ) || profiles?.profiles?.[0]
    )
  }, [profiles])

  if (isMobile) {
    return <FullPageSpinner />
  }

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
