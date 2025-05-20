'use client'

import { useSolidScoreLeaderboard } from '@/components/solid-score/hooks/use-solid-score-leaderboard'

import { SolidScoreShareDialog } from '@/components/solid-score/leaderboard/solid-score-share-dialog'
import { Button, ButtonSize } from '@/components/ui'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { useState } from 'react'
import { DataTableLeaderboard } from './data-table-leaderboard'
import { DataTableUserPosition } from './data-table-user-position'

export function LeaderboardContent() {
  const { data, loading } = useSolidScoreLeaderboard()
  const { mainProfile } = useCurrentWallet()
  const [open, setOpen] = useState(false)

  const hasRevealedShare = !!mainProfile?.userHasClickedOnShareHisSolidScore

  const isUserInTopList = data?.some(
    (item) => item.username === mainProfile?.username
  )

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Leaderboard</h1>
      <div className="space-y-4 relative">
        <div className={hasRevealedShare ? '' : 'blur-sm pointer-events-none'}>
          <DataTableLeaderboard
            data={data ?? []}
            loading={loading}
            currentUsername={mainProfile?.username}
          />
          {mainProfile && !isUserInTopList && <DataTableUserPosition />}
        </div>
        {!hasRevealedShare && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Button onClick={() => setOpen(true)} size={ButtonSize.LG}>
              Share your SOLID score
            </Button>
          </div>
        )}
        {hasRevealedShare && (
          <Button
            onClick={() => setOpen(true)}
            className="w-full"
            size={ButtonSize.LG}
          >
            Share your SOLID score
          </Button>
        )}
      </div>
      <SolidScoreShareDialog open={open} setOpen={setOpen} />
    </div>
  )
}
