import { mutate } from 'swr'

const PUDGY_PROFILE_CREATED_KEY = 'pudgy_profile_created'
const PUDGY_MODAL_SEEN_KEY = 'pudgy_modal_seen'

export const pudgyStorage = {
  // Check if user has created a Pudgy profile
  hasCreatedPudgyProfile: (username: string): boolean => {
    if (typeof window === 'undefined') return false
    const value = localStorage.getItem(
      `${PUDGY_PROFILE_CREATED_KEY}_${username}`
    )
    return value === 'true'
  },

  // Mark that user has created a Pudgy profile
  setHasCreatedPudgyProfile: (username: string): void => {
    if (typeof window === 'undefined') return
    localStorage.setItem(`${PUDGY_PROFILE_CREATED_KEY}_${username}`, 'true')
  },

  // Check if user has seen the modal (for this session)
  hasSeenModal: (username: string): boolean => {
    if (typeof window === 'undefined') return false
    const value = sessionStorage.getItem(`${PUDGY_MODAL_SEEN_KEY}_${username}`)
    return value === 'true'
  },

  // Mark that user has seen the modal (using sessionStorage for session-based tracking)
  setHasSeenModal: (username: string): void => {
    if (typeof window === 'undefined') return
    sessionStorage.setItem(`${PUDGY_MODAL_SEEN_KEY}_${username}`, 'true')
  },

  // Clear all Pudgy storage for a user (useful for testing)
  clearPudgyStorage: (username: string): void => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(`${PUDGY_PROFILE_CREATED_KEY}_${username}`)
    sessionStorage.removeItem(`${PUDGY_MODAL_SEEN_KEY}_${username}`)
  },

  // Force refresh all profile-related SWR caches
  invalidateProfileCache: async () => {
    // Invalidate all profile-related endpoints
    await mutate(
      (key) => typeof key === 'string' && key.includes('profiles'),
      undefined,
      { revalidate: true }
    )
  },
}
