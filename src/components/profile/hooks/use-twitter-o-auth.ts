import { TWITTER_REDIRECT_URL } from '@/utils/constants'
import { useRouter } from 'next/navigation'

export function useTwitterOAuth() {
  const router = useRouter()

  const initiateTwitterLogin = (explorerProfileId?: string) => {
    try {
      if (!explorerProfileId) {
        throw new Error(
          'Explorer profile not found! You must create an explorer profile before adding a twitter profile'
        )
      }

      const state = Math.random().toString(36).substring(2, 15)
      localStorage.setItem('twitter_oauth_state', state)
      localStorage.setItem('profileId', explorerProfileId)

      const authUrl = new URL('https://twitter.com/i/oauth2/authorize')
      authUrl.searchParams.append('response_type', 'code')
      authUrl.searchParams.append(
        'client_id',
        'WVBrRlBhVHQxNWEwNUpwb1loUUI6MTpjaQ'
      )
      authUrl.searchParams.append(
        'redirect_uri',
        `${window.location.origin}${TWITTER_REDIRECT_URL}`
      )
      authUrl.searchParams.append(
        'scope',
        'tweet.read users.read offline.access'
      )
      authUrl.searchParams.append('state', state)
      authUrl.searchParams.append('code_challenge', 'challenge') // Remplacer par challenge PKCE réel
      authUrl.searchParams.append('code_challenge_method', 'plain')

      router.push(authUrl.toString())
    } catch (error) {
      console.error('Twitter login error:', error)
    }
  }

  return {
    initiateTwitterLogin,
  }
}
