'use client'

import { Button } from '@/components/ui'
import { pudgyStorage } from '@/utils/pudgy-cookies'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { RefreshCw, Trash2 } from 'lucide-react'
import { usePudgyProfileStatus } from '../hooks/use-pudgy-profile-status'

export function PudgyDebugPanel() {
  const { mainProfile, refetch } = useCurrentWallet()
  const status = usePudgyProfileStatus()

  if (!mainProfile) return null

  const handleClearStorage = () => {
    pudgyStorage.clearPudgyStorage(mainProfile.username)
    window.location.reload()
  }

  const handleForceRefresh = async () => {
    await pudgyStorage.invalidateProfileCache()
    await refetch()
  }

  return (
    <div className="fixed bottom-4 right-4 bg-background border rounded-lg shadow-lg p-4 space-y-3 max-w-sm z-50">
      <h3 className="font-semibold text-sm">Pudgy Debug Panel</h3>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Username:</span>
          <span className="font-mono">{mainProfile.username}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">Has Profile (Server):</span>
          <span
            className={
              mainProfile.pudgy_profile_date ? 'text-green-500' : 'text-red-500'
            }
          >
            {mainProfile.pudgy_profile_date ? 'Yes' : 'No'}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">Has Profile (Local):</span>
          <span
            className={
              pudgyStorage.hasCreatedPudgyProfile(mainProfile.username)
                ? 'text-green-500'
                : 'text-red-500'
            }
          >
            {pudgyStorage.hasCreatedPudgyProfile(mainProfile.username)
              ? 'Yes'
              : 'No'}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">
            Has Seen Modal (Session):
          </span>
          <span
            className={
              pudgyStorage.hasSeenModal(mainProfile.username)
                ? 'text-green-500'
                : 'text-red-500'
            }
          >
            {pudgyStorage.hasSeenModal(mainProfile.username) ? 'Yes' : 'No'}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">
            Has Seen Modal (Profile):
          </span>
          <span
            className={
              mainProfile.hasSeenPudgyOnboardingModal
                ? 'text-green-500'
                : 'text-red-500'
            }
          >
            {mainProfile.hasSeenPudgyOnboardingModal ? 'Yes' : 'No'}
          </span>
        </div>

        <hr className="my-2" />

        <div className="flex justify-between">
          <span className="text-muted-foreground">Should Show Banner:</span>
          <span
            className={
              status.shouldShowBanner ? 'text-yellow-500' : 'text-gray-500'
            }
          >
            {status.shouldShowBanner ? 'Yes' : 'No'}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">Should Show Modal:</span>
          <span
            className={
              status.shouldShowModal ? 'text-yellow-500' : 'text-gray-500'
            }
          >
            {status.shouldShowModal ? 'Yes' : 'No'}
          </span>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handleForceRefresh}
          className="flex-1"
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          Refresh
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleClearStorage}
          className="flex-1 text-destructive hover:text-destructive"
        >
          <Trash2 className="w-3 h-3 mr-1" />
          Clear
        </Button>
      </div>
    </div>
  )
}
