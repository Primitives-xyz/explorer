'use client'

import { FullPageSpinner } from '@/components/ui'
import { route } from '@/utils/route'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useGetProfileInfo } from '../hooks/use-get-profile-info'
import { ProfileContent } from './profile-content'

interface Props {
  username: string
}

export function ProfileWithUsername({ username }: Props) {
  const router = useRouter()
  const { mainProfile } = useCurrentWallet()
  const { profileInfo, loading, error } = useGetProfileInfo({
    username,
    mainUsername: mainProfile?.username,
  })

  useEffect(() => {
    if (error) {
      router.push(route('home'))
    }
  }, [error, router])

  if (loading) {
    return <FullPageSpinner />
  }

  if (!profileInfo) {
    return null
  }

  return (
    <ProfileContent
      profileInfo={profileInfo}
      walletAddress={profileInfo.walletAddress}
    />
  )
}
