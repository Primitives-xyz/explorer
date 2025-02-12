import { EXPLORER_NAMESPACE } from '@/lib/constants'
import type { ProfileSearchResult } from '@/types'
import { route } from '@/utils/routes'
import type { Profile } from './api'

function isProfileSearchResult(
  profile: Profile | ProfileSearchResult
): profile is ProfileSearchResult {
  return (
    'namespace' in profile &&
    'profile' in profile &&
    typeof (profile as ProfileSearchResult).namespace.name === 'string'
  )
}

export function handleProfileNavigation(
  profile: Profile | ProfileSearchResult,
  router: any
): void {
  // Handle ProfileSearchResult type
  if (isProfileSearchResult(profile)) {
    if (profile.namespace.name === EXPLORER_NAMESPACE) {
      router.push(route('address', { id: profile.profile.username }))
      return
    }

    // For other namespaces, redirect to their profile URL if available
    if (profile.namespace.userProfileURL) {
      const url = `${profile.namespace.userProfileURL.replace(/\/?$/, '/')}${
        profile.profile.username
      }`
      window.open(url, '_blank')
      return
    }

    // Fallback to namespace view
    router.push(route('namespace', { namespace: profile.namespace.name }))
    return
  }

  // Handle Profile type
  if (!profile.namespace) {
    console.error('Profile namespace is missing')
    return
  }

  // Explorer app is the namespace for the explorer app, redirect to in-app profile.
  if (profile.namespace.name === EXPLORER_NAMESPACE) {
    router.push(route('address', { id: profile.profile.username }))
    return
  }

  // For other namespaces, redirect to their profile URL if available
  if (profile.namespace.userProfileURL) {
    const url = `${profile.namespace.userProfileURL.replace(/\/?$/, '/')}${
      profile.profile.username
    }`
    window.open(url, '_blank')
    return
  }

  // Fallback to namespace view
  router.push(route('namespace', { namespace: profile.namespace.name }))
}
