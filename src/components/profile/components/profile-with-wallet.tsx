'use client'

import { useGetProfiles } from '@/components/tapestry/hooks/use-get-profiles'
import { FullPageSpinner } from '@/components/ui'
import { EXPLORER_NAMESPACE } from '@/utils/constants'
import { route } from '@/utils/route'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo } from 'react'
import { ProfileContent } from './profile-content'

interface Props {
  walletAddress: string
}

export function ProfileWithWallet({ walletAddress }: Props) {
  const router = useRouter()
  const { profiles, loading, error } = useGetProfiles({
    walletAddress,
  })
  useEffect(() => {
    if (error) {
      router.push(route('home'))
    }
  }, [error, router])

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
