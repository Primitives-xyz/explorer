'use client'

import { useUpdateProfile } from '@/components/tapestry/hooks/use-update-profile'
import { Button } from '@/components/ui'
import { pudgyStorage } from '@/utils/pudgy-cookies'
import { useCurrentWallet } from '@/utils/use-current-wallet'

export function ResetProfileButton() {
  const { mainProfile, refetch } = useCurrentWallet()
  const { updateProfile } = useUpdateProfile({
    profileId: mainProfile?.username || '',
  })

  return (
    <Button
      onClick={() =>
        updateProfile({
          properties: [
            {
              key: 'userRevealedTheSolidScore',
              value: false,
            },
            {
              key: 'hasSeenPudgyOnboardingModal',
              value: false,
            },
          ],
        }).then(() => {
          // Clear pudgy storage when resetting profile
          if (mainProfile?.username) {
            pudgyStorage.clearPudgyStorage(mainProfile.username)
          }
          refetch()
        })
      }
    >
      Reset Profile
    </Button>
  )
}
