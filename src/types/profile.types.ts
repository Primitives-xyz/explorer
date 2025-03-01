export interface SuggestedProfile {
  profile?: {
    username?: string
    namespace?: string
    image?: string | null
    bio?: string
    hasSeenProfileSetupModal?: boolean
  }
  namespace?: {
    name: string
    readableName: string
    faviconURL?: string | null
  }
}

export interface SuggestedUsername {
  username: string
  namespace: string
  readableName: string
  faviconURL?: string | null
  image?: string | null
}
