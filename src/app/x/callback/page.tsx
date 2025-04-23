'use client'

import { MainContentWrapper } from '@/components/common/main-content-wrapper'
import { Spinner } from '@/components/ui'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function TwitterCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function handleTwitterCallback() {
      try {
        // 1. Get the code and state from URL params
        const code = searchParams.get('code')
        const state = searchParams.get('state')

        // 2. Verify state (security check)
        const storedState = localStorage.getItem('twitter_oauth_state')
        if (state !== storedState) {
          throw new Error('State verification failed')
        }

        // Clear state from localStorage
        localStorage.removeItem('twitter_oauth_state')

        if (!code) {
          throw new Error('No authorization code received')
        }

        // 3. Exchange code for access token (server-side endpoint)
        const tokenResponse = await fetch('/api/x/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        })

        if (!tokenResponse.ok) {
          const errorData = await tokenResponse.json()
          throw new Error(
            errorData.message || 'Failed to exchange code for token'
          )
        }

        const tokenData = await tokenResponse.json()

        // 4. Get user data
        const userResponse = await fetch(
          `/api/x/user?profile=${localStorage.getItem('profileId')}`,
          {
            headers: {
              Authorization: `Bearer ${tokenData.access_token}`,
            },
          }
        )

        if (!userResponse.ok) {
          const errorData = await userResponse.json()
          throw new Error(errorData.message || 'Failed to fetch user data')
        }

        window.location.href = `/${localStorage.getItem('profileId')}`
      } catch (error) {
        console.error('Twitter callback error:', error)
        setError(
          error instanceof Error ? error.message : 'Unknown error occurred'
        )
      }
    }

    handleTwitterCallback()
  }, [router, searchParams])

  if (error) {
    return (
      <MainContentWrapper>
        <h1 className="text-xl font-bold mb-4">
          Unexpected Authentication Error
        </h1>
        <p className="text-destructive">{error}, Please try again.</p>
      </MainContentWrapper>
    )
  }

  return (
    <MainContentWrapper>
      <Spinner />
    </MainContentWrapper>
  )
}
