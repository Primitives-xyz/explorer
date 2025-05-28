'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@/utils/api'
import { FullPageSpinner } from '@/components/ui'

interface ProfileResponse {
  profile: {
    tokenAddress: string
    namespace: string
    created_at: number
    id: string
    username: string
  }
  walletAddress: string
  namespace: {
    name: string
    readableName: string
    faviconURL: string
    userProfileURL: string
    externalProfileURL: string
  }
  socialCounts: {
    followers: number
    following: number
  }
}

interface Props {
  namespace: string
  profile: string
}

export function NamespaceProfileRedirect({ namespace, profile }: Props) {
  const router = useRouter()
  
  const { data, loading, error } = useQuery<ProfileResponse>({
    endpoint: `profiles/${profile}`,
    queryParams: { namespace },
  })

  useEffect(() => {
    if (data?.walletAddress) {
      // Redirect to the wallet page with the namespace as a query parameter
      // This will allow the profile page to pre-select the correct tab
      router.push(`/${data.walletAddress}?namespace=${namespace}`)
    }
  }, [data, namespace, router])

  if (loading) {
    return <FullPageSpinner />
  }

  if (error || !data) {
    return (
      <div className="w-full flex items-center justify-center pt-[200px] text-lg">
        Profile not found
      </div>
    )
  }

  // Show spinner while redirecting
  return <FullPageSpinner />
} 