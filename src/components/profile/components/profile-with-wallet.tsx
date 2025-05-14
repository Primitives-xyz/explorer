'use client'

import { useGetProfiles } from '@/components/tapestry/hooks/use-get-profiles'
import { Button, ButtonVariant, FullPageSpinner } from '@/components/ui'
import { EXPLORER_NAMESPACE } from '@/utils/constants'
import { route } from '@/utils/route'
import { useMemo } from 'react'
import { ProfileContent } from './profile-content'

interface Props {
  walletAddress: string
}

export function ProfileWithWallet({ walletAddress }: Props) {
  const { profiles, loading, error } = useGetProfiles({
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

  if (error) {
    return (
      <div className="w-full flex items-center justify-center pt-[200px] text-lg flex-col gap-4">
        Profile not found
        <Button variant={ButtonVariant.OUTLINE} href={route('home')}>
          go back home
        </Button>
      </div>
    )
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
