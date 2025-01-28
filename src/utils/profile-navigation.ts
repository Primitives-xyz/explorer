import { useRouter } from 'next/navigation'
import { isValidUrl } from './validation'

export const handleProfileNavigation = (
  profile: {
    namespace: {
      name: string
      userProfileURL?: string
    }
    profile: {
      username: string
    }
  },
  router: ReturnType<typeof useRouter>,
) => {
  // nemoapp is the namespace for the explorer app, redirect to in-app profile.
  if (profile.namespace.name === 'nemoapp') {
    router.push(`/${profile.profile.username}`)
    return
  }

  const userProfileURL = profile.namespace.userProfileURL
  if (userProfileURL) {
    // Check if the URL contains a query parameter pattern
    const hasQueryParams = userProfileURL.includes('?')

    // For URLs with query parameters, just append the username to the existing URL
    const finalUrl = hasQueryParams
      ? `${userProfileURL}${profile.profile.username}`
      : `${userProfileURL}/${profile.profile.username}`

    if (isValidUrl(finalUrl)) {
      window.open(finalUrl, '_blank')
      return
    }
  }
}
