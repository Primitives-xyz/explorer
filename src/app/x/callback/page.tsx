'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Spinner } from '@/components/ui'
import { socialfi } from '@/utils/socialfi'
import { profile } from 'console'

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
          throw new Error(errorData.message || 'Failed to exchange code for token')
        }
        
        const tokenData = await tokenResponse.json()

        // 4. Get user data
        const userResponse = await fetch(`/api/x/user?profile=${localStorage.getItem('profileId')}`, {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
          },
        })
        console.log("🚀 ~ userResponse ~ userResponse:", userResponse)
        
        if (!userResponse.ok) {
          const errorData = await userResponse.json()
          throw new Error(errorData.message || 'Failed to fetch user data')
        }
        
        const userData = await userResponse.json()
        
        // 5. Store user data in localStorage or state management
        localStorage.setItem('twitter_user_data', JSON.stringify({
          id: userData.id,
          username: userData.username,
        // bio: userData.description,
        // image: userData.profile_image_url,
        }))
                

        // 6. Redirect to Dynamic Auth 
       router.push(`https://app.dynamicauth.com/api/v0/sdk/ab6ac670-0b93-4483-86a5-d0eff1dfca10/providers/twitter/redirect?code={code}&state={state}`)
        
      } catch (error) {
        console.error('Twitter callback error:', error)
        setError(error instanceof Error ? error.message : 'Unknown error occurred')
      }
    }

    handleTwitterCallback()
  }, [router, searchParams])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-xl font-bold mb-4">Unexpected Authentication Error</h1>
        <p className="text-red-500">{error}, Please try again.</p>
      </div>
    )
  }

  return (
		<div className="h-20 flex items-center justify-center">
		<Spinner />
	</div>
  )
}
