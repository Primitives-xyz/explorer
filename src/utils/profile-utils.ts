import { EXPLORER_NAMESPACE } from '@/utils/constants'
import { route } from '@/utils/route'

interface ProfileWithNamespace {
  profile: {
    id: string
    username: string
  }
  namespace: {
    name: string
    userProfileURL?: string
  }
  wallet?: {
    address: string
  }
  walletAddress?: string
}

export function getProfileUrl(profile: ProfileWithNamespace): string {
  let url: string

  // Explorer namespace uses internal routing
  if (profile.namespace.name === EXPLORER_NAMESPACE) {
    return route('entity', {
      id: profile.profile.username,
    })
  }

  // If namespace has a custom profile URL
  if (profile.namespace.userProfileURL) {
    const identifier =
      profile.namespace.name === 'tribe.run' &&
      (profile.wallet?.address || profile.walletAddress)
        ? profile.wallet?.address || profile.walletAddress
        : profile.profile.username

    // Ensure no double slashes by removing trailing slash from base URL
    const baseUrl = profile.namespace.userProfileURL.replace(/\/$/, '')
    url = `${baseUrl}/${identifier}`
  }
  // Default URL construction
  else if (profile.namespace.name) {
    url = `/${profile.namespace.name}/${profile.profile.username}`
  }
  // Fallback when namespace name is empty
  else {
    url = `/${profile.profile.username}`
  }

  // Clean up any double slashes (except after protocol like https://)
  return url.replace(/([^:]\/)\/+/g, '$1')
}

export function isExternalProfile(namespaceName: string): boolean {
  return namespaceName !== EXPLORER_NAMESPACE
}
