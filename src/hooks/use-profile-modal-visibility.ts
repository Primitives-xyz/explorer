import { IGetProfilesResponse } from '@/types/profile.types'
import { EXPLORER_NAMESPACE } from '@/utils/constants'
import { useCallback, useEffect, useMemo, useState } from 'react'

const MAX_DAYS_SHOW_UPDATE_PROFILE_MODAL = 5

interface UseProfileModalVisibilityProps {
  walletAddress: string | undefined
  mainUsername: string | undefined
  loadingProfiles: boolean
  profiles: IGetProfilesResponse[] | null
  forceOpen?: boolean
  updateProfileSetupModalShownStatus: (walletAddress: string) => Promise<void>
}

export function useProfileModalVisibility({
  walletAddress,
  mainUsername,
  loadingProfiles,
  profiles,
  forceOpen,
  updateProfileSetupModalShownStatus,
}: UseProfileModalVisibilityProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const isProfileSetup = useCallback(() => {
    const MODAL_CREATE_PROFILE_PREFIX = 'create_profile_modal_'
    if (!profiles) return true

    if (profiles && profiles.length > 0) {
      const profile = profiles.find((profile: IGetProfilesResponse) => {
        return (
          profile.namespace?.name == EXPLORER_NAMESPACE &&
          profile.profile?.username === mainUsername
        )
      })

      if (profile?.profile.hasSeenProfileSetupModal) return true
    }

    if (
      !mainUsername ||
      mainUsername === walletAddress ||
      walletAddress?.substring(0, 30).toLowerCase() ==
        mainUsername?.toLowerCase()
    ) {
      // username only allows first 30 chars so it might be a substring of the walletAddress. Also username depending where its created can be lowercase
      const initialTimestamp = localStorage.getItem(
        `${MODAL_CREATE_PROFILE_PREFIX}${walletAddress}`
      )
      const currentTime = Date.now()

      // If this is the first time showing the modal, set the initial timestamp
      if (!initialTimestamp) {
        localStorage.setItem(
          `${MODAL_CREATE_PROFILE_PREFIX}${walletAddress}`,
          currentTime.toString()
        )
        return false
      }

      // Calculate the difference in days
      const daysSinceFirstShow =
        (currentTime - parseInt(initialTimestamp)) / (1000 * 60 * 60 * 24)

      // If it's been more than 5 days, update the backend and stop showing the modal
      if (daysSinceFirstShow > MAX_DAYS_SHOW_UPDATE_PROFILE_MODAL) {
        if (mainUsername) {
          void updateProfileSetupModalShownStatus(mainUsername) // asynchronously update the backend
        }
        return true
      }

      return false
    }
    return true
  }, [
    profiles,
    mainUsername,
    walletAddress,
    updateProfileSetupModalShownStatus,
  ])

  // For testing purposes, we'll show the modal whenever wallet is connected
  const shouldShowModal = useMemo(
    () =>
      forceOpen === true ||
      (!!walletAddress && !loadingProfiles && !isProfileSetup()),
    [walletAddress, loadingProfiles, isProfileSetup, forceOpen]
  )

  useEffect(() => {
    setIsModalOpen(shouldShowModal)
  }, [shouldShowModal])

  return {
    isModalOpen,
    setIsModalOpen,
  }
}
