'use client'

import { useUpdateProfile } from '@/components/tapestry/hooks/use-update-profile'
import { Button } from '@/components/ui'
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
          refetch()
        })
      }
    >
      Reset Profile
    </Button>
  )
}
