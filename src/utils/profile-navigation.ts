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
    // Check if URL ends with a slash
    const separator = userProfileURL.includes('?')
      ? userProfileURL.includes('=')
        ? '&'
        : '='
      : userProfileURL.endsWith('/')
      ? ''
      : '/'

    const finalUrl = `${userProfileURL}${separator}${profile.profile.username}`

    if (isValidUrl(finalUrl)) {
      window.open(finalUrl, '_blank')
      return
    }
  }
}
