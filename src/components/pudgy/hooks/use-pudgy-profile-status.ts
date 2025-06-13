import { pudgyStorage } from '@/utils/pudgy-cookies'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { useMemo } from 'react'

export function usePudgyProfileStatus() {
  const { mainProfile, loading } = useCurrentWallet()

  const status = useMemo(() => {
    if (!mainProfile) {
      return {
        shouldShowBanner: false,
        shouldShowModal: false,
        hasPudgyProfile: false,
        hasSeenModal: false,
        loading,
      }
    }

    // Check both server data and local storage
    const hasProfileDate = !!mainProfile.pudgy_profile_date
    const hasCreatedProfileLocally = pudgyStorage.hasCreatedPudgyProfile(
      mainProfile.username
    )
    const hasSeenModalThisSession = pudgyStorage.hasSeenModal(
      mainProfile.username
    )
    const hasSeenModalOnProfile = !!mainProfile.hasSeenPudgyOnboardingModal

    // User has a pudgy profile if either server or local storage says so
    const hasPudgyProfile = hasProfileDate || hasCreatedProfileLocally

    // Show banner only if user doesn't have a profile
    const shouldShowBanner = !hasPudgyProfile

    // Show modal only if all conditions are met
    const shouldShowModal =
      !hasPudgyProfile && !hasSeenModalThisSession && !hasSeenModalOnProfile

    return {
      shouldShowBanner,
      shouldShowModal,
      hasPudgyProfile,
      hasSeenModal: hasSeenModalThisSession || hasSeenModalOnProfile,
      loading,
    }
  }, [mainProfile, loading])

  return status
}
