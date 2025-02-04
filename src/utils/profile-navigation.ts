import { EXPLORER_NAMESPACE } from '@/lib/constants'
import type { Profile } from './api'

export function handleProfileNavigation(profile: Profile, router: any): void {
  if (!profile.namespace) {
    console.error('Profile namespace is missing')
    return
  }

  // Explorer app is the namespace for the explorer app, redirect to in-app profile.
  if (profile.namespace.name === EXPLORER_NAMESPACE) {
    router.push(`/${profile.profile.username}`)
    return
  }

  // For other namespaces, redirect to their profile URL if available
  if (profile.namespace.userProfileURL) {
    window.open(profile.namespace.userProfileURL, '_blank')
    return
  }

  // Fallback to namespace view
  router.push(`/namespace/${profile.namespace.name}`)
}
